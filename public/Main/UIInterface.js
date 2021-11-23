import { G } from './G.js';

export class UIInterface {
	constructor() {
	
		this.pilots = [
			'Dink',
			'Gruber',
			'Boston',
			'Claret',
		];
	
		this.loaded = false;
		this.damage = [100,100,100,100];
		this.weapons = [
			[
				{"weapon": "Laser", "key": "Q", "maxAmmo": 16, "ammo": 16, "gunId": 1, "active": false},
				{"weapon": "Canon", "key": "E", "maxAmmo": 16, "ammo": 16, "gunId": 0, "active": false},
				{"weapon": "Spotlight", "key": "S", "maxAmmo": 0, "ammo": 0, "hideAmmo": true, "active": false},
			],
			[
				{"weapon": "Flamer", "key": "Q", "maxAmmo": 60, "ammo": 60, "gunId": 0, "active": false},
				{"weapon": "Machinegun", "key": "T", "maxAmmo": 60, "ammo": 60, "gunId": 1, "active": false},
			],
			[
				{"weapon": "Minigun", "key": "Q", "maxAmmo": 60, "ammo": 60, "gunId": 3, "active": false},
				{"weapon": "Rockets", "key": "W", "maxAmmo": 8, "ammo": 8, "gunId": 4, "active": false},
				{"weapon": "Flamer", "key": "E", "maxAmmo": 60, "ammo": 60, "gunId": 1, "active": false},
				{"weapon": "Rockets", "key": "R", "maxAmmo": 8, "ammo": 8, "gunId": 2, "active": false},
				{"weapon": "Canon", "key": "T", "maxAmmo": 32, "ammo": 32, "gunId": 0, "active": false},
			],
			[
				{"weapon": "Rockets", "key": "Q", "maxAmmo": 40, "ammo": 40, "gunId": 2, "active": false},
				{"weapon": "Rockets", "key": "W", "maxAmmo": 40, "ammo": 40, "gunId": 0, "active": false},
				{"weapon": "Rockets", "key": "E", "maxAmmo": 40, "ammo": 40, "gunId": 4, "active": false},
				{"weapon": "Rockets", "key": "R", "maxAmmo": 40, "ammo": 40, "gunId": 1, "active": false},
				{"weapon": "Rockets", "key": "T", "maxAmmo": 40, "ammo": 40, "gunId": 3, "active": false},
				{"weapon": "Full Salvo", "key": "Y", "maxAmmo": 40, "ammo": 40, "gunId": "FULL_SALVO", "hideAmmo": true},
			],
		];
	
		this.mode = 'single';
		
		this._setPilot( 0 );
		
		this.showInterface();
	}
	
	fire( mech , key ) {
		
		this.weapons[ mech ].map( weapon => {
			if( weapon.key === key ) {

				if( mech===0 && weapon.key === 'S' ) {
					weapon.active = ! weapon.active;
					G.threeD.postMessage({
						type: 'spotlight',
						on: weapon.active,
					});
					this.showInterface();
				}

				if( weapon.ammo > 0 && ! weapon.active ) {
					if( mech === 3 && weapon.gunId === 'FULL_SALVO' ) {
						this.weapons[3].map( gun => {
							if( gun.gunId !== 'FULL_SALVO' ) {
								gun.ammo--;
								gun.active = true;
							}
						});
					}
					else {
						weapon.active = true;
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
	
	updateDamage({ mechId , hp , maxHp }) {
		this.damage[ mechId ] = hp * 100 / maxHp;
		this.showInterface();
	}
	
	discharge({ mechId, gunId }) {
		this.weapons[ mechId ].map( gun => {
			if( gun.gunId === gunId ) gun.active = false;
		});
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
		
		const _hp = document.createElement( 'progress' );
		_hp.value = this.damage[ pilot ];
		_hp.min = 0;
		_hp.max = 100;
		container.appendChild( _hp );
		
		this.weapons[ pilot ].map( weapon => {
			
			const _row = document.createElement( 'div' );
			_row.classList.add( 'weapon' );
			if( weapon.active ) _row.classList.add( 'active' );
			
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
	
	updateLoadingProgress({ url, itemsLoaded, itemsTotal }) {
		document.getElementById('SplashUrl').innerHTML = url;
		document.getElementById('SplashProgress').value = itemsLoaded*100/itemsTotal;
		this.loaded = ( itemsLoaded === itemsTotal ) ? true : false;
		this.beginGame();
	}
	
	loadingComplete() {
		this.beginGame();
	}
	beginGame() {
		if( this.loaded ) {
			document.getElementById('Splash').style.display = 'none';
			G.threeD.postMessage({
				type: 'beginGame'
			});
		}
	}
	
	
}