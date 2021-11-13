import * as THREE from './build/three.module.js';
import { G } from './Util/G.js';
import { FBXLoader } from './jsm/loaders/FBXLoader.js';
import { World } from './World/World.js';

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
	G.camera.rotation.set( 0 , G.camera.rotation.y += 0.01 , 0 );
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
		G.camera = new THREE.PerspectiveCamera( 45 , e.data.width / e.data.height , 1 , 500000 );
		
		G.ambient = new THREE.AmbientLight(0x888888);
		G.scene.add( G.ambient );
		
		G.camera.position.set(0,-20,0);
		G.camera.lookAt( 0,0,0 );
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