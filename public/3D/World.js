import * as THREE from './../build/three.module.js';
import { G } from './G.js';

export class World {

	constructor() {
		
		this.collapse = [];
		
		this.loaded = 0;
		let self = this;
		this.map = new THREE.Group();
		this.colliders = [];
		
		this.wireframe = new THREE.MeshBasicMaterial({
			color: 0x00ff00,
			visible: false,
		});
		
		let mat = new THREE.MeshStandardMaterial({
			color: 0x6D6E71,
		});
		let geo = new THREE.PlaneGeometry(
			85000,85000
		);
		this.floorPlane = new THREE.Mesh( geo , mat );
		this.floorPlane.rotation.set( -Math.PI/2 , 0 , 0 );
		this.floorPlane.position.set( 0 , -20 , 0 );
		G.scene.add( this.floorPlane );
			
		
		G.fbx.load( '/high/city/Foliage.fbx' , model => {
			
			model.traverse( (child) => {
				if( child.isMesh ) {
					child.geometry.computeBoundingBox();
					child.geometry.needsUpdate = true;

					//child.castShadow = true;
					//child.receiveShadow = true;
					
					child.rotation.y = Math.random() * Math.PI * 2;
					child.scale.set( 0.4+Math.random()*0.2 , 0.4+Math.random()*0.2 , 0.4+Math.random()*0.2 );
					
					//self.addToColliders( child );
					
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
		
		self.buildings = [];
		
		G.fbx.load( '/high/city/CityCentre.fbx' , model => {
			
			model.traverse( (child) => {
				
				if( child.name === 'Buildings' ) {
					child.children.map( building => {
						building.geometry.computeBoundingBox();
						
						let type, armour, hp, collapse;
						if( building.name.indexOf( 'wall' ) > -1 ) {
							type = 'Wall';
							armour = 1;
							hp = 3;						
						}
						else if( building.name.indexOf( 'fence' ) > -1 ) {
							type = 'Fence';
							armour = 0;
							hp = 1;
						}
						else if( building.name.indexOf( 'hedge' ) > -1 ) {
							type = 'Hedge';
							armour = 0;
							hp = 3;				
						}
						else if( building.name.indexOf( 'wheeliebin' ) > -1 ) {
							type = 'Wheelie Bin';
							armour = 0;
							hp = 1;
						}
						else if( building.name.indexOf( 'shed' ) > -1 ) {
							type = 'Shed';
							armour = 0;
							hp = 3;
						}
						else if( building.name.indexOf( 'electricalbox' ) > -1 ) {
							type = 'Electrical Box';
							armour = 0;
							hp = 1;
						}
						else if( building.name.indexOf( 'telegraphpole' ) > -1 || building.name.indexOf( 'goalposts' ) > -1 ) {
							type = 'Telegraph Pole';
							armour = 0;
							hp = 1;
						}
						else {
							type = 'Building';
							armour = 3;
							let width = building.geometry.boundingBox.max.x - building.geometry.boundingBox.min.x;
							let length = building.geometry.boundingBox.max.z - building.geometry.boundingBox.min.z;
							hp = 1 + Math.floor( ( width * length ) / 5000 );
						}
						
						let x = Math.floor( building.position.x / 1000 );
						let z = Math.floor( building.position.z / 1000 );
						
						if( ! self.buildings[z] ) self.buildings[z] = [];
						if( ! self.buildings[z][x] ) self.buildings[z][x] = [];

						self.buildings[z][x].push({
							ent: building,
							bounds: {
								min: { x: building.geometry.boundingBox.min.x , z: building.geometry.boundingBox.min.z },
								max: { x: building.geometry.boundingBox.max.x , z: building.geometry.boundingBox.max.z },
							},
							type: type,
							armour: armour,
							hp: hp,
						});
					});
				}
				
				if( child.isMesh ) {
					
					child.geometry.computeBoundingBox();
					child.geometry.needsUpdate = true;
					
					//child.castShadow = true;
					//child.receiveShadow = true;
					
					//self.addToColliders( child );
					
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
		
		this.context.putImageData(this.pixelData, 0,0);
		
	}
	
	destroy( x,z,area=1 ) {
		
		let mx = Math.floor( x/1000 );
		let mz = Math.floor( z/1000 );

		if( this.buildings[mz] && this.buildings[mz][mx] ) {
			this.buildings[mz][mx].map( building => {
				if( building.hp > 0 ) {
					
					let destroy = false;
					if( x-area > building.bounds.min.x && x+area < building.bounds.max.x
					&&	z-area > building.bounds.min.z && z+area < building.bounds.max.z
					) {
						destroy = true;
					}
					else {
						let dx = building.ent.position.x - x;
						let dz = building.ent.position.z - z;
						let dr = Math.sqrt( dx*dx + dz*dz );
						if( dr < area ) destroy = true;
					}
					
					if( destroy ) {
						building.hp = 0;
						building.destroyOrigin = {
							x: x,
							z: z,
						};
						this.collapse.push( building );
						console.log( 'destroying' , building );
					}
				}
			});
		}

	}
	
	update( delta ) {
		let removeIndex = [];
		this.collapse.map( (building,index) => {

			let keep;
			if( ['Wall','Hedge'].includes( building.type ) ) {
				keep = this.collapseFall({ building , delta });
			}
			else if( ['Telegraph Pole','Fence','Wheelie Bin'].includes( building.type ) ) {
				keep = this.collapseBounce({ building , delta });
			}
			else if( ['Shed','Building','Electrical Box'].includes( building.type ) ) {
				keep = this.collapseDust({ building , delta });
			}
			if( ! keep ) {
				console.log( building.ent );
				if( building.ent.parent ) {
					building.ent.parent.remove( building.ent );
				}
				G.scene.remove( building.ent );
				removeIndex.push( index );
			}
		});
		while( removeIndex.length > 0 ) {
			this.collapse.splice( removeIndex.shift() , 1 );
		}
	}
	collapseFall({ building , delta }) {
		if( ! building.fallSide ) {
			building.fallSide = Math.floor( Math.random() * 2 );
		}
		if( building.fallSide === 0 ) {
			let angle = Math.min( Math.PI/2 , building.ent.rotation.z + delta );
			if( angle === Math.PI/2 ) return false;
			building.ent.rotation.set( building.ent.rotation.x , building.ent.rotation.y , angle );
		}
		else {
			let angle = Math.max( -Math.PI/2 , building.ent.rotation.z - delta );
			if( angle === -Math.PI/2 ) return false;
			building.ent.rotation.set( building.ent.rotation.x , building.ent.rotation.y , angle );			
		}
		return true;
	}
	collapseBounce({ building , delta }) {
		if( ! building.bounceMomentum ) {
			let dx = building.ent.position.x - building.destroyOrigin.x;
			let dz = building.ent.position.z - building.destroyOrigin.z;
			let dr = Math.sqrt( dx*dx + dz*dz );
			building.bounceMomentum = ( 500 / (dr + 1) ) * 500 * Math.random();
			building.bounceFacing = Math.atan2( dx , dz );
			building.bounceAttitude = Math.PI * Math.random();
			building.spinX = Math.random() * Math.PI/5;
			building.spinY = Math.random() * Math.PI/5;
			building.spinZ = Math.random() * Math.PI/5;
		}
		
		let x = Math.cos( building.bounceFacing ) * building.bounceMomentum * delta;
		let z = Math.sin( building.bounceFacing ) * building.bounceMomentum * delta;
		let y = Math.cos( building.bounceAttitude ) * building.bounceMomentum * delta;
		let sin = Math.sin( building.bounceAttitude );
		x *= sin;
		z *= sin;
		
		y = building.ent.position.y + y;
		if( y < 0 ) {
			building.bounceMomentum *= 0.95;
			building.bounceAttitude = Math.abs( building.bounceAttitude ) * 0.95;
			
			building.spinX = Math.random() * Math.PI/5;
			building.spinY = Math.random() * Math.PI/5;
			building.spinZ = Math.random() * Math.PI/5;
			building.bounceFacing += Math.random()*0.8 - 0.4;
			if( building.bounceMomentum < 25 ) {
				return false;
			}
		}
		else {
			building.bounceAttitude = Math.max( -Math.PI , building.bounceAttitude - delta );
		}
		building.ent.position.set( building.ent.position.x + x , y , building.ent.position.z + z );
		building.ent.rotation.set(
			building.ent.rotation.x + building.spinX * delta,
			building.ent.rotation.y + building.spinY * delta,
			building.ent.rotation.z + building.spinZ * delta,
		);
		
		return true;
		
	}
	collapseDust({ building, delta }) {
		return false;
	}
	
	updateForCam( camIndex ) {
		this.floorPlane.position.set(
			G.camera[ camIndex ].position.x,
			-20,
			G.camera[ camIndex ].position.z,
		);
	}

}

console.log( 'World Init' );