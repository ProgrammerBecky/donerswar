import { G } from './G.js';

export class UIInterface {
	constructor() {
	
		this.pilots = [
			'Dink',
			'Gruber',
			'Boston',
			'Claret',
		];
	
		this.mode = 'single';
		
		this._setPilot( 0 );
		
		
		this.showInterface();
	}
	
	_setMode( mode ) {
		this.mode = mode;
		this.showInterface();
		
		if( mode === 'quad' ) {
			G.threeD.postMessage({
				type: 'cameras-on-off',
				cameras: [0,1,2,3],		
				width: window.innerWidth,
				height: window.innerHeight,
			});		
		}
	}
	_setPilot( pilot ) {
		console.log( 'SET PILOT' , pilot );
		this.mode = 'single';
		this.showPilot = pilot;
		this.showInterface();
		
		G.threeD.postMessage({
			type: 'cameras-on-off',
			cameras: [this.showPilot],	
			width: window.innerWidth,
			height: window.innerHeight,
		});
	}
	
	showInterface() {
		if( this.mode === 'single' ) {
			this.showSingle(this.showPilot);
		}
		if( this.mode === 'quad' ) {
			this.showQuad();
		}
	}
	
	showQuad() {

		document.getElementById('UILayer').innerHTML = '';
		document.getElementById('UILayer').classList.add( 'quad' );
		
		for( let i=0 ; i<4 ; i++ ) {
			let quad = document.createElement( 'div' );
			quad.style.width = '50%';
			quad.style.height = '50%';
		
			let _btn = document.createElement( 'button' );
			_btn.innerHTML = this.pilots[ i ];
			_btn.onclick=() => {this._setPilot(i);}
			_btn.classList.add( 'pilot' );
			quad.appendChild( _btn );

			document.getElementById('UILayer').appendChild( quad );
			
		}
		
	}
	
	showSingle() {
		
		document.getElementById('UILayer').innerHTML = '';
		document.getElementById('UILayer').classList.remove( 'quad' );

		for( let i=0 ; i<this.pilots.length ; i++ ) {

			
			let _btn = document.createElement( 'button' );
			_btn.innerHTML = this.pilots[ i ];
			if( i === this.showPilot ) {
				_btn.onclick=() => {this._setMode( 'quad' ); }
				_btn.classList.add( 'active' );
			}
			else {
				_btn.onclick = () => { this._setPilot( i ); }
			}
			_btn.classList.add( 'pilot' );
		
			document.getElementById('UILayer').appendChild( _btn );

		}

	}
	
	
}