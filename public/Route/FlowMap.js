const IMPASSABLE_NODE = 65536;

export class FlowMap{

	constructor({ width, height, map }) {
	
		this.width = width;
		this.height = height;
		this.map = map;
		
	}
	
	path({
		sx, sz,
		dx, dz,
		debug=false,
		quick=false,
	}) {

		this.debug = debug;

		sx = Math.min( Math.max(0,sx) , this.map.width-1 );
		sz = Math.min( Math.max(0,sz) , this.map.height-1 );
		dx = Math.min( Math.max(0,dx) , this.map.width-1 );
		dz = Math.min( Math.max(0,dz) , this.map.height-1 );

		return this.buildFlowMap({
			sx,sz, dx,dz, debug, quick
		});
	
	}
	buildFlowMap({
		sx,sz, dx,dz, debug, quick
	}) {

		const node = {
			x: dx,
			z: dz,
			cost: 0,
		};
	
		this.open = [
			node,
		]
		
		this.dx = dx;
		this.dz = dz;
		
		if( quick ) {
			let rng = Math.max( Math.max( Math.abs( dx-sx ) , Math.abs( dz-sz ) ) , 128 );
			
			this.bounds = {
				min: {
					x: Math.max( 0 , Math.min( sx-rng , dx-rng ) ),
					z: Math.max( 0 , Math.min( sz-rng , dz-rng ) ),
				},
				max: {
					x: Math.min( this.width , Math.max( sx+rng , dx+rng ) ),
					z: Math.min( this.height , Math.max( sz+rng , dz+rng ) ),
				},
			};
		}
		else {
			this.bounds = {
				min: {
					x: 0,
					z: 0,
				},
				max: {
					x: this.width,
					z: this.height,
				},
			};
		}

		this.buildIntegrationLayer();
		this.buildFlowLayer();
		
		return this.flow;
		
	}
	
	buildFlowLayer() {
		
		this.flow = [];
		for( let h=this.bounds.min.z ; h<this.bounds.max.z ; h++ ) {
			this.flow[h] = [];
			for( let w=this.bounds.min.x ; w<this.bounds.max.x ; w++ ) {
				this.flow[h][w] = false;
			}
		}
		
		for( let h=this.bounds.min.z ; h<this.bounds.max.z ; h++ ) {
			for( let w=this.bounds.min.x ; w<this.bounds.max.x ; w++ ) {

				if( this.route[h][w] === 0 ) {
					this.flow[h][w] = 'DESTINATION';
				}
				else {
				
					this.neighbours = [];
					if( h>0 ) this.addNeighbour({
						direction: {z:h-1, x:w},
						score: this.route[h-1][w],
					});
					if( w>0 ) this.addNeighbour({
						direction: {z:h, x:w-1},
						score: this.route[h][w-1]
					});
					if( h<this.height-1 ) this.addNeighbour({
						direction: {z:h+1, x:w},
						score: this.route[h+1][w]
					});
					if( w<this.width-1 ) this.addNeighbour({
						direction: {z:h, x:w+1},
						score: this.route[h][w+1]
					});
					if( h>0 && w>0 ) this.addNeighbour({
						direction: {z:h-1, x:w-1},
						score: this.route[h-1][w-1]
					});
					if( h<this.height-1 && w>0 ) this.addNeighbour({
						direction: {z:h+1, x:w-1},
						score: this.route[h+1][w-1]
					});
					if( h<this.height-1 && w<this.width-1 ) this.addNeighbour({
						direction: {z:h+1, x:w+1},
						score: this.route[h+1][w+1]
					});
					if( h>0 && w<this.width-1 ) this.addNeighbour({
						direction: {z:h-1, x:w+1},
						score: this.route[h-1][w+1]
					});
						
					if( this.neighbours.length > 0 ) {
						this.neighbours = this.neighbours.sort( (a,b) => a.score > b.score ? 1 : -1 );
						this.flow[h][w] = this.neighbours[0].direction;
					}
					else {
						this.flow[h][w] = {x:w, z:h-1};
					}
					
				}

			}
		}
	}
	
	addNeighbour({ direction, score }) {
		if( score < IMPASSABLE_NODE && score !== false ) {
			this.neighbours.push({
				direction, score
			});
		};
	}
	
	buildIntegrationLayer() {

		this.route = [];
		for( let h=0 ; h<this.height ; h++ ) {
			this.route[h] = [];
			for( let w=0 ; w<this.width ; w++ ) {
				this.route[h][w] = false;
			}
		}
		
		while( this.open.length > 0 ) {
			
			this.open.sort( (a,b) => a.score < b.score ? -1 : 1 );
			const current = this.open.shift();
			this.route[current.z][current.x] = current.cost;
			
			if( current.x > 0 ) this.makeIntegrationNode({
				x: current.x-1, z: current.z,
				cost: current.cost +1
			});
			if( current.x < this.width-1 ) this.makeIntegrationNode({
				x: current.x+1, z: current.z,
				cost: current.cost +1
			});
			if( current.z > 0 ) this.makeIntegrationNode({
				x: current.x, z: current.z-1,
				cost: current.cost +1
			});
			if( current.z < this.height-1 ) this.makeIntegrationNode({
				x: current.x, z: current.z+1,
				cost: current.cost +1
			});
			
		}
	}
	makeIntegrationNode({x,z,cost}) {
		
		if( this.route[z][x] !== false ) return;
		
		/* TODO: Rebuild the map data in a format more optimised for flowmap,
		 * i.e. no need to check IMPASSABLE_NODE score or divide on each cycle
		 * if the map data has this burned in.
		 */
		let derivedCost = this.map.nodes[ z ][ x ];
		derivedCost = ( derivedCost === 0 )
			? cost + IMPASSABLE_NODE
			: cost + derivedCost/255;
		
		this.route[z][x] = derivedCost;
		
		if( derivedCost < IMPASSABLE_NODE ) {
			if( x >= this.bounds.min.x && x < this.bounds.max.x ) {
				if( z >= this.bounds.min.z && z < this.bounds.max.z ) {
					this.open.push({
						x: x,
						z: z,
						cost: derivedCost,
					});
				}
			}
		}
		
	}
	
}