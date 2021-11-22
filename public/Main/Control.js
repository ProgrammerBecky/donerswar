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
		
		this.cameraType = 'rts';
		this.cameraAngle = 0;
			
		this.resize = this.resize.bind( this );
		this.mousemove = this.mousemove.bind( this );
		this.mousedown = this.mousedown.bind( this );
		this.mouseup = this.mouseup.bind( this );
		this.mousewheel = this.mousewheel.bind( this );
		this.keydown = this.keydown.bind( this );
		this.contextMenu = this.contextMenu.bind( this );
		
		window.addEventListener( 'resize' , this.resize );
		window.addEventListener( 'mousemove' , this.mousemove );
		window.addEventListener( 'mousedown' , this.mousedown );
		window.addEventListener( 'mouseup' , this.mouseup );
		window.addEventListener( 'mousewheel' , this.mousewheel );
		window.addEventListener( 'keydown' , this.keydown );
		window.addEventListener( 'contextmenu', this.contextMenu );
		
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
		
		console.log( this.ui.mode , this.hWidth , this.hHeight , 'cam' , cam , e );
		G.threeD.postMessage({
			type: 'canon-hit',
			mech: cam,
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
	
}
