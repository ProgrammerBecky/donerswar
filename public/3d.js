import * as THREE from './build/three.module.js';
import { G } from './3D/G.js';
import { FBXLoader } from './examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from './examples/jsm/loaders/GLTFLoader.js';
import { World } from './3D/World.js';
import { Mech } from './3D/Mech.js';
import { ScreenPicker } from './3D/ScreenPicker.js';
import { Particles } from './3D/Particles.js';
import { Ants } from './3D/Ants.js';
import { Lights } from './3D/Lights.js';
import { Level } from './3D/Level.js';
import { Score } from './3D/Score.js';

G.url = '/';
G.url = '//beckyrose.com/';
G.path = '/low/';

G.controls = {
	mech: 0,
	W: false,
	A: false,
	D: false,
}

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
let screenMap;
let trackTime = 0;
let gameSpeed = 0;
let audioCam = 0;
let camVector = new THREE.Vector3();

let lastCamX=0,lastCamY=0,lastCamZ=0;
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
		G.world.update( delta );
		G.particles.update( delta );
		G.ants.update( delta );
		G.lights.update( delta );
		G.level.checkLevel( delta );
		
		for( let camIndex=0 ; camIndex<4 ; camIndex++ ) {
			if( G.cameraViews.includes( camIndex ) ) {
				if( G.glViewports[camIndex] ) {
					if( G.mechs.mechs[camIndex].active || G.mechs.mechs[camIndex].inactiveTimer < 30 ) {
						if( G.cameraZoom[ camIndex ] === 1500 && G.mechs.mechs[camIndex].cockpit_bevel ) {
							const rider = G.mechs.mechs[camIndex].cockpit_bevel;
							rider.updateMatrixWorld(true);
							rider.getWorldPosition( camVector );
							G.camera[camIndex].position.set( camVector.x , camVector.y + G.mechs.mechs[camIndex].cockpitHeight , camVector.z );
							if( G.camera[ camIndex ].fov !== 120 ) {
								G.camera[camIndex].fov = 70;
								G.camera[camIndex].updateProjectionMatrix();
							}
						}
						else {
							if( G.camera[camIndex].fov !== G.camera[camIndex]._fov ) {
								G.camera[camIndex].fov = G.camera[camIndex]._fov;
								G.camera[camIndex].updateProjectionMatrix();
							}
						}
						G.camera[camIndex].updateMatrix();
						G.camera[camIndex].updateMatrixWorld();
						G.frustum[camIndex].setFromProjectionMatrix(
							new THREE.Matrix4().multiplyMatrices(
								G.camera[camIndex].projectionMatrix,
								G.camera[camIndex].matrixWorldInverse
							)
						);
				
						G.world.updateForCam( camIndex );
						if( G.cockpit && G.mechs.mechs[ camIndex ].cockpit_bevel && G.mechs.mechs[camIndex].cockpit_object ) {
							if( G.cameraZoom[ camIndex ] === 1500 ) {
								G.cockpit.visible = true;
								G.cockpit.position.set( G.camera[camIndex].position.x , G.camera[camIndex].position.y , G.camera[camIndex].position.z );
								let rotation = G.mechs.mechs[ camIndex ].ent.rotation.y + G.mechs.mechs[ camIndex ].cockpit_bevel.rotation.y
								G.cockpit.rotation.set( G.cameraPan[camIndex].x * 0.8 , Math.PI + rotation , 0 );
								G.mechs.mechs[camIndex].cockpit_object.children[1].visible = false;
								screenMap.rotation =  G.mechs.mechs[ camIndex ].cockpit_bevel.rotation.y;
							}
							else {
								G.cockpit.visible = false;
							}
						}
						G.renderer.setViewport( G.glViewports[camIndex].x , G.glViewports[camIndex].y , G.glViewports[camIndex].z , G.glViewports[camIndex].w );
						G.renderer.setScissor( G.glViewports[camIndex].x , G.glViewports[camIndex].y , G.glViewports[camIndex].z , G.glViewports[camIndex].w );
						G.renderer.render( G.scene , G.camera[camIndex] );
						if( G.mechs.mechs[camIndex].cockpit_object ) {
							G.mechs.mechs[camIndex].cockpit_object.children[1].visible = true;
						}
					}
					else {
						G.camera[ camIndex ].position.set( 9999999999 , 0 , 9999999999 );
						G.camera[ camIndex ].rotation.set( -Math.PI/2 , 0 , 0 );
						G.renderer.setViewport( G.glViewports[camIndex].x , G.glViewports[camIndex].y , G.glViewports[camIndex].z , G.glViewports[camIndex].w );
						G.renderer.setScissor( G.glViewports[camIndex].x , G.glViewports[camIndex].y , G.glViewports[camIndex].z , G.glViewports[camIndex].w );
						G.renderer.render( G.scene , G.camera[camIndex] );						
					}
				}
			}
		}

	}
	
	const dx = lastCamX - G.camera[audioCam].position.x;
	const dy = lastCamY - G.camera[audioCam].position.y;
	const dz = lastCamZ - G.camera[audioCam].position.z;
	const dr = Math.sqrt( dx*dx + dy*dy + dz*dz );
	if( dr > 100 ) {
		lastCamX = G.camera[audioCam].position.x;
		lastCamY = G.camera[audioCam].position.y;
		lastCamZ = G.camera[audioCam].position.z;
		self.postMessage({
			type: 'cam',
			x: G.camera[audioCam].position.x,
			y: G.camera[audioCam].position.y,
			z: G.camera[audioCam].position.z,
		});
	}
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
				G.camera[camIndex]._fov = 65;
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
		audioCam = port;
		
		G.renderer.setSize( width , height );
		G.camera[port].aspect = width/height;
		G.camera[port].far = 100000;
		G.camera[port].fov = 45;
		G.camera[camIndex]._fov = 45;
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
	else if( e.data.type === 'mech-control' ) {
		G.controls = {
			mech: e.data.mech,
			W: e.data.W,
			A: e.data.A,
			D: e.data.D,
		};
	}
	else if( e.data.type === 'cameras-on-off' ) {
		G.cameraViews = e.data.cameras;
		setViewports( e.data.width , e.data.height );
	}
	else if( e.data.type === 'init' ) {
		
		G.path = G.url + `${e.data.gfxSetting}/`;
		
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
				
		G.ambient = new THREE.AmbientLight(0x404040);
		G.scene.add( G.ambient );

		G.directional = new THREE.DirectionalLight(0x585858);
		G.directional.position.set(62250,5000,85000);
		G.directionalTarget = new THREE.Object3D();
		G.directionalTarget.position.set( 21250,0,0 );
		G.scene.add( G.directionalTarget );
		G.directional.target = G.directionalTarget;
		G.scene.add( G.directional );

		G.cameraViews = [0,1,2,3];
		G.cameraPan = [
			new THREE.Vector2( 0 , 0 ),
			new THREE.Vector2( 0 , 0 ),
			new THREE.Vector2( 0 , 0 ),
			new THREE.Vector2( 0 , 0 ),
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
			G.path + 'skybox/posz.jpg',
			G.path + 'skybox/negz.jpg',
			G.path + 'skybox/posy.jpg',
			G.path + 'skybox/negy.jpg',
			G.path + 'skybox/negx.jpg',
			G.path + 'skybox/posx.jpg'
		]);
		G.scene.background = G.environmentMap;
		
		G.MinMagFilter = THREE.NearestFilter;		
		G.fbx = new FBXLoader( manager );
		G.gltf = new GLTFLoader( manager );
		G.texture = new THREE.TextureLoader( manager );
		
		G.world.load();
		G.mechs = new Mech();
		G.particles = new Particles();
		G.ants = new Ants();
		G.gltf.load( G.path + 'cockpit/cockpit.glb' , result => {
			
			let cockpitMat = new THREE.MeshStandardMaterial({
				normalMap: G.texture.load( G.path + 'cockpit/Textures/Body/Weathered/VA_LightFighterCockpit_Weathered_Normal.png' ),
				metalness: 1,
				roughness: 1,
				color: new THREE.Color( 10,10,10 ),
				metalnessMap: G.texture.load( G.path + 'cockpit/Textures/Body/Weathered/VA_LightFighterCockpit_Weathered_Metallic.png' ),
				roughnessMap: G.texture.load( G.path + 'cockpit/Textures/Body/Weathered/VA_LightFighterCockpit_Weathered_Roughness.png' ),
				AOMap: G.texture.load( G.path + 'cockpit/Textures/Body/VA_LightFighterCockpit_AmbientOcclusion.png' ),
				emissive: new THREE.Color(0.5,0.5,0.5),
				emissiveMap: G.texture.load( G.path + 'cockpit/Textures/Body/VA_LightFighterCockpit_Emissive.png' ),
				envMap: G.environmentMap,
				depthFunc: THREE.AlwaysDepth,
			});
			let glassMat = new THREE.MeshStandardMaterial({
				transparent: true,
				metalness: 1,
				roughness: 1,
				color: new THREE.Color( 10,10,10 ),
				metalnessMap: G.texture.load( G.path + 'cockpit/Textures/Glass/DirtyScratched/VA_LightFighterCockpit_GlassDirtScratch_Metallic.png' ),
				roughnessMap: G.texture.load( G.path + 'cockpit/Textures/Glass/DirtyScratched/VA_LightFighterCockpit_GlassDirtScratch_Roughness.png' ),
				envMap: G.environmentMap,
				depthTest: false,
				depthWrite: false,
			});
			screenMap = G.texture.load( G.path + 'dashboard.png' );
			screenMap.wrapS = screenMap.wrapT = THREE.RepeatMapping;
			screenMap.center = new THREE.Vector2( 1.5 , 0.5 );
			screenMap.flipY = true;
			let screenMat = new THREE.MeshStandardMaterial({
				map: screenMap,
				color: new THREE.Color( 1,1,1 ),
				emissiveMap: screenMap,
				emissive: new THREE.Color( 0.5 , 0.5 , 0.5 ),
				envMap: G.environmentMap,
				metalness: 0.3,
				roughness: 0,
				depthFunc: THREE.AlwaysDepth,
			});
			let loadedCockpitMat = false;
			
			result.scene.traverse( child => {
				if( child.isMesh ) {
					if( child.material.name.indexOf( 'Cockpit' ) === 0 ) {
						if( ! loadedCockpitMat ) {
							cockpitMat.map = child.material.map;
							cockpitMat = G.lights.applyLightMap( cockpitMat );
							loadedCockpitMat = true;
						}
						child.material = cockpitMat;
					}
					else if( child.material.name.indexOf( 'Glass' ) === 0 ) {
						glassMat.map = child.material.map;
						glassMat = G.lights.applyLightMap( glassMat );
						child.material = glassMat;
					}
					else if( child.material.name.indexOf( 'MainScreen' ) === 0 ) {
						child.material = screenMat;
					}
				}
			});
			
			G.cockpit = result.scene;
			G.cockpit.renderOrder = 1;
			G.cockpit.rotation._order='ZYX';
			G.scene.add( G.cockpit );
		});
		
		G.screenPicker = new ScreenPicker();
		G.level = new Level();
		animate();
		gameSpeed = 0;
		G.score = new Score();
		
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
	else if( e.data.type === 'audioCam' ) {
		audioCam = e.data.view;
	}
	else if( e.data.type === 'pause-game' ) {
		gameSpeed = ( e.data.game ) ? 0 : 1;
	}
	else if( e.data.type === 'player-name' ) {
		G.score.name = e.data.name;
	}
}

console.log( 'ThreeD Worker Started' );