import * as THREE from './three.js/build/three.module.js';

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

let renderer, scene, camera, test;

/* Render loop */
const animate = ( time ) => {
	requestAnimationFrame( animate );
	renderer.render( scene , camera );
	test.rotation.set( test.rotation.x +0.001 , test.rotation.y + 0.002 , test.rotation.z -0.001 );
}

/* Messaging from Main Thread */
onmessage = (e) => {
	if( e.data.type === 'init' ) {
		
		let canvas = e.data.canvas;
		
		/* Polyfill canvas */
		canvas.setAttribute = (a,b) => {};
		canvas.style = { width: 0 , height: 0 };
		
		/* Init 3D Basics */
		renderer = new THREE.WebGLRenderer({
			canvas,
		});
		console.log( 'test' );
		renderer.setSize( e.data.width , e.data.height );
		renderer.setPixelRatio( e.data.pixelRatio );
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera( 45 , e.data.width / e.data.height , 1 , 1000 );
		scene.add( camera );
		
		/* Test Scene */
		const ambient = new THREE.AmbientLight(0x888888);
		scene.add( ambient );
		const geo = new THREE.BoxBufferGeometry(1,1,1);
		const mat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
		test = new THREE.Mesh( geo , mat );
		test.position.set( 0,0,5 );
		scene.add( test );
		camera.lookAt( test.position.x , test.position.y , test.position.z );
		
		/* Launch render loop */
		animate();
	}
	else if( e.data.type === 'resize' ) {
		/* Resize browser window */
		renderer.setSize( e.data.width , e.data.height );
		camera.fov = e.data.width / e.data.height;
	}
}




console.log( 'ThreeD Worker Started' );