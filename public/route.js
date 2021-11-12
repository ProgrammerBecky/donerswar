import { Map } from './Route/Map.js';
import { AStar } from './Route/AStar.js';
import { FlowMap } from './Route/FlowMap.js';

let flowMap, map, astar;

onmessage = (e) => {
	
	if( e.data.type === 'init' ) {
		map = new Map({ data: e.data.mapData , canvas: e.data.canvas });
		astar = new AStar({ map: map });
		flowMap = new FlowMap({ width: e.data.mapData.width , height: e.data.mapData.height, map: map });
	}
	if( e.data.type === 'route' ) {

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

/*
function render(time) {
	requestAnimationFrame(render);
}
requestAnimationFrame(render);
*/

console.log( 'Routefinding Worker Started' );

