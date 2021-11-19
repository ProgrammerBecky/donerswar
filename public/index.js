import { Control } from '/Main/control.js';
import { NavBuilder } from '/Main/NavBuilder.js';
import { Zombie } from './Main/Zombie.js';
import { UIInterface } from './Main/UIInterface.js';

let zombie;

/* Initialise 3D Canvas */
const canvas = document.getElementById('ThreeD');

let offscreen = canvas.transferControlToOffscreen();

const threeD = new Worker(
	'3d.js',
	{
		type: 'module'
	},
);		
threeD.addEventListener( 'message' , e => {
	if( e.data.type === 'initialised' ) {
		/* Zombie Spawner */
		zombie = new Zombie({ threeD , route });
		animate();
	}
	else if( e.data.type === 'mech-navigate' ) {
		if( e.data.target ) {
			route.postMessage({
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
	else if( e.data.type === 'update-route' ) {
		route.postMessage({
			type: 'update-route',
			route: e.data.route,
		});
	}
});
threeD.postMessage({
	type: 'init',
	canvas: offscreen,
	width: canvas.clientWidth,
	height: canvas.clientHeight,
	pixelRatio: window.devicePixelRatio,
} , [ offscreen ]);
const ui = new UIInterface({ threeD });
const control = new Control({ threeD, ui });


/* Browser Resizing */
const windowResize = () => {
	threeD.postMessage({
		type: 'resizeCanvas',
		width: canvas.clientWidth,
		height: canvas.clientHeight
	});
}
window.addEventListener( 'resize' , windowResize );

/* Setup Navigation */
let flow;
const route = new Worker(
	'route.js',
	{
		type: 'module'
	},
);		
route.addEventListener( 'message' , e => {
	if( e.data.type === 'flowMap' ) {
		threeD.postMessage({
			type: 'mech-route-flowMap',
			collection: e.data.collection,
			unit: e.data.unit,
			dx: e.data.dx,
			dz: e.data.dz,
			route: e.data.route,
		});
	}
	else {
		flow = e.data.flow;
	}
});
const navBuilder = new NavBuilder({
	threeD: threeD,
	route: route,
});

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

/* Routefinding Sample */
/*			
let dots = [];

const SPEED = 0.5;

const newDot = () => {
	const i = dots.length;
	dots[i] = {};
	dots[i].x = Math.random() * 128;
	dots[i].z = Math.random() * 128;
	dots[i].div = document.createElement('div');
	dots[i].div.style.position = 'absolute';
	dots[i].div.style.borderRadius='50%';
	dots[i].div.style.height = '5px';
	dots[i].div.style.width = '5px';
	dots[i].div.style.transform = 'translateX(-50%) translateY(-50%)';
	dots[i].div.style.backgroundColor = 'gold';
	dots[i].div.style.zIndex = 2;
	document.body.appendChild( dots[i].div );
}

const animate = (time) => {
	requestAnimationFrame( animate );
	
	if( flow ) {
		if( Math.random() < 0.5 ) newDot();
		let removeList = [];

		for( let i=0 ; i<dots.length ; i++ ) {
		
			let x = Math.ceil( dots[i].x );
			let z = Math.ceil( dots[i].z );
			if( flow[z] && flow[z][x] ) {
				if( flow[z][x] === 'DESTINATION' ) {
					removeList.push(i);
				}
				let dx = flow[z][x].x;
				let dz = flow[z][x].z;
				let df = Math.atan2( dx-x , dz-z );
				
				dots[i].x = dots[i].x + Math.sin( df ) * SPEED;
				dots[i].z = dots[i].z + Math.cos( df ) * SPEED;
				
				dots[i].div.style.left = dots[i].x + 'px';
				dots[i].div.style.top = dots[i].z + 'px';
			}
		}
		
		while( removeList.length > 0 ) {
			const i = removeList.shift();
			document.body.removeChild( dots[i].div );
			dots.splice(i,1);
		}
	}
}
animate();
*/

/*




const maze = new Image();
maze.onload = (obj) => {

	const canvas = document.createElement( 'canvas' );
	canvas.style.position = 'absolute';
	canvas.style.top = 0;
	canvas.style.left = 0;
	canvas.style.opacity = 0.5;
	canvas.width = obj.srcElement.width;
	canvas.height = obj.srcElement.height;
	document.getElementById('Content').appendChild( canvas );
	const offscreen = canvas.transferControlToOffscreen();
	
	const dataCanvas = document.createElement( 'canvas' );
	dataCanvas.width = obj.srcElement.width;
	dataCanvas.height = obj.srcElement.height;
	const context = dataCanvas.getContext('2d');
	context.drawImage( obj.srcElement, 0,0 );
	const data = context.getImageData( 0,0, dataCanvas.width,dataCanvas.height );
	
	route.postMessage({
		type:	'init',
		canvas: offscreen,
		mapData: data,
	} , [offscreen]);

	setTimeout( () => {
		route.postMessage({
			type:	'route',
			sx: 0, sz: 0,
			dx: 256, dz: 128,
			debug: false,
			quick: true,
		});
	} , 1 );
}

maze.src = 'maze4.png';


let lastX = 0;
let lastZ = 0;
const click = (e) => {
	route.postMessage({
		type:	'route',
		sx: lastX, sz: lastZ,
		dx: e.clientX, dz: e.clientY,
		debug: false,
		quick: true,
	});			
	lastX = e.clientX;
	lastZ = e.clientY;
}
window.addEventListener( 'mousedown' , click );
*/
