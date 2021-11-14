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
			
		this.mousemove = this.mousemove.bind( this );
		this.mousedown = this.mousedown.bind( this );
		this.mouseup = this.mouseup.bind( this );
		this.mousewheel = this.mousewheel.bind( this );
		this.contextMenu = this.contextMenu.bind( this );
		
		window.addEventListener( 'mousemove' , this.mousemove );
		window.addEventListener( 'mousedown' , this.mousedown );
		window.addEventListener( 'mouseup' , this.mouseup );
		window.addEventListener( 'mousewheel' , this.mousewheel );
		//window.addEventListener( 'contextmenu', this.contextMenu );
	}
	destructor() {
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
				}
			})
		);
	}
	mousedown( e ) {
		if( e.button === 0 ) this.button.left = true;
		if( e.button === 1 ) this.button.middle = true;
		if( e.button === 2 ) this.button.right = true;
	}
	mouseup( e ) {
		if( e.button === 0 ) this.button.left = false;
		if( e.button === 1 ) this.button.middle = false;
		if( e.button === 2 ) this.button.right = false;		
	}
	
}