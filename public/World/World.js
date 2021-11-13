import { G } from './../Util/G.js';

export class World {

	constructor() {
		console.log( 'World FBX' );
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

			G.camera.position.set( 0 , 10 , -10 );
			G.scene.add( model );
			
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

			G.scene.add( model );
		});
		
	}

}

console.log( 'World Init' );