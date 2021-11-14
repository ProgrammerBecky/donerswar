import * as THREE from './../build/three.module.js';
import { SkeletonUtils } from './../jsm/utils/SkeletonUtils.js';
import { G } from './G.js';

const ZOMBIE_MESHES = 10;

export class Zombies {

	constructor() {
	
		this.zombies = [];
		this.animations = [];
		this.masterMeshes = [];
		
		for( let i=1 ; i<=ZOMBIE_MESHES ; i++ ) {
			this.loadMasterMesh(i);
		}		
		
		this.vector = new THREE.Vector3();
		
	}
	loadMasterMesh( id ) {
	
		let loaded = 0;
	
		let self = this;
		G.gltf.load( '/zombies/tramp' + id + '.glb' , result => {
			self.masterMeshes.push( result.scene );
			if( self.animations.length === 0 && result.animations ) self.animations = result.animations;
		});
	
	}
	update( delta ) {
		this.zombies.map( zombie => {
			
			if( ! zombie.ent ) {
				this.loadZombieEnt({ zombie });
			}
			
			if( zombie.ent ) {
				zombie.x += zombie.mx * delta;
				zombie.z += zombie.mz * delta;
				zombie.ent.position.set( zombie.x , 0 , zombie.z );
				
				this.vector.set( zombie.x , zombie.y , zombie.z );
				zombie.ent.visible = G.frustum.containsPoint( this.vector );
				if( zombie.ent.visible ) {
					zombie.ent.rotation.set( 0 , zombie.f , 0 );
					zombie.mixer.update( delta );
				}
			}
		});
	}
	
	updateZombie({ updated }) {
		let index = this.zombies.findIndex( search => search.id === updated.id );
		if( index > -1 ) {
			let zombie = this.zombies[ index ];

			zombie.x = updated.x;
			zombie.z = updated.z;
			zombie.f = updated.f;
			zombie.mx = updated.mx;
			zombie.mz = updated.mz;
			zombie.action = updated.action;
			zombie.animation = updated.animation;
			
			if( zombie.ent ) this.setAnimation({ zombie });
			this.zombies[ index ] = zombie;
		}
	}
	
	setAnimation({ zombie }) {
		
		if( zombie.mixer ) {
			zombie.animAction.stop();
		}
		else {
			zombie.mixer = new THREE.AnimationMixer( zombie.ent );
		}
		
		const clip = THREE.AnimationClip.findByName( this.animations , zombie.animation );
		zombie.animAction = zombie.mixer.clipAction( clip );
		
		zombie.animAction.setLoop(
			( zombie.action === 'Death' )
				? THREE.LoopOnce
				: THREE.LoopRepeat
		);

		zombie.animAction.play();
	}
	
	loadZombieEnt({ zombie }) {
		if( this.masterMeshes.length === ZOMBIE_MESHES && this.animations.length > 0 ) {
			zombie.ent = SkeletonUtils.clone( this.masterMeshes[ zombie.type ] );
			if( zombie.ent ) {
				zombie.ent.scale.set( 150,150,150 );
				G.scene.add( zombie.ent );
				this.setAnimation({ zombie });
			}
		}
		return false;
	}
	spawn({ zombie }) {
		zombie.type = Math.floor( Math.random() * ZOMBIE_MESHES );
		this.zombies.push( zombie );
	}

}