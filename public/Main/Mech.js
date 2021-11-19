export class Mech {
	
	constructor() {
		this.mechs = [
			{x:0,z:0},
			{x:0,z:0},
			{x:0,z:0},
			{x:0,z:0},
		];
	}
	
	updateMech({ mech }) {
		this.mechs[ mech.id ] = {
			x: mech.x,
			z: mech.z,
		};
	}

}