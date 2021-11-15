import * as THREE from './build/three.module.js';
import { G } from './3D/G.js';
import { FBXLoader } from './jsm/loaders/FBXLoader.js';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
import { World } from './3D/World.js';
import { Zombies } from './3D/Zombies.js';
import { Mech } from './3D/Mech.js';

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

let lastTime = 0;
G.frustum = new THREE.Frustum();

/* Render loop */
const animate = ( time ) => {
	
	const delta = (time-lastTime)/1000;
	lastTime = time;
	
	G.camera.updateMatrix();
	G.camera.updateMatrixWorld();
	G.frustum.setFromMatrix(
		new THREE.Matrix4().multiplyMatrices(
			G.camera.projectionMatrix,
			G.camera.matrixWorldInverse
		)
	);
	
	if( ! isNaN( delta ) ) {
		G.renderer.render( G.scene , G.camera );
		G.zombies.update( delta );
	}
	
	requestAnimationFrame( animate );
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

		G.directional = new THREE.DirectionalLight(0xffffff);
		G.directional.position.set(-1,0,-1);
		G.scene.add( G.directional );
		
		G.camera.position.set(42500,5000,42500);
		//G.camera.rotation.set( -Math.PI/2,0,0);
		G.camera.rotation.set(0,0,0);
		G.scene.add( G.camera );
		
		G.MinMagFilter = THREE.NearestFilter;		
		G.fbx = new FBXLoader();
		G.gltf = new GLTFLoader();
		G.texture = new THREE.TextureLoader();
		
		G.world = new World();
		G.zombies = new Zombies();
		G.mech = new Mech();
		
		/* Launch render loop */
		animate();
		
		self.postMessage({
			type: 'initialised'
		});
	}
	else if( e.data.type === 'resizeCanvas' ) {
		/* Resize browser window */
		G.renderer.setSize( e.data.width , e.data.height );
		G.camera.aspect = e.data.width / e.data.height;
		G.camera.updateProjectionMatrix();
	}
	else if( e.data.type === 'panView' ) {
		const multiplyer = G.camera.position.y / 300;

		G.camera.position.set(
			G.camera.position.x - e.data.mouse.x * multiplyer,
			G.camera.position.y,
			G.camera.position.z - e.data.mouse.y * multiplyer,
		);
	}
	else if( e.data.type === 'zoomView' ) {
		const multiplyer = 1+ ( G.camera.position.y / 10000 );
			
		G.camera.position.set(
			G.camera.position.x,
			Math.max( 200 , e.data.mouse.z * multiplyer ),
			G.camera.position.z,
		);
	}
	else if( e.data.type === 'cameraView' ) {
		if( e.data.mouse.view === 'fps' ) {
			G.camera.rotation.set( 0, e.data.mouse.angle,0 );
			G.camera.fov = 45;
		}
		else {
			G.camera.rotation.set( -Math.PI/2 , 0 , 0 );
			G.camera.fov = 120;
		}
	}
	else if( e.data.type === 'buildRoutes' ) {
		world.setBuildCanvas({ canvas: e.data.canvas });
	}
	else if( e.data.type === 'spawn-zombie' ) {
		G.zombies.spawn({ zombie: e.data });
	}
	else if( e.data.type === 'update-zombie' ) {
		G.zombies.updateZombie({ updated: e.data });
	}
}

console.log( 'ThreeD Worker Started' );