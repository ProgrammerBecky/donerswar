import * as THREE from './../build/three.module.js';
import { G } from './G.js';

export class ScreenPicker {
	
	constructor() {
		
		this.raycaster = new THREE.Raycaster();
		this.mouse = new THREE.Vector2();
		
	}
	
	lookup({ cam, x, y }) {

		const viewport = G.humanViewports[ cam ];
		
		const halfWidth = viewport.z / 2;
		const halfHeight = viewport.w / 2;
		this.mouse.set(
			( ( x - viewport.x ) - halfWidth ) / halfWidth ,
			- ( ( ( y - viewport.y ) - halfHeight ) / halfHeight ),
		);
		console.log( viewport , x , y , this.mouse );
		this.raycaster.setFromCamera( this.mouse , G.camera[ cam ] );
		const intersects = this.raycaster.intersectObject( G.world.map , true );
		if( intersects[0] ) {
			return intersects[0].point;
		}
		
		return false;
		
	}

		
}