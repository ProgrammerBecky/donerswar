import * as THREE from './build/three.module.js';
import { G } from './3D/G.js';
import { FBXLoader } from './jsm/loaders/FBXLoader.js';
import { World } from './3D/World.js';

G.MinMagFilter = THREE.NearestFilter;

//* ThreeJS Worker Polyfill */
THREE.ImageLoader.prototype.load = function ( url, onLoad, onProgress, onError ) {

	if( this.path ) url = this.path + url;

	if( this.fileLoader === undefined ) {
		this.fileLoader = new THREE.FileLoader( this.manager );
		this.fileLoader.setResponseType( 'blob' );
	}
	
	let onFileLoad = blob => {
		createImageBitmap( blob ).then( image => {
			onLoad( image );
		});
	}
	
	this.fileLoader.load( url, onFileLoad , onProgress, onError );
	
}

let world;

/* Render loop */
const animate = ( time ) => {
	requestAnimationFrame( animate );
	G.renderer.render( G.scene , G.camera );
}

/* Messaging from Main Thread */
onmessage = (e) => {
	if( e.data.type === 'init' ) {
		
		let canvas = e.data.canvas;
		
		/* Polyfill canvas */
		canvas.setAttribute = (a,b) => {};
		canvas.style = { width: 0 , height: 0 };
		
		/* Init 3D Basics */
		G.renderer = new THREE.WebGLRenderer({
			canvas: canvas,
			logarithmicDepthBuffer: true,
			antialias: true,			
		});
		
		G.renderer.setSize( e.data.width , e.data.height );
		G.renderer.setPixelRatio( e.data.pixelRatio );
		G.scene = new THREE.Scene();
		G.camera = new THREE.PerspectiveCamera( 45 , e.data.width / e.data.height , 1 , 500000 );
				
		G.ambient = new THREE.AmbientLight(0x888888);
		G.scene.add( G.ambient );
		
		G.camera.position.set(42500,5000,42500);
		G.camera.rotation.set( -Math.PI/2,0,0);
		G.camera.fov = 90;
		G.scene.add( G.camera );
		
		G.fbx = new FBXLoader();
		
		world = new World();
		
		/* Launch render loop */
		animate();
	}
	else if( e.data.type === 'resizeCanvas' ) {
		/* Resize browser window */
		G.renderer.setSize( e.data.width , e.data.height );
		G.camera.aspect = e.data.width / e.data.height;
		G.camera.updateProjectionMatrix();
	}
	else if( e.data.type === 'panView' ) {
		const multiplyer =
			( G.camera.position.y < 100 ) ? 0.1
			: ( G.camera.position.y < 1000 ) ? 1
			: 10;

		G.camera.position.set(
			G.camera.position.x - e.data.mouse.x * multiplyer,
			G.camera.position.y,
			G.camera.position.z - e.data.mouse.y * multiplyer,
		);
		console.log( G.camera.position.x , G.camera.position.z );
	}
	else if( e.data.type === 'zoomView' ) {
		const multiplyer =
			( G.camera.position.y < 100 ) ? 0.1
			: ( G.camera.position.y < 1000 ) ? 1
			: 10;
			
		G.camera.position.set(
			G.camera.position.x,
			e.data.mouse.z * multiplyer,
			G.camera.position.z,
		);
		console.log( G.camera.position.y );
	}
	else if( e.data.type === 'buildRoutes' ) {
		world.setBuildCanvas({ canvas: e.data.canvas });
	}
}

console.log( 'ThreeD Worker Started' );