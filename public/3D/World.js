import * as THREE from './../build/three.module.js';
import { G } from './G.js';

export class World {

	constructor() {
		
		this.loaded = 0;
		let self = this;
		this.world = new THREE.Group();
		
		G.fbx.load( '/high/city/Foliage.fbx' , model => {
			
			model.traverse( (child) => {
				if( child.isMesh ) {

					child.castShadow = true;
					child.receiveShadow = true;
					
					child.rotation.y = Math.random() * Math.PI * 2;
					child.scale.set( 0.4+Math.random()*0.2 , 0.4+Math.random()*0.2 , 0.4+Math.random()*0.2 );
					
					if( child.material && child.material ) {
						if( Array.isArray( child.material ) ) {
							child.material[1].transparent = true;
							child.material[1].alphaTest = 0.95;
							child.material[1].map.magFilter = G.MinMagFilter;
							child.material[1].map.minFilter = G.MinMagFilter;
						}
					}
				}
			});

			self.world.add( model );
			self.positionWorld();
			
		});
		
		G.fbx.load( '/high/city/CityCentre.fbx' , model => {
			model.traverse( (child) => {
				if( child.isMesh ) {
					
					child.castShadow = true;
					child.receiveShadow = true;
					
					if( child.material && child.material.map ) {
						child.material.map.magFilter = G.MinMagFilter;
						child.material.map.minFilter = G.MinMagFilter;
					}
					
				}
			});

			self.world.add( model );
			self.positionWorld();
		});
		
	}
	
	positionWorld() {
		
		this.loaded++;
		if( this.loaded < 2 ) return;
		
		let box = new THREE.Box3();

		this.world.traverse( (child) => {
			
			if( child.isMesh ) {
					
				child.geometry.computeBoundingBox();
				box.min.x = Math.min( child.geometry.boundingBox.min.x , box.min.x );
				box.min.y = Math.min( child.geometry.boundingBox.min.y , box.min.y );
				box.min.z = Math.min( child.geometry.boundingBox.min.z , box.min.z );
				box.max.x = Math.max( child.geometry.boundingBox.max.x , box.max.x );
				box.max.y = Math.max( child.geometry.boundingBox.max.y , box.max.y );
				box.max.z = Math.max( child.geometry.boundingBox.max.z , box.max.z );
					
			}
		});	
		
		let x = ( box.max.x + box.min.x ) / 2;
		let y = ( box.max.y + box.min.y ) / 2;
		let z = ( box.max.z + box.min.z ) / 2;
		this.world.position.set( x , y , z );

		G.scene.add( this.world );
		console.log( 'World Loaded' );
		
	}

}

console.log( 'World Init' );