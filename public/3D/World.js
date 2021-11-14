import * as THREE from './../build/three.module.js';
import { G } from './G.js';

export class World {

	constructor() {
		
		this.loaded = 0;
		let self = this;
		this.map = new THREE.Group();
		this.colliders = [];
		
		this.wireframe = new THREE.MeshBasicMaterial({
			color: 0x00ff00,
			visible: false,
		});
		
		G.fbx.load( '/high/city/Foliage.fbx' , model => {
			
			model.traverse( (child) => {
				if( child.isMesh ) {
					child.geometry.computeBoundingBox();
					child.geometry.needsUpdate = true;

					child.castShadow = true;
					child.receiveShadow = true;
					
					child.rotation.y = Math.random() * Math.PI * 2;
					child.scale.set( 0.4+Math.random()*0.2 , 0.4+Math.random()*0.2 , 0.4+Math.random()*0.2 );
					
					self.addToColliders( child );
					
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

			console.log( 'Foliage Loaded' );
			this.map.add( model );
			self.loadingComplete();
			
		});
		
		G.fbx.load( '/high/city/CityCentre.fbx' , model => {
			model.traverse( (child) => {
				if( child.isMesh ) {
					
					child.geometry.computeBoundingBox();
					child.geometry.needsUpdate = true;
					
					child.castShadow = true;
					child.receiveShadow = true;
					
					self.addToColliders( child );
					
					if( child.material && child.material.map ) {
						child.material.map.magFilter = G.MinMagFilter;
						child.material.map.minFilter = G.MinMagFilter;
					}
					
				}				
			});
			
			console.log( 'Concrete Loaded' );
			this.map.add( model );
			self.loadingComplete();
			
		});
		
	}
	addToColliders( child ) {

		let vector = new THREE.Vector3();
		let quaternion = new THREE.Quaternion();

		const box = child.geometry.boundingBox;
		
		if( box.max.x-box.min.x > 1000 || box.max.z-box.min.z > 1000 ) {
			this.colliders.push( child );		
		}
		else {
			let geo = new THREE.BoxBufferGeometry( box.max.x-box.min.x , box.max.y-box.min.y , box.max.z-box.min.z );

			child.getWorldPosition( vector );
			child.getWorldQuaternion( quaternion );

			let collider = new THREE.Mesh( geo , this.wireframe );
			collider.position.set( vector.x , (box.max.y-box.min.y)/2 , vector.z );
			collider.applyQuaternion( quaternion );
			G.scene.add( collider );

			this.colliders.push( collider );		
		}
		
	}
	setBuildCanvas({ canvas }) {
		console.log( 'Canvas Loaded' );
		this.canvas = canvas;
		this.context = canvas.getContext( '2d' );
		this.loadingComplete();
	}
	loadingComplete() {
		this.loaded++;
		if( this.loaded < 2 ) return; /* Raise this by 1 when NavBuilder sends a canvas for nav map creation */
		G.scene.add( this.map );
		console.log( 'World Loaded' );

		/* In production we return here
		 * To generate a new nav map image this code
		 * needs to execute
		 * but like, it takes yonks....
		 * so we save out the image and just load it in production
		 */
		 return;

		//Build Navigation Map	
		let worldSizeX = 85000;
		let worldSizeZ = 85000;
		let mapX = this.canvas.width;
		let mapZ = this.canvas.height;
			
		this.pixelData = this.context.getImageData(0,0,mapX,mapZ);
		
		let rayCaster = new THREE.Raycaster();
		const source = new THREE.Vector3();
		const dir = new THREE.Vector3();
			
		for( let x=0 ; x<mapX ; x++ ) {
			let wx = worldSizeX/mapX*x;
			for( let z=0 ; z<mapZ ; z++ ) {
				let wz = worldSizeZ/mapZ*z;
			
				let navigable = 255;
				let height = 0;
			
				//height
				rayCaster.near = 0;
				rayCaster.far = 1500;
				source.set( wx , 1000 , wz );
				dir.set( 0 , -1 , 0 );
				rayCaster.set( source , dir );
				const intersects = rayCaster.intersectObjects( this.colliders , true );
				if( intersects.length > 0 ) {
					let ht = intersects[0].point.y;
					if( ht > 20 ) {
						navigable = 0;
						height = 255;
					}
				}
				
				//Forward
				rayCaster.far = Math.max( worldSizeX , worldSizeZ ) / Math.max( mapX , mapZ );
				source.set( wx , 50 , wz );
				let directions = [{x:0,y:0,z:1},{x:0,y:0,z:-1},{x:1,y:0,z:0},{x:-1,y:0,z:0}];
				for( let i=0 ; i<directions.length ; i++ ) {
					dir.set( directions[i].x , directions[i].y , directions[i].z );
					rayCaster.set( source , dir );
					const intersects = rayCaster.intersectObjects( this.colliders , true );
					if( intersects.length > 0 ) {
						if( intersects[0].distance < rayCaster.far ) {
							navigable = 0;
							i = directions.length+1;
						}
					}
				}
			
				const index = ((z*mapX)+x)*4;
				this.pixelData.data[index] = 0;
				this.pixelData.data[index+1] = height;
				this.pixelData.data[index+2] = navigable;
				this.pixelData.data[index+3] = 255;
				
			}
			console.log( (x*100/mapX).toFixed(2) + '%' );
		}
		
		console.log( this.pixelData );
		this.context.putImageData(this.pixelData, 0,0);
		
	}

}

console.log( 'World Init' );