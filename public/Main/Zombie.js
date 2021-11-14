const MAP_SIZE = 85000;

export class Zombie {
	constructor({ threeD, route }) {
		this.threeD = threeD;
		this.route = route;
		
		this.spawner = this.spawner.bind( this );
		this.spawnRef = setInterval( this.spawner , 3000 );
	
		this.zombies = [];
	
	}
	deconstructor() {
		clearInterval( this.spawnRef );
	}
	spawner() {
	
		//TODO: Spawn Locations
		let zombie = {
			x: Math.random() * MAP_SIZE,
			z: Math.random() * MAP_SIZE,
			f: (Math.random() * Math.PI*2).toFixed(2),
			action: 'Idle',
			animation: 'Idle1',
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
			id: zombie.length,
		});
	
	}

}