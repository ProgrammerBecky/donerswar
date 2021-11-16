import { Map } from './Route/Map.js';
import { AStar } from './Route/AStar.js';
import { FlowMap } from './Route/FlowMap.js';

let flowMap, map, astar;

const WORLD_SIZE = 85000;

const reduceCoords = ({ sx , sz , dx , dz }) => {
	sx = Math.floor( sx*map.width / WORLD_SIZE );
	sz = Math.floor( sz*map.height / WORLD_SIZE );
	dx = Math.floor( dx*map.width / WORLD_SIZE );
	dz = Math.floor( dz*map.height / WORLD_SIZE );
	return {sx,sz,dx,dz};
}

onmessage = (e) => {
	
	if( e.data.type === 'init' ) {
		map = new Map({ data: e.data.mapData , canvas: e.data.canvas });
		//astar = new AStar({ map: map });
		flowMap = new FlowMap({ width: e.data.mapData.width , height: e.data.mapData.height, map: map });

	}
	if( e.data.type === 'flowMap' ) {
		const { sx,sz,dx,dz } = reduceCoords({
			sx: e.data.sx , sz: e.data.sz,
			dx: e.data.dx , dz: e.data.dz,
		});
		let route = flowMap.path({
			sx: sx, sz: sz,
			dx: dx, dz: dz,
			debug: false,
			quick: false,
		});
		self.postMessage({
			type: 'flowMap',
			collection: e.data.collection,
			unit: e.data.unit,
			dx: e.data.dx,
			dz: e.data.dz,
			route: route,
		});
	}
	else if( e.data.type === 'route' ) {

		let flow = flowMap.path({
			sx: e.data.sx , sz: e.data.sz,
			dx: e.data.dx , dz: e.data.dz,
			debug: e.data.debug,
			quick: e.data.quick,			
		});
		if( e.data.debug ) map.showFlowMap({ flow });

		self.postMessage({
			type: 'route',
			flow: flow,
		});
	

/*
		let route = astar.path({
			sx: e.data.sx , sz: e.data.sz,
			dx: e.data.dx , dz: e.data.dz,
			debug: e.data.debug,
			quick: e.data.quick,
		});
		console.log( 'astar' , route.length );
			
		if( e.data.debug ) {
			console.log( 'DEBUGGING' );
			map.showRoute({ route });
		}			
*/		
		
	}
	
}


console.log( 'Routefinding Worker Started' );

