import { G } from './Main/G.js';
import { Control } from '/Main/control.js';
import { NavBuilder } from '/Main/NavBuilder.js';
import { Zombie } from './Main/Zombie.js';
import { UIInterface } from './Main/UIInterface.js';
import { Mech } from './Main/Mech.js';

let zombie;

/* Initialise 3D Canvas */
const canvas = document.getElementById('ThreeD');

let offscreen = canvas.transferControlToOffscreen();

/* Start Workers */
G.threeD = new Worker(
	'3d.js',
	{
		type: 'module'
	},
);		
G.route = new Worker(
	'route.js',
	{
		type: 'module'
	},
);		


/* Setup 3D */
G.threeD.addEventListener( 'message' , e => {
	if( e.data.type === 'initialised' ) {
		/* Zombie Spawner */
		zombie = new Zombie();
		animate();
	}
	else if( e.data.type === 'mech-navigate' ) {
		if( e.data.target ) {
			G.route.postMessage({
				type: 'flowMap',
				collection: 'mech',
				unit: e.data.unit,
				dx: e.data.target.x,
				dz: e.data.target.z,
				sx: e.data.source.x,
				sz: e.data.source.z,
			});
		}
	}
	else if( e.data.type === 'ant-navigate' ) {
		G.route.postMessage({
			type: 'flowMap',
			collection: 'ant',
			unit: e.data.unit,
			dx: e.data.dx,
			dz: e.data.dz,
			sx: e.data.sx,
			sz: e.data.sz,
		});		
	}	
	else if( e.data.type === 'mech-pos' ) {
		G.mech.updateMech({ mech: e.data.mech });
	}
	else if( e.data.type === 'update-route' ) {
		G.route.postMessage({
			type: 'update-route',
			route: e.data.route,
		});
	}
});
G.threeD.postMessage({
	type: 'init',
	canvas: offscreen,
	width: canvas.clientWidth,
	height: canvas.clientHeight,
	pixelRatio: window.devicePixelRatio,
} , [ offscreen ]);


/* Setup Main Thread */
const ui = new UIInterface();
const control = new Control({ ui });
G.mech = new Mech();

/* Browser Resizing */
const windowResize = () => {
	G.threeD.postMessage({
		type: 'resizeCanvas',
		width: canvas.clientWidth,
		height: canvas.clientHeight
	});
}
window.addEventListener( 'resize' , windowResize );

/* Setup Navigation */
let flow;

G.route.addEventListener( 'message' , e => {
	if( e.data.type === 'flowMap' ) {
		
		if( e.data.collection === 'mech' ) {
			G.threeD.postMessage({
				type: 'mech-route-flowMap',
				collection: e.data.collection,
				unit: e.data.unit,
				dx: e.data.dx,
				dz: e.data.dz,
				route: e.data.route,
			});
		}
		else {
			G.threeD.postMessage({
				type: 'ant-route-flowMap',
				collection: e.data.collection,
				unit: e.data.unit,
				dx: e.data.dx,
				dz: e.data.dz,
				route: e.data.route,
			});
		}
	}
	else {
		flow = e.data.flow;
	}
});
const navBuilder = new NavBuilder();

/* Animation Loop */
let lastTime = 0;
const animate = ( time ) => {
	
	const delta = (time-lastTime)/1000;
	lastTime = time;
	
	if( ! isNaN( delta ) ) {
		if( zombie ) zombie.update( delta );
	}
	
	requestAnimationFrame( animate );
}			