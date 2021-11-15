export class Control {
	
	constructor() {

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
		this.contextMenu = this.contextMenu.bind( this );
		
		window.addEventListener( 'resize' , this.resize );
		window.addEventListener( 'mousemove' , this.mousemove );
		window.addEventListener( 'mousedown' , this.mousedown );
		window.addEventListener( 'mouseup' , this.mouseup );
		window.addEventListener( 'mousewheel' , this.mousewheel );
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
		if( this.button.right ) {
			window.dispatchEvent(
				new CustomEvent( 'panView' , {
					detail: {
						x: e.clientX - this.mouse.x,
						y: e.clientY - this.mouse.y,
						cam: this.detectCam(e),
					}
				})
			);
		}
		if( this.button.left ) {
			this.cameraAngle += ( e.clientX - this.mouse.x ) * 0.01;
			
			window.dispatchEvent(
				new CustomEvent( 'cameraView' , {
					detail: {
						view: this.cameraType,
						angle: this.cameraAngle,
						cam: this.detectCam(e),
					}
				})
			);			
		}

		this.mouse.x = e.clientX;
		this.mouse.y = e.clientY;
	}
	mousewheel( e ) {
		this.mouse.z += e.deltaY;
		window.dispatchEvent(
			new CustomEvent( 'zoomView' , {
				detail: {
					z: this.mouse.z,
					cam: this.detectCam(e),
				}
			})
		);
	}
	mousedown( e ) {
		if( e.button === 0 ) this.button.left = true;
		if( e.button === 1 ) this.button.middle = true;
		if( e.button === 2 ) this.button.right = true;
		
		if( e.button === 0 ) {
			this.cameraType = 'fps';
			window.dispatchEvent(
				new CustomEvent( 'cameraView' , {
					detail: {
						view: this.cameraType,
						angle: this.cameraAngle,
						cam: this.detectCam(e),
					}
				})
			);
		}
	}
	mouseup( e ) {
		if( e.button === 0 ) this.button.left = false;
		if( e.button === 1 ) this.button.middle = false;
		if( e.button === 2 ) this.button.right = false;		
	}
	detectCam( e ) {
		if( e.clientX > this.hWidth ) {
			if( e.clientY > this.hHeight ) return 1;
			return 3;
		}
		else {
			if( e.clientY > this.hHeight ) return 0;
			return 2;
		}
	}
	
}