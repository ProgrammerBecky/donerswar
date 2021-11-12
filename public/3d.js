import * as THREE from './three.js/build/three.module.js';
import { G } from './Util/G.js';
import { FBXLoader } from './three.js/examples/jsm/loaders/FBXLoader.js';
import { World } from './World/World.js';

//* ThreeJS Worker Polyfill */
THREE.ImageLoader.prototype.load = ( url, onLoad, onProgress, onError ) => {

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
			canvas,
		});
		
		G.renderer.setSize( e.data.width , e.data.height );
		G.renderer.setPixelRatio( e.data.pixelRatio );
		G.scene = new THREE.Scene();
		G.camera = new THREE.PerspectiveCamera( 45 , e.data.width / e.data.height , 1 , 1000 );
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
}

console.log( 'ThreeD Worker Started' );