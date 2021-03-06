import * as THREE from './../build/three.module.js';
import { G } from './G.js';

const WORLD_SIZE = 85000;
const NAV_MAP_SIZE = 512;
const NAV_TO_WORLD_SCALE = WORLD_SIZE / NAV_MAP_SIZE;

const laserMat = new THREE.LineBasicMaterial({
	color: 0xff8800
});

export class Mech {
	
	constructor() {

		this.vector = new THREE.Vector3();
		this.dir = new THREE.Vector3();
		this.raycaster = new THREE.Raycaster();

		this.mechs = [
			{
				"assembly":{
					"legs": G.path+"mechs/Legs_Lt.glb",
					"cockpit": G.path+"mechs/Cockpit2.glb",
					"shoulderR": G.path+"mechs/RHalfShoulder_lt_frame.glb",
					"weaponL": G.path+"mechs/Weapons_Laser_lvl1.glb",
					"weaponT": G.path+"mechs/Weapons_cannon_lvl1.glb"
				},
				"guns": [
					{
						"type": "canon",
						"barrelEnd": "weaponT",
						"mount": "Mount_Weapon_top",
						"offsetX": 0,
						"invertArcY": true,
						"damage": 500,
					},
					{
						"type": "laser",
						"barrelEnd": "weaponL",
						"mount": "Mount_Weapon_L",
						"offsetX": 0,
						"invertArcY": false,
						"damage": 5,
					}
				],
				"lightRef": "Spotlight",
				"spotlight": false,
				"hp": 10,
				"maxHp": 10,
				"cockpitHeight": 250
			},
			{
				"assembly":{
					"legs": G.path+"mechs/Legs_Lt.glb",
					"cockpit": G.path+"mechs/Cockpit1.glb",
					"shoulderL": G.path+"mechs/HalfShoulder_Wall.glb",
					"shoulderR": G.path+"mechs/RHalfShoulder_Wall.glb",
					"weaponL": G.path+"mechs/Weapons_Flamethrower_lvl3.glb",
					"weaponR": G.path+"mechs/Weapons_machinegun_lvl3.glb"
				},
				"guns": [
					{
						"type": "flamer",
						"barrelEnd": "weaponL",
						"mount": "Mount_Weapon_L",
						"offsetX": 0,
						"invertArcY": true,
						"damage": 1,
					},
					{
						"type": "machinegun",
						"barrelEnd": "weaponR",
						"mount": "Mount_Weapon_R",
						"offsetX": 0,
						"invertArcY": false,
						"damage": 6,
					}	
				],
				"lightRef": false,
				"hp": 20,
				"maxHp": 20,
				"cockpitHeight": 250
			},
			{
				"assembly":{
					"legs": G.path+"mechs/Legs_LtMd.glb",
					"hips": G.path+"mechs/Hips3.glb",
					"cockpit": G.path+"mechs/Cockpit4.glb",
					"backpack": G.path+"mechs/Backpack_container.glb",
					"shoulderL": G.path+"mechs/HalfShoulder_Med_Frame.glb",
					"shoulderR": G.path+"mechs/RHalfShoulder_Med_Frame.glb",
					"weaponL": G.path+"mechs/Weapons_minigun_lvl5@Weapons_minigun_lvl5_shoot.glb",
					"weaponR": G.path+"mechs/Weapons_cannon_lvl5.glb",
					"weaponSL": G.path+"mechs/Weapons_rockets_shoulder_lvl2.glb",
					"weaponSR": G.path+"mechs/Weapons_rockets_shoulder_lvl2.glb",
					"weaponT": G.path+"mechs/Weapons_Flamethrower_lvl5.glb"
				},
				"guns": [
					{
						"type": "canon",
						"barrelEnd": "weaponR",
						"mount": "Mount_Weapon_HR",
						"offsetX": 0,
						"invertArcY": false,
						"damage": 500,
					},
					{
						"type": "flamer",
						"barrelEnd": "weaponT",
						"mount": "Mount_Weapon_top",
						"offsetX": 0,
						"invertArcY": true,
						"damage": 1,
					},		
					{
						"type": "rockets",
						"barrelEnd": "weaponSR",
						"mount": "Mount_Shoulder_rockets_lvl1_R",
						"offsetX": 0,
						"invertArcY": false,
					},				
					{
						"type": "machinegun",
						"barrelEnd": "weaponL",
						"mount": "Mount_Weapon_HL",
						"offsetX": 0,
						"invertArcY": true,
						"damage": 12,
					},	
					{
						"type": "rockets",
						"barrelEnd": "weaponSL",
						"mount": "Mount_Shoulder_rockets_lvl1_L",
						"offsetX": 0,
						"invertArcY": true,
					}					
				],
				"lightRef": false,
				"hp": 40,
				"maxHp": 40,
				"cockpitHeight": 300
			},
			{
				"assembly":{
					"legs": G.path+"mechs/Legs_Md.glb",
					"hips": G.path+"mechs/Hips0.glb",
					"cockpit": G.path+"mechs/Cockpit3.glb",
					"backpack": G.path+"mechs/Backpack_Ballons.glb",
					"shoulderL": G.path+"mechs/HalfShoulder_Elf.glb",
					"shoulderR": G.path+"mechs/RHalfShoulder_Elf.glb",
					"weaponL": G.path+"mechs/Weapons_cannon_lvl5.glb",
					"weaponR": G.path+"mechs/Weapons_cannon_lvl5.glb",
					"weaponSL": G.path+"mechs/Weapons_Flamethrower_lvl5.glb",
					"weaponSR": G.path+"mechs/Weapons_Flamethrower_lvl5.glb",
					"weaponT": G.path+"mechs/TopWeapons_rockets_2x_lvl5.glb"
				},
				"guns": [
					{
						"type": "flamer",
						"barrelEnd": "weaponSL",
						"mount": "Mount_Shoulder_rockets_lvl1_L",
						"offsetX": 0,
						"invertArcY": true,
						"damage": 2,
					},
					{
						"type": "flamer",
						"barrelEnd": "weaponSR",
						"mount": "Mount_Shoulder_rockets_lvl1_R",
						"offsetX": 0,
						"invertArcY": false,
						"damage": 2,
					},
					{
						"type": "canon",
						"barrelEnd": "weaponL",
						"mount": "Mount_Weapon_HL",
						"offsetX": 0,
						"invertArcY": true,
						"damage": 500,
					},
					{
						"type": "canon",
						"barrelEnd": "weaponR",
						"mount": "Mount_Weapon_HR",
						"offsetX": 0,
						"invertArcY": false,
						"damage": 500,
					},	
					{
						"type": "rockets",
						"barrelEnd": "weaponT",
						"mount": "Mount_Weapon_top",
						"offsetX": 0,
						"invertArcY": true,
					}
				],
				"lightRef": false,
				"hp": 40,
				"maxHp": 40,
				"cockpitHeight": 300
			},
		];

		this.material = G.lights.applyLightMap(
			new THREE.MeshStandardMaterial({
				name: 'BROWN-MECH',
				map: G.texture.load( G.path+'mechs/Mechs_diffuse_atlas_beige.png' ),
				normalMap: G.texture.load( G.path+'mechs/Mechs_LtMed_Normals.png' ),
				roughness: 1,
				metalness: 0,
				skinning: true,
				envMap: G.environmentMap,
			})
		);
		
		this.mechs.map( (object,index) => {
			object.id = index;
			object.leftWeaponMount = 'Mount_Weapon_L';
			object.rightWeaponMount = 'Mount_Weapon_R';
			object.cockpitMount = 'Mount_top';			
			object.mounts = [];
			object.mRots = [];
			object.ent = new THREE.Group();
			object.x = 0,
			object.z = ( index === 0 ) ? 42300 : -5000000,
			object.muzzleFlashes = [];
			object.barrelEnd = {};
			object.machineGunFiring = [];
			object.machineGunShots = [];
			object.routeCheck = 0;
			object.directRoute = false;
			object.stepSound = 0;
			object.active = ( index === 0 ) ? true : false;
			object.explodeStage = 0;
			object.inactiveTimer = ( index === 0 ) ? 0 : 60;
			this.loadAssembly({ object });
		});
		
	}
	
	updatePositions() {
		this.mechs.map( (mech) => {
			if( mech.active ) {
				mech.ent.position.set( mech.x , 0 , mech.z );
			}
		});
	}
	
	takeDamage({ mech , damage }) {
		mech.hp -= damage;
		self.postMessage({
			type: 'mech-damage',
			mechId: mech.id,
			hp: mech.hp,
			maxHp: mech.maxHp,
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
						barrel: i,
					});
					delete object.assembly[i];
					return;
				case 'weaponR':
					this.loadMechPart({
						object,
						filename: object.assembly[i],
						loadingBone: object.rightWeaponMount,
						barrel: i,
					});
					delete object.assembly[i];
					return;
				case 'weaponSL':
					this.loadMechPart({
						object,
						filename: object.assembly[i],
						loadingBone: 'Mount_Shoulder_rockets_lvl1_L',
						barrel: i,
					});
					delete object.assembly[i];
					return;						
				case 'weaponSR':
					this.loadMechPart({
						object,
						filename: object.assembly[i],
						loadingBone: 'Mount_Shoulder_rockets_lvl1_R',
						barrel: i,
					});
					delete object.assembly[i];
					return;	
				case 'weaponT':
					this.loadMechPart({
						object,
						filename: object.assembly[i],
						loadingBone: 'Mount_Weapon_top',
						barrel: i,
					});
					delete object.assembly[i];
					return;	
			}
			
		}	
		
		object.ent.position.set( object.x , 0 , object.z );
		object.x = object.ent.position.x;
		object.z = object.ent.position.z;
		object.ent.scale.set(3,3,3);
		object.ent.rotation.set( 0 , Math.PI/2 , 0 );
		object.cockpit_bevel.rotation.y = -Math.PI;
		G.scene.add( object.ent );
		
		return object;
	}
		
	spotlight( on ) {
		
		if( this.mechs[0].active ) {
			this.mechs[0].spotlight = on;
			if( on ) {
				this.mechs[0].lightRef = G.lights.registerLight({
					x: 0,
					z: 0,
					f: 0,
					splat: 4,
					splatSize: 32,
				});
			}
			else {
				G.lights.removeLight( this.mechs[0].lightRef );
				this.mechs[0].lightRef = false;
			}
		}
	}
		
	loadMechPart({ object , filename , loadingBone=false , mount=false, barrel=false }) {

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
				
				if( barrel ) {
					if( child.name === 'Barrel_end' ) {
						object.barrelEnd[ barrel ] = child;
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
					
			if( mount ) object.cockpit_object = result.scene;					
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

		if( mech.action !== 'Walk' ) mech.stepSound = 0;

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
		
		this.mechs[ unit ].routeCheck = 0;
		this.mechs[ unit ].directRoute = false;
	}
		
	update( delta ) {
		this.mechs.map( (mech,mechId) => {
			if( mech.hp <= 0 && mech.explodeStage !== 0 ) {
				mech.explodeTimer += delta;
				if( mech.explodeStage === 1 && mech.explodeTimer > 0.5 && mech.explodeRef.length > 0 ) {
					mech.explodeTimer -= 0.5;
					const lightRef = mech.explodeRef.shift();
					G.lights.removeLight( lightRef );
					if( mech.explodeRef.length === 0 ) mech.explodeStage = 0;
				}
			}
			if( mech.active ) {
				
				if( mech.hp < 0 ) {
					mech.active = false;
					
					self.postMessage({
						type: 'mech-status',
						mechId: mechId,
						status: false,
					});						
					
					if( mech.lightRef ) {
						G.lights.removeLight( mech.lightRef );
						mech.lightRef = null;						
					}
					
					G.particles.spawnSmokeEmitter({
						x: mech.x,
						y: 0,
						z: mech.z,
						duration: 6,
						size: 350,
						ringDensity: 12,
						speed: 100,
						drift: 200,
						emitFrequency: 0.025
					});
					
					for( let i=0 ; i<6 ; i++ ) {
					
						G.particles.spawnRocket({
							x: mech.x,
							y: 600 + Math.random() * 1000,
							z: mech.z,
							dir: new THREE.Vector3(
								Math.random() * Math.PI * 2,
								Math.random() * Math.PI * 2,
								0
							),
							speed: 150 + Math.random() * 200,
							duration: 1.5 + Math.random() * 3,
							arc: 0.002
						});		
					
					}
					
					mech.explodeTimer = 0;
					mech.explodeStage = 1;
					mech.explodeRef = [
						G.lights.registerLight({
							x: mech.x,
							z: mech.z,
							f: 0,
							splat: 2,
							splatSize: 32,
						}),
						G.lights.registerLight({
							x: mech.x,
							z: mech.z,
							f: 0,
							splat: 2,
							splatSize: 32,
						}),
						G.lights.registerLight({
							x: mech.x,
							z: mech.z,
							f: 0,
							splat: 2,
							splatSize: 32,
						}),
					];
					
					
				}
				if( mech.mixer ) {
			
					//Manual Control
					if( G.controls.mech === mechId ) {
						let action = ( mech.route ) ? 'Walk' : 'Idle';
						if( G.controls.W || G.controls.A || G.controls.D ) {
							mech.route = false;
							action = 'Walk';
							this.applyControls({ mech , delta });
						}
						if( mech.action !== action ) {
							mech.action = action;
							this.setAnimation({ mech });
						}
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
					mech.ent.updateMatrixWorld(true);
				}
			}
			else {
				mech.inactiveTimer += delta;
			}
			
			if( mech.mixer ) {
				//Update Lights
				if( mech.muzzleFlashes.length > 0 ) {
					mech.muzzleFlashes.map( (flash,index) => {
						if( flash.duration < 0 ) {
							if( flash.laserEnt ) {
								G.scene.remove( flash.laserEnt );
							}
							G.lights.removeLight( flash.lightId );
							mech.muzzleFlashes.splice( index , 1 );
							G.lights.needsUpdate = true;
							if( flash.isLaser ) {
								self.postMessage({
									type: 'weapon-discharged',
									mechId: mechId,
									gunId: flash.gunId,
								});
							}
						}
						else {
							if( flash.barrelEnd ) {
								let rotation = mech.ent.rotation.y + mech.cockpit_bevel.rotation.y + flash.mount.rotation.y;

								flash.barrelEnd.updateWorldMatrix();
								this.vector.set(
									flash.barrelEnd.position.x,
									flash.barrelEnd.position.y,
									flash.barrelEnd.position.z
								);
								this.vector.applyMatrix4( flash.barrelEnd.matrixWorld );

								if( flash.isLaser ) {
									flash.laserTimer += delta;
									
									const rotation = mech.ent.rotation.y + mech.cockpit_bevel.rotation.y + flash.mount.rotation.y;
									this.dir.set( Math.sin( rotation ) , Math.sin( -flash.mount.rotation.x ) , Math.cos( rotation ) );										

									const hitTarget = this.shootLaser({ laser: flash });
									
									if( flash.laserTimer > 0 ) {
										while( flash.laserTimer > 0 ) {
											flash.laserTimer -= 0.1;
											if( hitTarget ) {
												G.world.destroy( hitTarget.point.x , hitTarget.point.z , 500 , 4 , hitTarget.object , true );
											}
										}
									}
								}

								G.lights.updateLight({
									lightId: flash.lightId,
									x: this.vector.x + Math.cos( rotation ) * flash.offsetX,
									z: this.vector.z - Math.sin( rotation ) * flash.offsetX,
									f: rotation
								});
								G.lights.needsUpdate = true;
							}
						}
						flash.duration -= delta;
					});
				}
				
				if( mech.active ) {
				
					//FPS Camera
					G.camera[mech.id].position.set( mech.ent.position.x , mech.ent.position.y + 1800 , mech.ent.position.z );
					G.camera[mech.id].rotation.set( G.cameraPan[mech.id].x , Math.PI + G.cameraPan[mech.id].y + mech.ent.rotation.y , 0 );
					G.camera[mech.id].translateZ( G.cameraZoom[mech.id] );
					
					//Rotate Body
					if( mech.cockpit_bevel ) {
						let right = G.cameraPan[mech.id].y - mech.cockpit_bevel.rotation.y;
						while( right > Math.PI ) { right -= Math.PI*2 };
						while( right < -Math.PI ) { right += Math.PI*2 };
						let left = mech.cockpit_bevel.rotation.y - G.cameraPan[mech.id].y;
						while( left > Math.PI ) { left -= Math.PI*2 };
						while( left < -Math.PI ) { left += Math.PI*2 };

						const rotSpeed = delta * 1.5;
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

						//Spotlight
						if( mech.lightRef !== false && mech.spotlight ) {
							const lightF = mech.ent.rotation.y + mech.cockpit_bevel.rotation.y;
							G.lights.updateLight({
								lightId: mech.lightRef,
								x: mech.ent.position.x + Math.sin( lightF ) * 5312.5,
								z: mech.ent.position.z + Math.cos( lightF ) * 5312.5,
								f: lightF,
							});
							G.lights.needsUpdate=true;				
						}
						
						//Machineguns
						mech.machineGunShots.map( (shot,index) => {
							if( shot > 0 ) {
								mech.machineGunFiring[index] += delta;
								while( mech.machineGunFiring[index] > 0 ) {
									this.fireWeapon( mechId , index , true );
									if( mech.machineGunShots[index] <= 0 ) {
										self.postMessage({
											type: 'weapon-discharged',
											mechId: mechId,
											gunId: index,
										});
									}
								}
							}
						});
						
						//Sound
						if( mech.action === 'Walk' ) {
							let step = false;
							if( mech.stepSound === 0 ) {
								if( mech.animAction.time > 0.1 ) {
									mech.stepSound = 1;
									step = true;
								}
							}
							else if( mech.stepSound === 1 ) {
								if( mech.animAction.time > 0.6 ) {
									mech.stepSound = 2;
									step = true;
								}
							}
							else if( mech.stepSound === 2 ) {
								if( mech.animAction.time < 0.2 ) {
									mech.stepSound = 0;
								}
							}
							if( step ) {
								self.postMessage({
									type: 'sound',
									sfx: 'step',
									x: mech.x, y: mech.y, z: mech.z
								});
							}
						}
							
					}
					
				}
			}
		});
	}
	applyControls({ mech, delta }) {

		let throttle = 2;
		const rotSpeed = delta * 2.5;
		
		if( G.controls.D ) {
			throttle = 1;
			mech.ent.rotation.y -= rotSpeed;
			G.cameraPan[mech.id].y += rotSpeed;
		}
		if( G.controls.A ) {
			throttle = 1;
			mech.ent.rotation.y += rotSpeed;
			G.cameraPan[mech.id].y -= rotSpeed;
		}
		
		if( ! G.controls.W ) throttle = 0;
		if( throttle > 0 ) {
			const moveSpeed = ( throttle === 2 )
				? delta * 400
				: delta * 80;

			mech.x += Math.sin( mech.ent.rotation.y ) * moveSpeed;
			mech.z += Math.cos( mech.ent.rotation.y ) * moveSpeed;	
			this.boundsCheck({ mech });
		}

		mech.ent.position.set( mech.x , mech.ent.position.y , mech.z );
		G.world.destroy( mech.ent.position.x , mech.ent.position.z , 250 , 'walk' );
		
	}
	followRoute({ mech, delta }) {
		
		mech.routeCheck += delta;
		if( mech.routeCheck > 0 ) {
			mech.routeCheck = -1;
			this.vector.set( mech.x , 500 , mech.z );

			let dx = mech.dx - mech.x;
			let dz = mech.dz - mech.z;
			let dr = Math.sqrt( dx*dx + dz*dz );
			this.raycaster.far = dr;
			
			this.dir.set( dx , 0 , dz );
			this.dir.normalize();
			this.raycaster.set( this.vector , this.dir );
			const intersects = this.raycaster.intersectObject( G.world.map , true );

			if( intersects.length === 0 ) {
				mech.directRoute = true;
			}
			else {
				mech.directRoute = false;
			}
		}
		
		let targetX,targetZ;
		if( ! mech.directRoute ) {
			let x = Math.floor( mech.x / NAV_TO_WORLD_SCALE );
			let z = Math.floor( mech.z / NAV_TO_WORLD_SCALE );

			if( ! mech.route[z] || ! mech.route[z][x] || mech.route[z][x] === 'DESTINATION' ) {
				mech.action = 'Idle';
				this.setAnimation({ mech });
				mech.route = false;
				return;
			}
			targetX = mech.route[z][x].x * NAV_TO_WORLD_SCALE;
			targetZ = mech.route[z][x].z * NAV_TO_WORLD_SCALE;
		}
		else {
			targetX = mech.dx;
			targetZ = mech.dz;
		}

		const dx = targetX - mech.x;
		const dz = targetZ - mech.z;
		const df = Math.atan2( dx , dz );
		
		let throttle = 2;
		
		let right = df - mech.ent.rotation.y;
		if( right < 0 ) right += Math.PI*2;
		let left = mech.ent.rotation.y - df;
		if( left < 0 ) left += Math.PI*2;
		const rotSpeed = delta * 2.5;
		
		throttle = ( Math.abs( df - mech.ent.rotation.y ) < 0.05 ) ? 2 : 1;
		
		if( right < left ) {
			if( right > rotSpeed ) {
				if( right > Math.PI/2 ) throttle = 0;
				mech.ent.rotation.y += rotSpeed;
				G.cameraPan[mech.id].y -= rotSpeed;
			}
			else {
				mech.ent.rotation.y = df;
			}
		}
		else if( left < right ) {
			if( left > rotSpeed ) {
				if( left > Math.PI/2 ) throttle = 0;
				mech.ent.rotation.y -= rotSpeed;
				G.cameraPan[mech.id].y += rotSpeed;
			}
			else {
				mech.ent.rotation.y = df;
			}
		}
		
		if( throttle > 0 ) {

			if( mech.action !== 'Walk' && throttle === 2 ) {
				mech.action = 'Walk';
				this.setAnimation({ mech });
			}
			if( mech.action !== 'Idle' ) {

				const moveSpeed = ( throttle === 2 )
					? delta * 400
					: delta * 80;

				mech.x += Math.sin( mech.ent.rotation.y ) * moveSpeed;
				mech.z += Math.cos( mech.ent.rotation.y ) * moveSpeed;	
				this.boundsCheck({ mech });
				if( Math.abs( mech.dx - mech.x ) + Math.abs( mech.dz - mech.z ) < moveSpeed ) {
					mech.action = 'Idle';
					this.setAnimation({ mech });
					mech.route = false;
					return;					
				}
			}
		}
		else if( mech.action !== 'Idle' && throttle === 0 ) {
			mech.action = 'Idle';
			this.setAnimation({ mech });
		}		

		mech.ent.position.set( mech.x , mech.ent.position.y , mech.z );
		G.world.destroy( mech.ent.position.x , mech.ent.position.z , 250 , 'walk' );
					
	}
	
	boundsCheck({ mech }) {
		mech.x = Math.max( Math.min( 84750 , mech.x ) , 250 );
		mech.z = Math.max( Math.min( 84750 , mech.z ) , 250 );
	}
	
	fireWeapon( mechId , gunId , passive=false ) {

		if( gunId === 'FULL_SALVO' ) {
			const mech = this.mechs[ mechId ];
			mech.guns.map( (weapon,index) => {
				this.fireWeapon( mechId , index );
			});
			return;
		}

		const mech = this.mechs[ mechId ];
		let gun = mech.guns[ gunId ];
		if( gun ) {
	
			const barrel = mech.barrelEnd[ gun.barrelEnd ];
			if( barrel ) {
				let gunLimb, arcAngle = 0;
				mech.mounts.map( mount => {
					if( mount.name === gun.mount ) {
						gunLimb = mount;
						arcAngle = mount.rotation.x;
					}
				});	

				gunLimb.updateWorldMatrix();
				barrel.updateWorldMatrix();
				this.vector.set(
					barrel.position.x,
					barrel.position.y,
					barrel.position.z
				);
				this.vector.applyMatrix4( barrel.matrixWorld );				
				
				const rotation = mech.ent.rotation.y + mech.cockpit_bevel.rotation.y - gunLimb.rotation.y;
				
				if( gun.invertArcY ) arcAngle = -arcAngle;			
	
				if( gun.type === 'laser' ) {
						
					self.postMessage({
						type: 'sound',
						sfx: 'laser',
						x: mech.x,
						y: mech.y,
						z: mech.z,
					});							
							
					mech.muzzleFlashes.push({
						duration: 7.8,
						barrelEnd: barrel,
						mount: gunLimb,
						offsetX: gun.offsetX,
						lightId: G.lights.registerLight({
							x: -1000,
							z: 0,
							f: 0,
							splat: -1,
							splatSize: 0,
						}),
						isLaser: true,
						laserTimer: 0,
						cam: mechId,
						gunId: gunId,
					});					
					
				}
				else if( gun.type === 'flamer' ) {
					
					if( ! passive ) {
						mech.machineGunFiring[ gunId ] = -0.05;
						if( ! mech.machineGunShots[ gunId ] ) mech.machineGunShots[ gunId ] = 0;
						mech.machineGunShots[ gunId ] += 30;

						self.postMessage({
							type: 'sound',
							sfx: 'flamethrower',
							x: mech.x,
							y: mech.y,
							z: mech.z,
						});
					}
					else {
						mech.machineGunFiring[ gunId ] -= 0.05;
						mech.machineGunShots[ gunId ]--;
					}
							
					this.dir.set( Math.sin( rotation ) , Math.sin( arcAngle ) , Math.cos( rotation ) );
					const hitTarget = this.shootFire({ arc: -0.08 });
					
				}
				else if( gun.type === 'machinegun' ) {


					if( ! passive ) {
						mech.machineGunFiring[ gunId ] = -0.1;
						if( ! mech.machineGunShots[ gunId ] ) mech.machineGunShots[ gunId ] = 0;
						mech.machineGunShots[ gunId ] += 30;
					}
					else {
						mech.machineGunFiring[ gunId ] -= 0.1;
						mech.machineGunShots[ gunId ]--;
					}

					this.dir.set( Math.sin( rotation ) , Math.sin( arcAngle ) , Math.cos( rotation ) );


					this.dir.x += Math.random() * 0.15 - 0.075;
					this.dir.y += Math.random() * 0.15 - 0.075;
					this.dir.z += Math.random() * 0.15 - 0.075;
					const hitTarget = this.shoot({ arc: -0.02, maxRange: 12000 });

					mech.muzzleFlashes.push({
						duration: 0.1,
						barrelEnd: barrel,
						mount: gunLimb,
						offsetX: gun.offsetX,
						lightId: G.lights.registerLight({
							x: -1000,
							z: 0,
							f: 0,
							splat: 1,
							splatSize: 16,
						})
					});
						
					self.postMessage({
						type: 'sound',
						sfx: ( gun.damage > 10 ) ? 'minigun' : 'machinegun',
						x: mech.x,
						y: mech.y,
						z: mech.z,
					});
					
					if( hitTarget ) {

						G.particles.spawnSand({
							x: hitTarget.point.x,
							y: hitTarget.point.y,
							z: hitTarget.point.z,
							size: 30 * gun.damage,
							maxLife: 3,
						});
							
						G.world.destroy( hitTarget.point.x , hitTarget.point.z , 500 , gun.damage , hitTarget.object );
							
					}
						
				}
				else if( gun.type === 'rockets' ) {

					self.postMessage({
						type: 'weapon-discharged',
						mechId: mechId,
						gunId: gunId,
					});

					this.dir.set( Math.sin( rotation ) , Math.sin( arcAngle ) , Math.cos( rotation ) );
					
					G.particles.spawnRocket({
						x: this.vector.x,
						y: this.vector.y,
						z: this.vector.z,
						dir: this.dir,
						speed: 8000,
						duration: 4,
						arc: -0.15,
					});
					
					self.postMessage({
						type: 'sound',
						sfx: 'rocket',
						x: mech.x,
						y: mech.y,
						z: mech.z,
					});
					
				}
				else if( gun.type === 'canon' ) {
									
					self.postMessage({
						type: 'weapon-discharged',
						mechId: mechId,
						gunId: gunId,
					});
					self.postMessage({
						type: 'sound',
						sfx: 'canon',
						x: mech.x,
						y: mech.y,
						z: mech.z,
					});
									
					mech.muzzleFlashes.push({
						duration: 0.1,
						barrelEnd: barrel,
						mount: gunLimb,
						offsetX: gun.offsetX,
						lightId: G.lights.registerLight({
							x: -1000,
							z: 0,
							f: 0,
							splat: 1,
							splatSize: 16,
						})
					});
				
					this.dir.set( Math.sin( rotation ) , Math.sin( arcAngle ) , Math.cos( rotation ) );
					
					const hitTarget = this.shoot({ arc: -0.015 });
					if( hitTarget ) {

						G.particles.spawnSmokeEmitter({
							x: hitTarget.point.x,
							y: hitTarget.point.y,
							z: hitTarget.point.z,
							drift: 400,
							speed: 550,
							ringDensity: 12,
							duration: 0.3,
							size: 250,
							emitFrequency: 0.0025
						});
						
						mech.muzzleFlashes.push({
							duration: 0.2,
							lightId: G.lights.registerLight({
								x: hitTarget.point.x,
								z: hitTarget.point.z,
								f: 0,
								splat: 2,
								splatSize: 32,
							})
						});		

						G.world.destroy( hitTarget.point.x , hitTarget.point.z , 1500 , gun.damage , hitTarget.object );
						
					}
					
				}
				
			}
		}
		
	}
	

	shoot({ arc, maxRange=40000 }) {

/*
let mat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
let geo = new THREE.CubeGeometry( 100,100,100 );
//*/

		this.raycaster.far = 500;
		
		while( maxRange > 0 ) {

			this.raycaster.set( this.vector , this.dir );
			let intersects = this.raycaster.intersectObject( G.world.map , true );
			const hits = this.raycaster.intersectObjects( G.ants.colliders );
			
			if( hits.length > 0 ) {
				if( ! intersects.length > 0 ) {
					intersects = hits;
				}
				else {
					if( hits[0].distance < intersects[0].distance ) {
						intersects = hits;
					}
				}
			}
			
			if( intersects.length > 0 ) return intersects[0]
			if( this.vector.y < 0 ) return {
				point: {
					x: this.vector.x,
					y: 0,
					z: this.vector.z
				}
			}

/*
let obj = new THREE.Mesh( geo , mat );
obj.position.set( this.vector.x , this.vector.y , this.vector.z );
G.scene.add( obj );
//*/
			
			this.dir.y += arc;
			this.dir.normalize();
			this.vector.set(
				this.vector.x + this.dir.x * 500,
				this.vector.y + this.dir.y * 500,
				this.vector.z + this.dir.z * 500
			);
			maxRange -= 500;
			
		}		
		
	}
	
	shootFire({ arc }) {
		
		let maxRange = 6000;
		let size = 1500;
		let dam = 13;
		
		while( maxRange > 0 ) {

			G.world.destroy(
				this.vector.x,
				this.vector.z,
				500,
				(dam/3),
				false,
				true
			);

			G.particles.spawnFire({
				x: this.vector.x,
				y: this.vector.y,
				z: this.vector.z,
				size: size,
			});

			size *= 1.1;
			
			this.dir.y += arc;
			this.dir.normalize();
			this.vector.set(
				this.vector.x + this.dir.x * 500,
				this.vector.y + this.dir.y * 500,
				this.vector.z + this.dir.z * 500
			);
			if( this.vector.y < 0 ) {
				this.vector.y = 0;
				this.arc = 0;
			}
			
			maxRange -= 500;
			dam--;
			
		}		
		
	}
	
	shootLaser({ laser }) {

		this.raycaster.far = 20000;
		
		let points = [
			new THREE.Vector3( 0,0,0 )
		];

		this.raycaster.set( this.vector , this.dir );
		let intersects = this.raycaster.intersectObject( G.world.map , true );
		const hits = this.raycaster.intersectObjects( G.ants.colliders );
		
		if( hits.length > 0 ) {
			if( ! intersects.length > 0 ) {
				intersects = hits;
			}
			else {
				if( hits[0].distance < intersects[0].distance ) {
					intersects = hits;
				}
			}
		}
		
		if( intersects[0] ) {
			points.push(
				new THREE.Vector3(
					intersects[0].point.x - this.vector.x,
					intersects[0].point.y - this.vector.y,
					intersects[0].point.z - this.vector.z,
				)
			);
			this.drawLaser({ laser, points });
			return intersects[0];
		}
		else {
			points.push(
				new THREE.Vector3(
					this.dir.x * 20000,
					this.dir.y * 20000,
					this.dir.z * 20000,
				)
			);
			this.drawLaser({ laser, points });
			return false;
		}
		
	}
	drawLaser({ laser, points }) {
		if( laser.laserEnt ) G.scene.remove( laser.laserEnt );
		
		const geo = new THREE.BufferGeometry().setFromPoints( points );
		laser.laserEnt = new THREE.Line( geo , laserMat );
		laser.laserEnt.position.set( this.vector.x , this.vector.y , this.vector.z );
		G.scene.add( laser.laserEnt );
		
	}
}