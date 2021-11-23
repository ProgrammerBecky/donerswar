import * as THREE from './build/three.module.js';
import { G } from './3D/G.js';
import { FBXLoader } from './jsm/loaders/FBXLoader.js';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
import { World } from './3D/World.js';
import { Zombies } from './3D/Zombies.js';
import { Mech } from './3D/Mech.js';
import { ScreenPicker } from './3D/ScreenPicker.js';
import { Particles } from './3D/Particles.js';
import { Ants } from './3D/Ants.js';
import { Lights } from './3D/Lights.js';

const manager = new THREE.LoadingManager();
manager.onProgress = ( url , itemsLoaded , itemsTotal ) => {
	self.postMessage({
		type: 'loading',
		url: url,
		itemsLoaded: itemsLoaded,
		itemsTotal: itemsTotal,
	});
}

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

G.world = new World();
G.lights = new Lights();
G.glViewports = [];
G.viewHeight = 0;
let lastTime = 0;
let camIndex = 0;
G.frustum = [
	new THREE.Frustum(),
	new THREE.Frustum(),
	new THREE.Frustum(),
	new THREE.Frustum(),
]

/* Render loop */
let trackTime = 0;
let gameSpeed = 0;
const animate = ( time ) => {
	
	const delta = ( (time-lastTime)/1000 ) * gameSpeed;
	lastTime = time;
	
	if( ! isNaN( delta ) ) {
		
		trackTime += delta;
		if( trackTime > 0 ) {
			console.log( (1/delta).toFixed(2) + 'fps' );
			trackTime = -1;
		}
		
		G.mechs.update( delta );
		G.zombies.update( delta );
		G.world.update( delta );
		G.particles.update( delta );
		G.ants.update( delta );
		G.lights.update( delta );
		
		for( let camIndex=0 ; camIndex<4 ; camIndex++ ) {
			if( G.cameraViews.includes( camIndex ) ) {
				if( G.glViewports[camIndex] ) {
					G.camera[camIndex].updateMatrix();
					G.camera[camIndex].updateMatrixWorld();
					G.frustum[camIndex].setFromMatrix(
						new THREE.Matrix4().multiplyMatrices(
							G.camera[camIndex].projectionMatrix,
							G.camera[camIndex].matrixWorldInverse
						)
					);
			
					G.world.updateForCam( camIndex );
					G.zombies.updateForCam( camIndex );
					G.renderer.setViewport( G.glViewports[camIndex].x , G.glViewports[camIndex].y , G.glViewports[camIndex].z , G.glViewports[camIndex].w );
					G.renderer.setScissor( G.glViewports[camIndex].x , G.glViewports[camIndex].y , G.glViewports[camIndex].z , G.glViewports[camIndex].w );
					G.renderer.render( G.scene , G.camera[camIndex] );
				}
			}
		}

	}
	
	self.postMessage({
		type: 'cam',
		x: G.camera[0].position.x,
		y: G.camera[0].position.y,
		z: G.camera[0].position.z,
		f: G.camera[0].rotation.y,
	});
	requestAnimationFrame( animate );
}

const setViewports = ( width , height ) => {
	
	let hWidth = Math.floor(width/2);
	let hHeight = Math.floor(height/2);

	if( G.cameraViews.length === 4 ) {
	
		G.renderer.setSize( width, height );
		
		for( let camIndex=0 ; camIndex < 4 ; camIndex++ ) {
			if( G.camera[ camIndex ] ) {
				G.camera[camIndex].aspect = width/height;
				G.camera[camIndex].far = 20000;
				G.camera[camIndex].fov = 65;
				G.camera[camIndex].updateProjectionMatrix();
			}
		}
		
		G.viewHeight = hHeight;
		G.glViewports = [
			new THREE.Vector4( 0,hHeight,hWidth,hHeight),
			new THREE.Vector4( hWidth,hHeight,hWidth,hHeight),
			new THREE.Vector4( 0,0,hWidth,hHeight),
			new THREE.Vector4( hWidth,0,hWidth,hHeight),
		];
		G.humanViewports = [
			new THREE.Vector4( 0,0,hWidth,hHeight),
			new THREE.Vector4( hWidth,0,hWidth,hHeight),	
			new THREE.Vector4( 0,hHeight,hWidth,hHeight),
			new THREE.Vector4( hWidth,hHeight,hWidth,hHeight),
		];
		
	}
	else {
		
		let port = G.cameraViews[0];
		
		G.renderer.setSize( width , height );
		G.camera[port].aspect = width/height;
		G.camera[port].far = 100000;
		G.camera[port].fov = 45;
		G.camera[port].updateProjectionMatrix();
		
		G.glViewports = [
			new THREE.Vector4( 0,0,0,0),
			new THREE.Vector4( 0,0,0,0),
			new THREE.Vector4( 0,0,0,0),
			new THREE.Vector4( 0,0,0,0),
		];
		G.humanViewports = [
			new THREE.Vector4( 0,0,0,0),
			new THREE.Vector4( 0,0,0,0),
			new THREE.Vector4( 0,0,0,0),
			new THREE.Vector4( 0,0,0,0),
		];		
		
		G.glViewports[port] = new THREE.Vector4( 0,0,width,height );
		G.humanViewports[port] = new THREE.Vector4( 0,0,width,height );
	}
	
}

/* Messaging from Main Thread */
onmessage = (e) => {
	if( e.data.type === 'rebuild-map' ) {
		G.world.rebuildNavMap({
			canvas: e.data.canvas,
			mapData: e.data.mapData,
			width: e.data.width,
			height: e.data.height,
		});
	}
	if( e.data.type === 'cameras-on-off' ) {
		G.cameraViews = e.data.cameras;
		setViewports( e.data.width , e.data.height );
	}
	if( e.data.type === 'init' ) {
		
		let canvas = e.data.canvas;
		
		/* Polyfill canvas */
		canvas.setAttribute = (a,b) => {};
		canvas.style = { width: 0 , height: 0 };
		
		/* Init 3D Basics */
		G.renderer = new THREE.WebGLRenderer({
			canvas: canvas,
			logarithmicDepthBuffer: true,
			antialias: false,			
			preserveDrawingBuffer: true,
		});
		
		G.renderer.setScissorTest( true );			
		G.renderer.setSize( e.data.width , e.data.height );
		G.renderer.setPixelRatio( e.data.pixelRatio );
		G.scene = new THREE.Scene();
				
		G.ambient = new THREE.AmbientLight(0x444444);
		G.scene.add( G.ambient );

		/*
		G.directional = new THREE.DirectionalLight(0xa2a2a2);
		G.directional.position.set(42500,5000,-22750);
		G.directionalTarget = new THREE.Object3D();
		G.directionalTarget.position.set( -42500,0,22750 );
		G.scene.add( G.directionalTarget );
		G.directional.target = G.directionalTarget;
		G.scene.add( G.directional );
		*/

		G.cameraViews = [0,1,2,3];
		G.cameraPan = [
			new THREE.Vector2( 0 , Math.PI ),
			new THREE.Vector2( 0 , Math.PI ),
			new THREE.Vector2( 0 , Math.PI ),
			new THREE.Vector2( 0 , Math.PI ),
		];
		G.cameraZoom = [1500,1500,1500,1500];
		G.camera = [];
		for( let i=0 ; i<4 ; i++ ) {
			G.camera[i] = new THREE.PerspectiveCamera( 45 , e.data.width / e.data.height , 1 , 20000 );
			G.camera[i].position.set(42500,5000,42500);
			G.camera[i].rotation._order = 'ZYX';
			//G.camera.rotation.set( -Math.PI/2,0,0);
			G.camera[i].rotation.set(0,0,0);
			G.scene.add( G.camera[i] );
			setViewports( e.data.width , e.data.height );
		}

		G.cubeTexLoader = new THREE.CubeTextureLoader();
		G.environmentMap = G.cubeTexLoader.load([
			'/high/skybox/posz.jpg',
			'/high/skybox/negz.jpg',
			'/high/skybox/posy.jpg',
			'/high/skybox/negy.jpg',
			'/high/skybox/negx.jpg',
			'/high/skybox/posx.jpg'
		]);
		G.scene.background = G.environmentMap;
		
		G.MinMagFilter = THREE.NearestFilter;		
		G.fbx = new FBXLoader( manager );
		G.gltf = new GLTFLoader( manager );
		G.texture = new THREE.TextureLoader( manager );
		
		G.world.load();
		G.zombies = new Zombies();
		G.mechs = new Mech();
		G.particles = new Particles();
		G.ants = new Ants();
		
		G.screenPicker = new ScreenPicker();
		animate();
		gameSpeed = 0;
		
		/* Launch render loop */
		self.postMessage({
			type: 'initialised'
		});
	}
	else if( e.data.type === 'beginGame' ) {
		gameSpeed = 1;
	}
	else if( e.data.type === 'resizeCanvas' ) {
		/* Resize browser window */
		setViewports( e.data.width , e.data.height );
		//G.camera.aspect = e.data.width / e.data.height;
		//G.camera.updateProjectionMatrix();
	}
	else if( e.data.type === 'panView' ) {
		const multiplyer = 0.01;
		G.cameraPan[ e.data.mouse.cam ].x -= e.data.mouse.y * multiplyer;
		G.cameraPan[ e.data.mouse.cam ].y -= e.data.mouse.x * multiplyer;
	}
	else if( e.data.type === 'zoomView' ) {
		const multiplyer = 1;
		G.cameraZoom[ e.data.mouse.cam ] = Math.max( 1500 , G.cameraZoom[ e.data.mouse.cam ] + e.data.mouse.z * multiplyer );
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
	else if( e.data.type === 'mech-navigate' ) {
		G.mechs.newAction( e.data.unit , 'Idle' );
		self.postMessage({
			type: 'mech-navigate',
			unit: e.data.unit,
			target: G.screenPicker.lookup({ cam: e.data.cam, x: e.data.x , y: e.data.y }),
			source: { x: G.mechs.mechs[ e.data.unit ].x , z: G.mechs.mechs[ e.data.unit ].z },
		});
	}
	else if( e.data.type === 'mech-route-flowMap' ) {
		G.mechs.newRoute({
			unit: e.data.unit,
			dx: e.data.dx,
			dz: e.data.dz,
			route: e.data.route,
		});
	}
	else if( e.data.type === 'ant-route-flowMap' ) {
		G.ants.newRoute({
			unit: e.data.unit,
			dx: e.data.dx,
			dz: e.data.dz,
			route: e.data.route,
		});
	}
	else if( e.data.type === 'fire-weapon' ) {
		G.mechs.fireWeapon( e.data.mech , e.data.gunId );
	}
	else if( e.data.type === 'init-lighting' ) {
		G.lights.registerCanvas({
			canvas: e.data.canvas,
		});
	}
	else if( e.data.type === 'lightSplat' ) {
		G.lights.registerSplat({
			index: e.data.index,
			splat: e.data.splat,
			imageData: e.data.imageData,
		});
	}
	else if( e.data.type === 'spotlight' ) {
		G.mechs.spotlight( e.data.on );
	}
}

console.log( 'ThreeD Worker Started' );