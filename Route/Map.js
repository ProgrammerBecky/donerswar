import { Node } from './Node.js';

export class Map {
	
	constructor({
		data,
		canvas,
	}) {
		
		this.context = canvas.getContext('2d');
		this.context.putImageData( data , 0,0 );

		this.width = canvas.width;
		this.height = canvas.height;

		this.pixelData = data;
		this.buildNodeMap();
		
	}
	
	buildNodeMap() {
		
		let index = 0;
		this.nodes = [];
		
		for( let height=0 ; height<this.height ; height++ ) {
			this.nodes[ height ] = [];
			for( let width=0 ; width<this.width ; width ++ ) {
				this.nodes[ height ][ width ] = ( this.pixelData.data[ index+2 ] > 0 )
					? 255 / this.pixelData.data[ index+2 ]
					: 0;
				index += 4;
			}
		}
	}
	
	getNeighboursOf({ node }) {
		
		const x = node.x;
		const z = node.z;

		if( this.nodes[z][x] === 0 ) return [];

		let neighbours = [];
		
		if( x>0 && this.nodes[z][x-1] > 0 ) {
			neighbours.push(
				new Node({
					x: x-1,
					z: z,
					localCost: this.nodes[z][x-1],
					cost: node.cost,
					parent: node,
				})
			);
		}
		if( x<this.width-1 && this.nodes[z][x+1] > 0 ) {
			neighbours.push(
				new Node({
					x: x+1,
					z: z,
					localCost: this.nodes[z][x+1],
					cost: node.cost,
					parent: node,
				})
			);
		}

		if( z>0 && this.nodes[z-1][x] > 0 ) {
			neighbours.push(
				new Node({
					x: x,
					z: z-1,
					localCost: this.nodes[z-1][x],
					cost: node.cost,
					parent: node,
				})
			);
		}
		if( z<this.height-1 && this.nodes[z+1][x] > 0 ) {
			neighbours.push(
				new Node({
					x: x,
					z: z+1,
					localCost: this.nodes[z+1][x],
					cost: node.cost,
					parent: node,
				})
			);
		}
		
		return neighbours;

	}
	
	showFlowMap({ flow }) {

		const mapData = new ImageData(
			new Uint8ClampedArray( this.pixelData.data ),
			this.width,
			this.height,
		);		

		for( let h=0 ; h<this.height ; h++ ) {
			for( let w=0 ; w<this.width ; w++ ) {
			
				const index = ((h*this.width)+w)*4;
				if( flow[h][w] === 'IMPASSABLE' ) {
					mapData.data[index+0] = 255;
					mapData.data[index+1] = 0;
					mapData.data[index+2] = 0;
				}
				else {
					let green = 128;
					let blue = 128;
					if( flow[h][w].x > w ) blue = 255;
					if( flow[h][w].x < w ) blue = 0;
					if( flow[h][w].z > h ) green = 255;
					if( flow[h][w].z < h ) green = 0;
					mapData.data[index+0] = 0;
					mapData.data[index+1] = green;
					mapData.data[index+2] = blue;
				}
			
			}
		}
		
		this.context.putImageData( mapData , 0,0 );
		
	}
	
	showRoute({ route }) {

		const mapData = new ImageData(
			new Uint8ClampedArray( this.pixelData.data ),
			this.width,
			this.height,
		);		

		route.map( node => {
			const index = ((node.z*this.width) + node.x)*4;
			mapData.data[ index+0 ] = 0;
			mapData.data[ index+1 ] = 255;
			mapData.data[ index+2 ] = 0;
		});
		this.context.putImageData( mapData , 0,0 );
		
	}
	
	renderLists({ open, closed, route }) {
		
		const mapData = new ImageData(
			new Uint8ClampedArray( this.pixelData.data ),
			this.width,
			this.height,
		);
		
		for( let i=0 ; i<open.length ; i++ ) {
			const index = ((open[i].z*this.width) + open[i].x)*4;
			mapData.data[ index+0 ]=128;
			mapData.data[ index+3 ]=128;
		}
		for( let i=0 ; i<closed.length ; i++ ) {
			const index = ((closed[i].z*this.width) + closed[i].x)*4;
			mapData.data[ index+0 ]=0;
			mapData.data[ index+3 ]=128;
		}
		while( route.length > 0 ) {
			const node = route.shift();
			const index = ((node.z*this.width) + node.x)*4;
			mapData.data[ index+0 ] = 0;
			mapData.data[ index+1 ] = 255;
			mapData.data[ index+2 ] = 0;
		}
		this.context.putImageData( mapData , 0,0 );
				
	}
		
	
}