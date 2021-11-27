import { G } from './G.js';

export class Control {
	
	constructor({ ui }) {

		this.ui = ui;

		this.mouse = {
			x: 0,
			y: 0,
			z: 0,
		}
		this.button = {
			left: false,
			middle: false,
			right: false,
		}
		
		this.mouseOverCam = 0;
		this.keypresses = {
			KeyQ: false,
			KeyW: false,
			KeyE: false,
			KeyR: false,
			KeyT: false,
			KeyY: false,
			KeyS: false,
			KeyF: false,
			KeyL: false,
			KeyA: false,
			KeyD: false,
			KeyZ: false,
			KeyX: false,
			KeyC: false,
			KeyV: false,
			Digit1: false,
			Digit2: false,
			Digit3: false,
			KeyP: false,
		};
		
		this.cameraType = 'rts';
		this.cameraAngle = 0;
			
		this.resize = this.resize.bind( this );
		this.mousemove = this.mousemove.bind( this );
		this.mousedown = this.mousedown.bind( this );
		this.mouseup = this.mouseup.bind( this );
		this.mousewheel = this.mousewheel.bind( this );
		this.keydown = this.keydown.bind( this );
		this.keyup = this.keyup.bind( this );
		this.contextMenu = this.contextMenu.bind( this );

		window.addEventListener( 'contextmenu', this.contextMenu );
		window.addEventListener( 'resize' , this.resize );
		
		this.gamePaused = false;
		this.resize();
					
	}
	resize() {
		this.hWidth = window.innerWidth/2;
		this.hHeight = window.innerHeight/2;		
	}
	destructor() {
		window.removeEventListener( 'resize' , this.resize );
		window.removeEventListener( 'mousemove' , this.mousemove );
		window.removeEventListener( 'mousedown' , this.mousedown );
		window.removeEventListener( 'mouseup' , this.mouseup );
		window.removeEventListener( 'keyup' , this.keyup );
		window.removeEventListener( 'mousewheel' , this.mousewheel );
		window.removeEventListener( 'contextmenu', this.contextMenu );
	}
	contextMenu(e) {
		e.preventDefault();
	}
	
	mousemove( e ) {
		if( ! e.target instanceof HTMLCanvasElement ) return;
		if( this.button.right ) {
			G.threeD.postMessage({
				type: 'panView',
				mouse: {
					x: e.clientX - this.mouse.x,
					y: e.clientY - this.mouse.y,
					cam: this.detectCam(e),
				}
			});
		}
		
		this.mouse.x = e.clientX;
		this.mouse.y = e.clientY;
		
		const cam = this.detectCam(e);
		if( cam !== this.mouseOverCam ) {
			this.mouseOverCam = cam;
			G.threeD.postMessage({
				type: 'audioCam',
				view: cam,
			});
		}
	}
	mousewheel( e ) {
		this.mouse.z = -e.wheelDeltaY;
		
		G.threeD.postMessage({
			type: 'zoomView',
			mouse: {
				z: this.mouse.z,
				cam: this.detectCam(e),
			},
		});		
	}
	mousedown( e ) {
		if( ! e.target instanceof HTMLCanvasElement ) return;
		if( e.target.classList.contains('pilot') ) return;

		let node = e.target;
		while( node.classList ) {
			if( node.classList.contains( 'weapon' ) ) {
				const key = node.getAttribute( 'data-key' );
				return this.ui.fire( this.detectCam( e ), key );
			}
			else {
				node = node.parentNode;
			}
		}
		if( e.button === 0 ) this.button.left = true;
		if( e.button === 1 ) this.button.middle = true;
		if( e.button === 2 ) this.button.right = true;
	
		if( e.button === 0 ) {
			const cam = this.detectCam(e);
			G.threeD.postMessage({
				type: 'mech-navigate',
				x: e.clientX,
				y: e.clientY,
				unit: cam,
				cam: cam,
			});
		}
	}
	mouseup( e ) {
		if( e.button === 0 ) this.button.left = false;
		if( e.button === 1 ) this.button.middle = false;
		if( e.button === 2 ) this.button.right = false;		
	}
	keydown( e ) {
		const cam = this.detectCam( e );

		if( this.keypresses[ e.code ] === false ) {
			this.keypresses[ e.code ] = true;

			if( e.code === 'KeyQ' ) this.ui.fire( cam, 'Q' );
			else if( e.code === 'KeyE' ) this.ui.fire( cam, 'E' );
			else if( e.code === 'KeyR' ) this.ui.fire( cam, 'R' );
			else if( e.code === 'KeyT' ) this.ui.fire( cam, 'T' );
			else if( e.code === 'KeyY' ) this.ui.fire( cam, 'Y' );
			else if( e.code === 'KeyS' ) this.ui.fire( cam, 'S' );
			else if( e.code === 'KeyF' ) this.ui.fire( cam, 'F' );
			else if( e.code === 'KeyL' ) this.ui.fire( cam, 'L' );
			else if( e.code === 'Digit1' ) this.ui.fire( cam, '1' );
			else if( e.code === 'Digit2' ) this.ui.fire( cam, '2' );
			else if( e.code === 'Digit3' ) this.ui.fire( cam, '3' );
			else if( e.code === 'KeyZ' ) this.ui._setPilot(0);
			else if( e.code === 'KeyX' ) this.ui._setPilot(1);
			else if( e.code === 'KeyC' ) this.ui._setPilot(2);
			else if( e.code === 'KeyV' ) this.ui._setPilot(3);
			else if( e.code === 'KeyP' ) this.pauseGame();
			else if( ['KeyA','KeyD','KeyW'].includes( e.code ) ) this.control( cam );
		}
		
	}
	pauseGame() {
		this.gamePaused = ! this.gamePaused;
		G.threeD.postMessage({
			type:	'pause-game',
			game:	this.gamePaused,
		});
		if( this.gamePaused ) {
			document.getElementById( 'Pause' ).style.display = 'block';
		}
		else {
			document.getElementById( 'Pause' ).style.display = 'none';
		}
	}
	keyup( e ) {
		if( typeof( this.keypresses[ e.code ] ) !== 'undefined' ) {
			this.keypresses[ e.code ] = false;
			if( ['KeyA','KeyD','KeyW'].includes( e.code ) ) {
				const cam = this.detectCam( e );
				this.control( cam );
			}
		}
	}
	control( cam ) {
		G.threeD.postMessage({
			type: 'mech-control',
			mech: cam,
			W: this.keypresses['KeyW'],
			A: this.keypresses['KeyA'],
			D: this.keypresses['KeyD'],
		});
			
	}
	detectCam( e ) {
		
		if( e.clientX ) this.mouse.x = e.clientX;
		if( e.clientY ) this.mouse.y = e.clientY;
		
		if( this.ui.mode === 'quad' ) {
			if( this.mouse.x > this.hWidth ) {
				if( this.mouse.y > this.hHeight ) return 3;
				return 1;
			}
			else {
				if( this.mouse.y > this.hHeight ) return 2;
				return 0;
			}
		}
		else {
			return this.ui.showPilot;
		}
	}
	weaponDischarged({ mechId , gunId, weapon }) {
		this.ui.discharge({ mechId, gunId });
	}
	startGame() {
		window.addEventListener( 'mousemove' , this.mousemove );
		window.addEventListener( 'mousedown' , this.mousedown );
		window.addEventListener( 'mouseup' , this.mouseup );
		window.addEventListener( 'mousewheel' , this.mousewheel );
		window.addEventListener( 'keydown' , this.keydown );
		window.addEventListener( 'keyup' , this.keyup );	
		G.sfx.vuMeterEnd();
	}
	
}
