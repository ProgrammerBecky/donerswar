import { G } from './Main/G.js';
import { Control } from './Main/Control.js';
import { NavBuilder } from './Main/NavBuilder.js';
import { UIInterface } from './Main/UIInterface.js';
import { Mech } from './Main/Mech.js';
import { Lights } from './Main/Lights.js';
import { SFX } from './Main/SFX.js';
import { HighScore } from './Main/Highscore.js';

const canvasTest = document.createElement('canvas');
if( ! HTMLCanvasElement.prototype.transferControlToOffscreen ) {
	document.getElementById('BrowserSupport').style.display = 'block';
}
else {
	
	G.url = '/';
	//G.url = '//beckyrose.com/giantrobotmechs/';

	G.highScores = new HighScore();

	/* Initialise 3D Canvas */
	const canvas = document.getElementById('ThreeD');

	let offscreen = canvas.transferControlToOffscreen();

	/* Start Workers */
	G.route = new Worker(
		'route.js',
		{
			type: 'module'
		},
	);		
	G.sfx = new SFX();

	/* Setup 3D */
	G.initThreeD = ( gfxSetting ) => {
		G.threeD = new Worker(
			'3d.js',
			{
				type: 'module'
			},
		);	
		G.threeD.addEventListener( 'message' , e => {
			if( e.data.type === 'cam' ) {
				G.sfx.updateCam({
					x: e.data.x,
					y: e.data.y,
					z: e.data.z,
				});
			}
			else if( e.data.type === 'mech-status' ) {
				ui.destroyedMech( e.data.mechId , e.data.status );
			}
			else if( e.data.type === 'music' ) {
				G.sfx.playTheme(
					e.data.music , e.data.volume
				);
			}
			else if( e.data.type === 'sound' ) {
				G.sfx.playSound( e.data.sfx , false , e.data.x , e.data.y , e.data.z );
			}
			else if( e.data.type === 'initialised' ) {
				ui.loadingComplete();
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
			else if( e.data.type === 'weapon-discharged' ) {
				G.control.weaponDischarged({
					mechId: e.data.mechId,
					gunId: e.data.gunId,
					weapon: e.data.weapon,
				});
			}
			else if( e.data.type === 'mech-damage' ) {
				ui.updateDamage({
					mechId: e.data.mechId,
					hp: e.data.hp,
					maxHp: e.data.maxHp,
				});
			}
			else if( e.data.type === 'loading' ) {
				ui.updateLoadingProgress({
					url: e.data.url,
					itemsLoaded: e.data.itemsLoaded,
					itemsTotal: e.data.itemsTotal,
				});
			}
			else if( e.data.type === 'ranking' ) {
				G.highScores.setRank( e.data.rank );
			}
			else if( e.data.type === 'game-over' ) {
				console.log( e.data );
				if( e.data.victory ) {
					document.getElementById( 'Victory' ).style.display = 'flex';	
				}
				else {
					document.getElementById( 'Defeat' ).style.display = 'flex';	
				}
			}
		});
		G.threeD.postMessage({
			type: 'init',
			canvas: offscreen,
			width: canvas.clientWidth,
			height: canvas.clientHeight,
			pixelRatio: window.devicePixelRatio,
			gfxSetting: gfxSetting,
		} , [ offscreen ]);


		/* Setup Main Thread */
		G.lights = new Lights();
		G.mech = new Mech();
	}
	const ui = new UIInterface();
	G.control = new Control({ ui });

	/* Browser Resizing */
	const windowResize = () => {
		if( G.threeD ) {
			G.threeD.postMessage({
				type: 'resizeCanvas',
				width: canvas.clientWidth,
				height: canvas.clientHeight
			});
		}
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
		
		if( G.sfx.analyser ) {
			G.sfx.vumeterPlayback();
		}
		else {
			G.sfx.update();
		}
		
		
		requestAnimationFrame( animate );
	}			
}