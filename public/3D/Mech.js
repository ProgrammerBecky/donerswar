import * as THREE from './../build/three.module.js';
import { G } from './G.js';

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
				"cockpit": "high/mechs/Cockpit4.glb",
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
				"shoulderL": "high/mechs/HalfShoulder_Shield_Upgrade.glb",
				"shoulderR": "high/mechs/RHalfShoulder_Shield_Upgrade.glb",
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
		});
		
		this.mechs.map( object => {
			object.leftWeaponMount = 'Mount_Weapon_L';
			object.rightWeaponMount = 'Mount_Weapon_R';
			object.cockpitMount = 'Mount_top';			
			object.mounts = [];
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
					});
					delete object.assembly[i];
					return;
				case 'cockpit':
					this.loadMechPart({
						object,
						filename: object.assembly[i],
						loadingBone: object.cockpitMount,
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
					console.log( '!!!' , object );
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
		console.log( object );
		
		object.ent.position.set( 42500 + (Math.random() * 2500)*2-1 , 0 , 42500 + (Math.random() * 2500)*2-1 );
		object.ent.scale.set(3,3,3);
		object.ent.rotation.set( 0 , Math.random() * Math.PI*2 , 0 );
		G.scene.add( object.ent );
		
		return object;
	}
		
	loadMechPart({ object , filename , loadingBone=false }) {

		let self = this;
		G.gltf.load( filename , result => {
			
			result.scene.traverse( child => {
				if( child.isMesh ) {
					child.material = self.material;
				}
			});

			if( loadingBone  ) {
				object.ent.traverse( mechParent => {
					if( mechParent.name === loadingBone ) {
						object.mounts.push( mechParent );
						result.scene.rotation.order = 'XYZ';
						mechParent.add( result.scene );
					}
				});
			}
			else {
				object.ent = result.scene;
			}
					
			self.loadAssembly({ object });
			
		});
	
	}
	
	aim({ object , tpan }) {
		
		object.mounts.map( mount => {
		
			switch( mount.name ) {
				case 'Mount_Weapon_L':
				case 'Mount_Weapon_HL':
					if( tpan.y > 0 ) tpan.y = 0;
					if( tpan.x < -0.38 ) tpan.x = -0.38;
					if( tpan.x > 0.38 ) tpan.x = 0.38;
					this.aimMount({ mount , tpan , right: false });
					break;
				case 'Mount_Weapon_top':
					if( tpan.x < -0.034 ) tpan.x = -0.034;
					if( tpan.x > 0.959 ) tpan.x = 0.959;
					if( tpan.y < -0.034 ) tpan.y = -0.034;
					if( tpan.y > 0.034 ) tpan.y = 0.034;
					this.aimMount({ mount , tpan , right: false });
					break;
				case 'Mount_Shoulder_rockets_lvl1_L':
				case 'Mount_Shoulder_rockets_lvl1_R':
					if( tpan.x < -0.087 ) tpan.x = -0.087;
					if( tpan.x > 0.087 ) tpan.x = 0.087;
					if( tpan.y < -0.087 ) tpan.y = -0.087;
					if( tpan.y > 0.087 ) tpan.y = 0.087;
					this.aimMount({ mount , tpan , right: false });
					break;
				case 'Mount_Weapon_R':
				case 'Mount_Weapon_HR':
					if( tpan.y < 0 ) tpan.y = 0;
					if( tpan.x < -0.38 ) tpan.x = -0.38;
					if( tpan.x > 0.38 ) tpan.x = 0.38;
					this.aimMount({ mount , tpan , right: true });
					break;
			}
		});

	}
	aimMount({ mount , tpan , right }) {
		console.log( mount, tpan , right );
		//mount.rotation.set( 0 , 0 , 0 );
		//mount.rotateY( -tpan.y * Math.PI/180 );
		if( right ) {
			mount.rotation.set( tpan.x , tpan.y , 0 );
			//mount.rotateX( -(180+tpan.x) * Math.PI/180 );						
		}
		else {
			mount.rotation.set( -tpan.x , tpan.y , 0 );
			//mount.rotateX( -tpan.x * Math.PI/180 );											
		}

	}	
	
		
}