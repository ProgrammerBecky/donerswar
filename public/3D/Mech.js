import * as THREE from './../build/three.module.js';
import { G } from './G.js';

const WORLD_SIZE = 85000;
const NAV_MAP_SIZE = 1024;
const NAV_TO_WORLD_SCALE = WORLD_SIZE / NAV_MAP_SIZE;

export class Mech {
	
	constructor() {

		this.mechs = [
			{"assembly":{
				"legs": "high/mechs/Legs_Lt.glb",
				"cockpit": "high/mechs/Cockpit2.glb",
				"shoulderR": "high/mechs/RHalfShoulder_lt_frame.glb",
				"weaponL": "high/mechs/Weapons_Laser_lvl1.glb",
				"weaponT": "high/mechs/Weapons_cannon_lvl1.glb"
			}},
			{"assembly":{
				"legs": "high/mechs/Legs_Lt.glb",
				"cockpit": "high/mechs/Cockpit1.glb",
				"shoulderL": "high/mechs/HalfShoulder_Wall.glb",
				"shoulderR": "high/mechs/RHalfShoulder_Wall.glb",
				"weaponL": "high/mechs/Weapons_Flamethrower_lvl3.glb",
				"weaponR": "high/mechs/Weapons_machinegun_lvl3.glb"
			}},
			{"assembly":{
				"legs": "high/mechs/Legs_LtMd.glb",
				"hips": "high/mechs/Hips3.glb",
				"cockpit": "high/mechs/Cockpit4.glb",
				"backpack": "high/mechs/Backpack_container.glb",
				"shoulderL": "high/mechs/HalfShoulder_Med_Frame.glb",
				"shoulderR": "high/mechs/RHalfShoulder_Med_Frame.glb",
				"weaponL": "high/mechs/Weapons_minigun_lvl5@Weapons_minigun_lvl5_shoot.glb",
				"weaponR": "high/mechs/Weapons_cannon_lvl5.glb",
				"weaponSL": "high/mechs/Weapons_rockets_shoulder_lvl2.glb",
				"weaponSR": "high/mechs/Weapons_machinegun_lvl5.glb",
				"weaponT": "high/mechs/Weapons_Flamethrower_lvl5.glb"
			}},
			{"assembly":{
				"legs": "high/mechs/Legs_Md.glb",
				"hips": "high/mechs/Hips0.glb",
				"cockpit": "high/mechs/Cockpit3.glb",
				"backpack": "high/mechs/Backpack_Ballons.glb",
				"shoulderL": "high/mechs/HalfShoulder_Shield.glb",
				"shoulderR": "high/mechs/RHalfShoulder_Shield.glb",
				"weaponL": "high/mechs/Weapons_rockets_2x_lvl5.glb",
				"weaponR": "high/mechs/Weapons_rockets_2x_lvl5.glb",
				"weaponSL": "high/mechs/TopWeapons_rockets_1x_lvl5.glb",
				"weaponSR": "high/mechs/TopWeapons_rockets_1x_lvl5.glb",
				"weaponT": "high/mechs/TopWeapons_rockets_2x_lvl5.glb"
			}},
		];

		this.material = new THREE.MeshLambertMaterial({
			map: G.texture.load( 'high/mechs/Mechs_diffuse_atlas_beige.png' ),
			normalMap: G.texture.load( 'high/mechs/Mechs_LtMed_Normals.png' ),
			specularMap: G.texture.load( 'high/mechs/Mechs_LtMed_Unity_Specular.png' ),
			skinning: true,
		});
		
		this.mechs.map( (object,index) => {
			object.id = index;
			object.leftWeaponMount = 'Mount_Weapon_L';
			object.rightWeaponMount = 'Mount_Weapon_R';
			object.cockpitMount = 'Mount_top';			
			object.mounts = [];
			object.mRots = [];
			object.ent = new THREE.Group();
			object.x = 42500,
			object.z = 42500,
			this.loadAssembly({ object });
		});
		
	}
	
	loadAssembly({ object }){

		let loadingBone;
		for( let i in object.assembly ) {

			switch( i ) {
				case 'legs':
					this.loadMechPart({
						object,
						filename: object.assembly[i]
					});
					delete object.assembly[i];
					return;
				case 'hips':
					loadingBone = object.cockpitMount;
					object.cockpitMount = 'Mount_cockpit';
					object.leftWeaponMount = 'Mount_Weapon_HL';
					object.rightWeaponMount = 'Mount_Weapon_HR';
					this.loadMechPart({
						object,
						filename: object.assembly[i],
						loadingBone: loadingBone,
						mount: 'hip_tractor',
					});
					delete object.assembly[i];
					return;
				case 'cockpit':			
					this.loadMechPart({
						object,
						filename: object.assembly[i],
						loadingBone: object.cockpitMount,
						mount: 'Cockpit_tractor',
					});
					delete object.assembly[i];
					return;
				case 'backpack':
					this.loadMechPart({
						object,
						filename: object.assembly[i],
						loadingBone: 'Mount_backpack',
					});
					delete object.assembly[i];
					return;
				case 'shoulderL':
					loadingBone = object.leftWeaponMount;
					object.leftWeaponMount = 'Mount_Weapon_SL';
					this.loadMechPart({
						object,
						filename: object.assembly[i],
						loadingBone: loadingBone,
					});
					delete object.assembly[i];
					return;
				case 'shoulderR':
					loadingBone = object.rightWeaponMount;
					object.rightWeaponMount = 'Mount_Weapon_SR';
					this.loadMechPart({
						object,
						filename: object.assembly[i],
						loadingBone: loadingBone,
					});
					delete object.assembly[i];
					return;					
				case 'weaponL':
					this.loadMechPart({
						object,
						filename: object.assembly[i],
						loadingBone: object.leftWeaponMount,
					});
					delete object.assembly[i];
					return;
				case 'weaponR':
					this.loadMechPart({
						object,
						filename: object.assembly[i],
						loadingBone: object.rightWeaponMount,
					});
					delete object.assembly[i];
					return;
				case 'weaponSL':
					this.loadMechPart({
						object,
						filename: object.assembly[i],
						loadingBone: 'Mount_Shoulder_rockets_lvl1_L',
					});
					delete object.assembly[i];
					return;						
				case 'weaponSR':
					this.loadMechPart({
						object,
						filename: object.assembly[i],
						loadingBone: 'Mount_Shoulder_rockets_lvl1_R',
					});
					delete object.assembly[i];
					return;	
				case 'weaponT':
					this.loadMechPart({
						object,
						filename: object.assembly[i],
						loadingBone: 'Mount_Weapon_top',
					});
					delete object.assembly[i];
					return;	
			}
			
		}	
		
		object.ent.position.set( 42500 + (Math.random() * 2500)*2-1 , 0 , 42500 + (Math.random() * 2500)*2-1 );
		object.x = object.ent.position.x;
		object.z = object.ent.position.z;
		object.ent.scale.set(3,3,3);
		object.ent.rotation.set( 0 , Math.random() * Math.PI*2 , 0 );
		G.scene.add( object.ent );
		
		return object;
	}
		
	loadMechPart({ object , filename , loadingBone=false , mount=false }) {

		let self = this;
		G.gltf.load( filename , result => {
			
			result.scene.traverse( child => {
				if( child.isMesh ) {
					if( child.material.isArray ) {
						for( let i=0 ; i<child.material.length ; i++ ) {
							child.material[i] = self.material;
						}
					}
					else {
						child.material = self.material;
					}
				}
			});

			if( mount && ! object.cockpit_bevel ) {
				result.scene.traverse( child => {
					if( child.name === mount ) {
						object.cockpit_bevel = child;
					}
				});
			}

			if( loadingBone  ) {
				object.ent.traverse( mechParent => {
					if( mechParent.name === loadingBone ) {
						object.mounts.push( mechParent );
						object.mRots.push({
							x: mechParent.rotation.x,
							y: mechParent.rotation.y,
							z: mechParent.rotation.z
						});
						mechParent.add( result.scene );
					}
				});
			}
			else {
				object.ent.add( result.scene );
				object.animations = result.animations;
				self.animationSetup({object});
			}
					
			self.loadAssembly({ object });
			
		});
	
	}
	
	animationSetup({object}) {
		
		object.mixer = new THREE.AnimationMixer( object.ent );
		
		object.animations.map( anim => {
			if( anim.name.indexOf( 'idle' ) >-1 ) anim.name = 'Idle';
			if( anim.name.indexOf( 'run_faster' ) >-1 ) anim.name = 'Sprint';
			if( anim.name.indexOf( 'run' ) >-1 ) anim.name = 'Run';
			if( anim.name.indexOf( 'walk' ) >-1 ) anim.name = 'Walk';
			if( anim.name.indexOf( 'fall_forwar' ) > -1 ) anim.name = 'Death';
		});		
		
	}
	
	aim({ object , pan, facing }) {
		
		object.mounts.map( (mount,index) => {

			const tpan = new THREE.Vector2(
				pan.x,
				pan.y - facing,
			);
	
			switch( mount.name ) {
				case 'Mount_Weapon_L':
				case 'Mount_Weapon_HL':
					if( tpan.y < 0 ) tpan.y = 0;
					if( tpan.y > Math.PI/2 ) tpan.y = Math.PI/2;
					if( tpan.x < -0.65 ) tpan.x = -0.65;
					if( tpan.x > 0.65 ) tpan.x = 0.65;
					this.aimMount({ mount , tpan , right: false, baseRot: object.mRots[index] });
					break;
				case 'Mount_Weapon_top':
					if( tpan.x < -0.034 ) tpan.x = -0.034;
					if( tpan.x > 0.959 ) tpan.x = 0.959;
					if( tpan.y < -0.034 ) tpan.y = -0.034;
					if( tpan.y > 0.034 ) tpan.y = 0.034;
					this.aimMount({ mount , tpan , right: false, baseRot: object.mRots[index] });
					break;
				case 'Mount_Shoulder_rockets_lvl1_L':
					if( tpan.x < -0.187 ) tpan.x = -0.187;
					if( tpan.x > 0.187 ) tpan.x = 0.187;
					if( tpan.y < -0.187 ) tpan.y = -0.187;
					if( tpan.y > 0.187 ) tpan.y = 0.187;
					this.aimMount({ mount , tpan , right: false, baseRot: object.mRots[index] });
					break;
				case 'Mount_Shoulder_rockets_lvl1_R':
					if( tpan.x < -0.187 ) tpan.x = -0.187;
					if( tpan.x > 0.187 ) tpan.x = 0.187;
					if( tpan.y < -0.187 ) tpan.y = -0.187;
					if( tpan.y > 0.187 ) tpan.y = 0.187;
					this.aimMount({ mount , tpan , right: true, baseRot: object.mRots[index] });
					break;
				case 'Mount_Weapon_R':
				case 'Mount_Weapon_HR':
					if( tpan.y > 0 ) tpan.y = 0;
					if( tpan.y < -Math.PI/2 ) tpan.y = -Math.PI/2;
					if( tpan.x < -0.65 ) tpan.x = -0.65;
					if( tpan.x > 0.65 ) tpan.x = 0.65;
					this.aimMount({ mount , tpan , right: true, baseRot: object.mRots[index] });
					break;
				default:
					break;
			}
		});

	}
	aimMount({ mount , tpan , right , baseRot }) {
		if( right ) {
			mount.rotation.set(
				baseRot.x-tpan.x,
				baseRot.y-tpan.y,
				baseRot.z
			);
		}
		else {
			mount.rotation.set( baseRot.x-tpan.x , baseRot.y+tpan.y , baseRot.z );
		}

	}	
	
		
		
	setAnimation({ mech }) {

		if( mech.animAction ) {
			mech.animAction.stop();
		}
		
		const clip = THREE.AnimationClip.findByName( mech.animations , mech.action );
		mech.animAction = mech.mixer.clipAction( clip );
		mech.animAction.play();		
		
	}
	
	newAction( id , action ) {
		if( this.mechs[id].mixer ) {
			this.mechs[id].action = action;
			this.setAnimation({ mech: this.mechs[id] });
		}
	}
		
	newRoute({
		unit, dx, dz, route
	}) {
		this.mechs[ unit ].dx = dx;
		this.mechs[ unit ].dz = dz;
		this.mechs[ unit ].route = route;
	}
		
	update( delta ) {
		this.mechs.map( (mech) => {
			if( mech.mixer ) {
				
				//Rotate Body
				if( mech.cockpit_bevel ) {
					const right = G.cameraPan[mech.id].y - mech.cockpit_bevel.rotation.y;
					const left = mech.cockpit_bevel.rotation.y - G.cameraPan[mech.id].y;
					const rotSpeed = delta * 0.75;
					if( right > left ) {
						if( right > rotSpeed ) {
							mech.cockpit_bevel.rotation.y += rotSpeed;
						}
						else {
							mech.cockpit_bevel.rotation.y = G.cameraPan[mech.id].y;
						}
					}
					else if( left > right ) {
						if( left > rotSpeed ) {
							mech.cockpit_bevel.rotation.y -= rotSpeed;
						}
						else {
							mech.cockpit_bevel.rotation.y = G.cameraPan[mech.id].y;
						}
					}

					this.aim({
						object: mech,
						pan: G.cameraPan[mech.id],
						facing: mech.cockpit_bevel.rotation.y,
					});
				}
				
				//action
				if( mech.route ) {
					this.followRoute({ mech, delta });
				}
				else if( ! mech.action ) {
					mech.action = 'Idle';
					this.setAnimation({ mech });
				}

				mech.mixer.update( delta );
				
				
				//FPS Camera
				G.camera[mech.id].position.set( mech.ent.position.x , mech.ent.position.y + 1500 , mech.ent.position.z );
				G.camera[mech.id].rotation.set( G.cameraPan[mech.id].x , Math.PI + G.cameraPan[mech.id].y + mech.ent.rotation.y , 0 );
				G.camera[mech.id].translateZ( G.cameraZoom[mech.id] );
			}
		});
	}
	followRoute({ mech, delta }) {
		
		let x = Math.floor( mech.x / NAV_TO_WORLD_SCALE );
		let z = Math.floor( mech.z / NAV_TO_WORLD_SCALE );

		let sx = Math.floor( mech.x / NAV_TO_WORLD_SCALE );
		let sz = Math.floor( mech.z / NAV_TO_WORLD_SCALE );
		if( ! mech.route[z] || ! mech.route[z][x] || mech.route[z][x] === 'DESTINATION' ) {
			mech.action = 'Idle';
			this.setAnimation({ mech });
			console.log( 'DESTINATION' , mech.x , mech.dx , mech.z , mech.dz );
			mech.route = false;
			return;
		}
		//console.log( mech.route[z][x] , { x: sx , z: sz } );
		//console.log( '>' , mech.route[z][x].x-sx , mech.route[z][x].z-sz );

		let targetX = mech.route[z][x].x * NAV_TO_WORLD_SCALE;
		let targetZ = mech.route[z][x].z * NAV_TO_WORLD_SCALE;

		const dx = targetX - mech.x;
		const dz = targetZ - mech.z;
		const df = Math.atan2( dx , dz );
		
		let moveSpeed = delta * 450;
		
		let right = df - mech.ent.rotation.y;
		if( right < 0 ) right += Math.PI*2;
		let left = mech.ent.rotation.y - df;
		if( left < 0 ) left += Math.PI*2;
		const rotSpeed = delta * 0.5;
		
		moveSpeed = ( Math.abs( df - mech.ent.rotation.y ) < 0.05 )
			? delta * 400
			: delta * 80;
		
		if( right < left ) {
			if( right > rotSpeed ) {
				if( right > Math.PI/2 ) moveSpeed = 0;
				mech.ent.rotation.y += rotSpeed;
				G.cameraPan[mech.id].y -= rotSpeed;
			}
			else {
				mech.ent.rotation.y = df;
			}
		}
		else if( left < right ) {
			if( left > rotSpeed ) {
				if( left > Math.PI/2 ) moveSpeed = 0;
				mech.ent.rotation.y -= rotSpeed;
				G.cameraPan[mech.id].y += rotSpeed;
			}
			else {
				mech.ent.rotation.y = df;
			}
		}
		
		if( moveSpeed > 0 ) {
			if( mech.action !== 'Walk' ) {
				mech.action = 'Walk';
				this.setAnimation({ mech });
			}
			mech.x += Math.sin( mech.ent.rotation.y ) * moveSpeed;
			mech.z += Math.cos( mech.ent.rotation.y ) * moveSpeed;
			const dr = Math.sqrt( dx*dx + dz*dz );
		}
		else if( mech.action !== 'Idle' ) {
			mech.action = 'Idle';
			this.setAnimation({ mech });
		}		

		mech.ent.position.set( mech.x , mech.ent.position.y , mech.z );
		G.world.destroy( mech.ent.position.x , mech.ent.position.z , 500 );
		
	}
}