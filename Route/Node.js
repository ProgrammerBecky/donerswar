export class Node {

	constructor({ x,z,cost,localCost,parent }) {
		this.x = x;
		this.z = z;
		this.cost = cost;
		this.parent = parent;
		this.localCost = localCost;
		this.cost = cost + this.localCost;

		this.estimate = 0;
		this.total = 0;
	}
		
	
	calc(dx,dz) {
		const rx = dx-this.x;
		const rz = dz-this.z;
		this.estimate = Math.sqrt( rx*rx + rz*rz );
		this.total = this.cost + ( this.estimate * this.localCost );
	}
}