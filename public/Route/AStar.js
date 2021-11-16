import { Node } from './Node.js';

const ABORT_THRESHOLD = 25000;

export class AStar {
	
	constructor({ map }) {
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

		const node = new Node({
			x: sx,
			z: sz,
			localCost: 1,
			cost: 0,
			parent: false,
		});
		node.calc( dx,dz );
	
		this.open = [
			node,
		]
		this.closed = [];
		
		this.dx = dx;
		this.dz = dz;
		return this.resolve(quick);
	}
	
	resolve(quick) {

		let abort = 0;		

		while( this.open.length > 0 ) {

			abort++;
			if( abort > ABORT_THRESHOLD ) {
				console.warn( 'Route too long, returning closest find' );
				this.closed.sort( (a,b) => a.estimate > b.estimate ? 1 : -1 );
				return this.pathTo({ current: this.closed[0] });			
			}
			
			this.open.sort( (a,b) => a.total > b.total ? 1 : -1 );
			let current = this.open.shift();

			if( quick && current.x === this.dx && current.z === this.dz ) {
				return this.pathTo({ current: current });
			}

			this.closed.push( current );
			this.getNeighbours( current );
			
		}
		
		this.closed.sort( (a,b) => a.estimate > b.estimate ? 1 : -1 );
		console.warn( 'empty list expired, returning closest find' );
		return this.pathTo({ current: this.closed[0] });
		
	}
	
	pathTo({ current }) {
		
		let path = [{ x: current.x , z: current.z }];
		
		while( current.parent ) {
			current = current.parent;
			path.push({
				x: current.x,
				z: current.z,
			});
		}
		
		path.reverse();

		if( this.debug ) {
			this.map.renderLists({
				open: this.open,
				closed: this.closed,
				route: Object.assign( [] , path ),
			});
		}
		
		return path;
		
	}
	
	getNeighbours( current ) {
		const neighbours = this.map.getNeighboursOf({ node: current });
	
		for( let i=0 ; i<neighbours.length ; i++ ) {
			const cIndex = this.closed.findIndex( search => search.x === neighbours[i].x && search.z === neighbours[i].z );
		
			if( cIndex === -1 ) {
				const oIndex = this.open.findIndex( search => search.x === neighbours[i].x && search.z === neighbours[i].z );
				if( oIndex === -1 ) {
					neighbours[i].calc( this.dx , this.dz );
					this.open.push( neighbours[i] );
				}
				else if( neighbours[i].cost < this.open[ oIndex ].cost ) {
					neighbours[i].calc( this.dx , this.dz );
					this.open[ oIndex ] = neighbours[i];
				}
			}
			else if( neighbours[i].cost < this.closed[ cIndex ].cost ) {
				neighbours[i].calc( this.dx , this.dz );
				this.open.push( neighbours[i] );
				this.closed.splice( cIndex,1 );
			}
		}
	}
	
}