import * as THREE from './../build/three.module.js';
import { G } from './G.js';

const WORLD_SIZE = 85000;
const NAV_MAP_SIZE = 1024;
const NAV_TO_WORLD_SCALE = WORLD_SIZE / NAV_MAP_SIZE;

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

					const { type , armour , hp , collapse , lightness } = this.getMeshLookup({ building: child });
					if( hp > 0 ) {

						let x = Math.floor( child.position.x / 1000 );
						let z = Math.floor( child.position.z / 1000 );
						
						if( ! self.buildings[z] ) self.buildings[z] = [];
						if( ! self.buildings[z][x] ) self.buildings[z][x] = [];

						self.buildings[z][x].push({
							ent: child,
							bounds: {
								min: { x: child.geometry.boundingBox.min.x , z: child.geometry.boundingBox.min.z },
								max: { x: child.geometry.boundingBox.max.x , z: child.geometry.boundingBox.max.z },
							},
							type: type,
							armour: armour,
							hp: hp,
							lightness: lightness,
						});
					}

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
				if( child.isMesh ) {
						
					child.geometry.computeBoundingBox();
					child.geometry.needsUpdate = true;
					const { type , armour , hp , collapse , lightness } = this.getMeshLookup({ building: child });

					if( hp > 0 ) {

						let x = Math.floor( child.position.x / 1000 );
						let z = Math.floor( child.position.z / 1000 );
						
						if( ! self.buildings[z] ) self.buildings[z] = [];
						if( ! self.buildings[z][x] ) self.buildings[z][x] = [];

						self.buildings[z][x].push({
							ent: child,
							bounds: {
								min: { x: child.geometry.boundingBox.min.x , z: child.geometry.boundingBox.min.z },
								max: { x: child.geometry.boundingBox.max.x , z: child.geometry.boundingBox.max.z },
							},
							type: type,
							armour: armour,
							hp: hp,
							lightness: lightness,
						});
					}
					
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
	getMeshLookup({ building }) {

		let type = 'Unknown', armour = 0, hp = 0, collapse = 0, lightness = 0, navigable = 255;
		if( building.name.indexOf( 'wall' ) > -1 ) {
			type = 'Wall';
			armour = 1;
			hp = 3;			
			lightness = 0.2;
			navigable = 64;
		}
		else if( building.name.indexOf( 'Barrier' ) > -1 ) {
			type = 'Barrier';
			armour = 1;
			hp = 3;
			lightness = 0.3;
			navigable = 128;
		}
		else if( building.name.indexOf( 'fence' ) > -1 ) {
			type = 'Fence';
			armour = 0;
			hp = 1;
			lightness = 0.4;
			navigable = 160;
		}
		else if( building.name.indexOf( 'hedge' ) > -1 || building.name.indexOf( 'Bush' ) > -1 ) {
			type = 'Hedge';
			armour = 0;
			hp = 3;			
			lightness = 0.25;
			navigable = 128;
		}
		else if( building.name.indexOf( 'wheeliebin' ) > -1 ) {
			type = 'Wheelie Bin';
			armour = 0;
			hp = 1;
			lightness = 0.5;
			navigable = 245;
		}
		else if( building.name.indexOf( 'shed' ) > -1 ) {
			type = 'Shed';
			armour = 0;
			hp = 3;
			lightness = 0.1;
			navigable = 96;
		}
		else if( building.name.indexOf( 'electricalbox' ) > -1 ) {
			type = 'Electrical Box';
			armour = 0;
			hp = 1;
			lightness = 0.2;
			navigable = 64;
		}
		else if(
			building.name.indexOf( 'telegraphpole' ) > -1
			|| building.name.indexOf( 'goalposts' ) > -1
			|| building.name.indexOf( 'Lantern' ) > -1
			|| building.name.indexOf( 'TrafficLight' ) > -1
			|| building.name.indexOf( 'Pole' ) > -1
			|| building.name.indexOf( 'Sign' ) > -1
			|| building.name.indexOf( 'Pillar' ) > -1
		) {
			type = 'Telegraph Pole';
			armour = 0;
			hp = 1;
			lightness = 0.4;
			navigable = 200;
		}
		else if( building.name.indexOf( 'Tree' ) > -1 ) {
			type = 'Tree';
			armour = 1;
			hp = 5;
			lightness = 0.25;
			navigable = 96;
		}
		else if(
			building.name.indexOf( 'sidewalk' ) > -1
			|| building.name.indexOf( 'RoadBase' ) > -1
			|| building.name.indexOf( 'Intersection' ) > -1
			|| building.name.indexOf( 'Turn' ) > -1
			|| building.name.indexOf( 'Straight' ) > -1
			|| building.name.indexOf( 'park' ) > -1
		) { 
			hp = 0;
			navigable = 255;
		}
		else if(
			building.name.indexOf( 'ukpub' ) > -1
			|| building.name.indexOf( 'ukcommercial' ) > -1
			|| building.name.indexOf( 'bungalow' ) > -1
			|| building.name.indexOf( 'terrace' ) > -1
			|| building.name.indexOf( 'semi' ) > -1
			|| building.name.indexOf( 'house' ) > -1
			|| building.name.indexOf( 'flat' ) > -1
			|| building.name.indexOf( 'supermarket' ) > -1
			|| building.name.indexOf( 'industrial' ) > -1
			|| building.name.indexOf( 'medicalpractice' ) > -1
			|| building.name.indexOf( 'firestation' ) > -1
			|| building.name.indexOf( 'police' ) > -1
			|| building.name.indexOf( 'hotel' ) > -1
			|| building.name.indexOf( 'bank' ) > -1
			|| building.name.indexOf( 'footystad' ) > -1
			|| building.name.indexOf( 'cottage' ) > -1
			|| building.name.indexOf( 'hotel' ) > -1
		) {
			type = 'Building';
			armour = 3;
			let width = building.geometry.boundingBox.max.x - building.geometry.boundingBox.min.x;
			let length = building.geometry.boundingBox.max.z - building.geometry.boundingBox.min.z;
			hp = 1 + Math.floor( ( width * length ) / 5000 );
			lightness = 0;
			navigable = 0;
		}
		else {
			console.log( building.name );
		}

		return { type, armour, hp, collapse, lightness, navigable };
		
	}
	rebuildNavMap({ canvas , mapData, width, height }) {

		this.width = width;
		this.height = height;

		let rayCaster = new THREE.Raycaster();
		const source = new THREE.Vector3();
		const dir = new THREE.Vector3();

		const context = canvas.getContext( '2d' );
		
		for( let x=0 ; x<this.width ; x++ ) {
			console.log( x );
			for( let z=0 ; z<this.height ; z++ ) {
				
				let wx = x*NAV_TO_WORLD_SCALE;
				let wz = z*NAV_TO_WORLD_SCALE;
				
				let navigable = 255;
				let height = 0;
			
				//height
				rayCaster.near = 0;
				rayCaster.far = 5500;
				source.set( wx , 5000 , wz );
				dir.set( 0 , -1 , 0 );
				rayCaster.set( source , dir );
				const intersects = rayCaster.intersectObject( this.map , true );
				if( intersects.length > 0 ) {
					let { navigable: setNavigable } = this.getMeshLookup({ building: intersects[0].object });
					navigable = setNavigable;
				}				
				
				const index = ((z*this.width)+x)*4;
				mapData.data[index] = ( navigable === 0 ) ? 255 : 0;;
				mapData.data[index+1] = ( navigable === 255 ) ? 255 : 0;
				mapData.data[index+2] = navigable;
				mapData.data[index+3] = 255;				
				
			}
		}
		
		context.putImageData(mapData, 0,0);
		
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
	}
	
	destroy( x,z,area=1 ) {
		
		let mx = Math.floor( x/1000 );
		let mz = Math.floor( z/1000 );

		if( this.buildings[mz] && this.buildings[mz][mx] ) {
			this.buildings[mz][mx].map( building => {
				if( building.hp > 0 ) {
					
					let destroy = false;
					if( x+area > building.bounds.min.x && x-area < building.bounds.max.x
					&&	z+area > building.bounds.min.z && z-area < building.bounds.max.z
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
			if( ['Electrical Box','Shed','Wall','Hedge','Telegraph Pole','Fence','Wheelie Bin'].includes( building.type ) ) {
				keep = this.collapseBounce({ building , delta: delta });
			}
			else if( [,'Building'].includes( building.type ) ) {
				keep = this.collapseDust({ building , delta });
			}
			if( ! keep ) {
				console.log( building.ent );
				if( building.ent.parent ) {
					building.ent.parent.remove( building.ent );
				}
				building.ent.position.set( 85000*10,-85000*10,-85000*10 );
				G.scene.remove( building.ent );
				removeIndex.push( index );
			}
		});
		removeIndex = removeIndex.reverse();
		while( removeIndex.length > 0 ) {
			this.collapse.splice( removeIndex.shift() , 1 );
		}
	}
	collapseBounce({ building , delta }) {
		if( ! building.bounceMomentum ) {
			let dx = building.ent.position.x - building.destroyOrigin.x;
			let dz = building.ent.position.z - building.destroyOrigin.z;
			let dr = Math.sqrt( dx*dx + dz*dz );
			building.bounceMomentum = ( 500 / (dr + 1) ) * 2000 * Math.random() * building.lightness;;
			building.bounceFacing = Math.atan2( dx , dz );
			building.bounceAttitude = Math.PI * Math.random();
			building.spinX = Math.random() * Math.PI/6;
			building.spinY = Math.random() * Math.PI/6;
			building.spinZ = Math.random() * Math.PI/6;
			building.gravity = 0;
		}
		
		let x = Math.cos( building.bounceFacing ) * building.bounceMomentum * delta;
		let z = Math.sin( building.bounceFacing ) * building.bounceMomentum * delta;
		let vertical = Math.cos( building.bounceAttitude );
		let y = vertical * building.bounceMomentum * delta;
		vertical = 1 - Math.abs( vertical );
		x *= vertical;
		z *= vertical;

		building.gravity += delta;
		y = building.ent.position.y + y - building.gravity;
		if( y < 0 && building.bounceAttitude < 0 ) {
			building.bounceMomentum *= building.lightness;
			building.bounceAttitude = Math.abs( building.bounceAttitude ) * 0.3;
			
			building.spinX *= 0.9
			building.spinY *= 0.9
			building.spinZ *= 0.9			
			building.bounceFacing += Math.random()*0.4 - 0.2;
			building.gravity = 0;
			if( building.bounceMomentum < 50 ) {
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