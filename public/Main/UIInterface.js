import { G } from './G.js';

export class UIInterface {
	constructor() {
	
		this.pilots = [
			'Dink',
			'Gruber',
			'Boston',
			'Claret',
		];
	
		this.weapons = [
			[
				{"weapon": "Laser", "key": "Q", "maxAmmo": 60, "ammo": 60, "gunId": 1},
				{"weapon": "Canon", "key": "E", "maxAmmo": 6, "ammo": 6, "gunId": 0},
				{"weapon": "Spotlight", "key": "S", "maxAmmo": 0, "ammo": 0, "hideAmmo": true},
			],
			[
				{"weapon": "Flamer", "key": "Q", "maxAmmo": 60, "ammo": 60, "gunId": 0},
				{"weapon": "Machinegun", "key": "T", "maxAmmo": 60, "ammo": 60, "gunId": 1},
			],
			[
				{"weapon": "Minigun", "key": "Q", "maxAmmo": 60, "ammo": 60, "gunId": 3},
				{"weapon": "Rockets", "key": "W", "maxAmmo": 2, "ammo": 2, "gunId": 4},
				{"weapon": "Flamer", "key": "E", "maxAmmo": 60, "ammo": 60, "gunId": 1},
				{"weapon": "Machinegun", "key": "R", "maxAmmo": 60, "ammo": 60, "gunId": 2},
				{"weapon": "Canon", "key": "T", "maxAmmo": 9, "ammo": 9, "gunId": 0},
			],
			[
				{"weapon": "Rockets", "key": "Q", "maxAmmo": 10, "ammo": 10, "gunId": 2},
				{"weapon": "Rockets", "key": "W", "maxAmmo": 10, "ammo": 10, "gunId": 0},
				{"weapon": "Rockets", "key": "E", "maxAmmo": 10, "ammo": 10, "gunId": 4},
				{"weapon": "Rockets", "key": "R", "maxAmmo": 10, "ammo": 10, "gunId": 1},
				{"weapon": "Rockets", "key": "T", "maxAmmo": 10, "ammo": 10, "gunId": 3},
				{"weapon": "Full Salvo", "key": "Y", "maxAmmo": 10, "ammo": 10, "gunId": "FULL_SALVO", "hideAmmo": true},
			],
		];
	
		this.mode = 'single';
		
		this._setPilot( 0 );
		
		
		this.showInterface();
	}
	
	fire( mech , key ) {
		
		this.weapons[ mech ].map( weapon => {
			if( weapon.key === key ) {

				if( weapon.ammo > 0 ) {
					if( mech === 3 && weapon.gunId === 'FULL_SALVO' ) {
						this.weapons[3].map( gun => {
							gun.ammo--;
						});
					}
					else {
						weapon.ammo--;
					}
					G.threeD.postMessage({
						type: 'fire-weapon',
						mech: mech,
						gunId: weapon.gunId,
					});
					this.showInterface();
				}
				
				if( mech === 3 ) {
					let ammo = 99;
					this.weapons[3].map( (w,i) => {
						if( i < 5 ) ammo = Math.min( ammo,w.ammo );
					});
					this.weapons[3][5].ammo = ammo;
				}
				
			}
		});
		
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
			quad.classList.add( 'quad-element' );
		
			let _btn = document.createElement( 'button' );
			_btn.innerHTML = this.pilots[ i ];
			_btn.onclick=() => {this._setPilot(i);}
			_btn.classList.add( 'pilot' );
			quad.appendChild( _btn );

			this.showWeapons( i , quad );

			document.getElementById('UILayer').appendChild( quad );
			
		}
		
	}
	
	showSingle() {
		
		document.getElementById('UILayer').innerHTML = '';
		document.getElementById('UILayer').classList.remove( 'quad' );

		const container = document.createElement( 'div' );
		container.classList.add( 'single' );
		
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
		
			container.appendChild( _btn );

		}
		document.getElementById('UILayer').appendChild( container );
		
		const weaponC = document.createElement( 'div' );
		weaponC.classList.add( 'weapon-single-container' );
		this.showWeapons( this.showPilot , weaponC );
		document.getElementById('UILayer').appendChild( weaponC );

	}
	
	showWeapons( pilot , _div ) {
		
		const container = document.createElement( 'div' );
		container.classList.add( 'weapon-box' );
		
		this.weapons[ pilot ].map( weapon => {
			
			const _row = document.createElement( 'div' );
			_row.classList.add( 'weapon' );
			
			let _key = document.createElement( 'div' );
			_key.classList.add( 'weapon-key' );
			_key.innerHTML = weapon.key;
			
			const _ammo = document.createElement( 'div' );
			_ammo.classList.add( 'weapon-ammo' );
			if( weapon.hideAmmo ) _ammo.style.visibility = 'hidden';

			const _remaining = document.createElement( 'div' );
			_remaining.classList.add( 'weapon-remaining' );

			_remaining.style.height = ( weapon.ammo * 100 / weapon.maxAmmo ) + '%';
			_ammo.appendChild( _remaining );
			if( weapon.ammo > 0 ) {
				const _count = document.createElement( 'div' );
				_count.classList.add( 'weapon-count' );
				_count.innerHTML = weapon.ammo;
				_ammo.appendChild( _count );
			}
			
			const _name = document.createElement( 'div' );
			_name.classList.add( 'weapon-name' );
			_name.innerHTML = weapon.weapon;
			
			_row.appendChild( _key );
			_row.appendChild( _ammo );
			_row.appendChild( _name );
			container.appendChild( _row );
			
		});
		
		_div.appendChild( container );
		
	}
	
	
}