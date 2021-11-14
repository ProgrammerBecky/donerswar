const MAP_SIZE = 85000;

export class Zombie {
	constructor({ threeD, route }) {
		this.threeD = threeD;
		this.route = route;
		
		this.zombies = [];
	
	}
	deconstructor() {
		clearInterval( this.spawnRef );
	}
	update( delta ) {
		if( this.zombies.length < 500 ) this.spawner();
		
		this.zombies.map( (zombie,index) => {
			
			if( zombie.action !== 'Idle' ) {
				zombie.x += zombie.mx * delta;
				zombie.z += zombie.mz * delta;
			}
			
			zombie.logicChangeTimer -= delta;
			if( zombie.logicChangeTimer < 0 ) {
				zombie.logicChangeTimer = 5 + Math.random() * 10; 
				if( Math.random() < 0.5 ) {
					if( zombie.action !== 'Idle' ) {
						zombie.action = 'Idle';
						zombie.animation = 'Idle1';
						zombie.mx = 0;
						zombie.mz = 0;
						this.updateZombie({ zombie });
					}
				}
				else {
					if( zombie.action !== 'Walk' ) {
						zombie.action = 'Walk';
						zombie.animation = 'Walk1';
						zombie.f = Math.random() * Math.PI * 2;
						zombie.mx = Math.sin( zombie.f ) *75;
						zombie.mz = Math.cos( zombie.f ) *75;
						this.updateZombie({ zombie });
					}
				}
			}
			
		});
	}
	updateZombie({ zombie }) {
		this.threeD.postMessage({
			type: 'update-zombie',
			x: zombie.x,
			z: zombie.z,
			f: zombie.f,
			mx: zombie.mx,
			mz: zombie.mz,
			action: zombie.action,
			animation: zombie.animation,
			id: zombie.id,
		});		
	}
	spawner() {
	
		//TODO: Spawn Locations
		let zombie = {
			x: Math.random() * MAP_SIZE,
			z: Math.random() * MAP_SIZE,
			mx: 0,
			mz: 0,
			f: (Math.random() * Math.PI*2).toFixed(2),
			action: 'Idle',
			animation: 'Idle1',
			id: this.zombies.length,
			logicChangeTimer: 5,
		};
		this.zombies.push( zombie );
		
		this.threeD.postMessage({
			type: 'spawn-zombie',
			x: zombie.x,
			z: zombie.z,
			f: zombie.f,
			mx: 0,
			mz: 0,
			action: zombie.action,
			animation: zombie.animation,
			id: zombie.id,
		});
	
	}

}