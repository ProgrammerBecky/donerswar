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
			result.scene.traverse( child => {
				if( child.isMesh ) {
					child.material = G.lights.applyLightMap( child.material );
				}
			});
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
				if( zombie.alive ) {
					zombie.x += zombie.mx * delta;
					zombie.z += zombie.mz * delta;
					zombie.ent.position.set( zombie.x , 0 , zombie.z );
				}
				
				zombie.ent.rotation.set( 0 , zombie.f , 0 );
				zombie.mixer.update( delta );
			}
		});
	}
	
	updateForCam( camIndex ) {
		
		this.zombies.map( zombie => {
			if( zombie.ent ) {
				this.vector.set( zombie.x , zombie.y , zombie.z );
				zombie.ent.visible =
					( G.frustum[camIndex].containsPoint( this.vector ) )
						? true
						: false;
			}
		});
							
	}
	updateZombie({ updated }) {
		let index = this.zombies.findIndex( search => search.id === updated.id );
		if( index > -1 ) {
			let zombie = this.zombies[ index ];
			if( zombie.action !== 'Death' ) {

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
	}
	
	setAnimation({ zombie }) {
		
		if( zombie.mixer ) {
			if( zombie.animAction ) {
				zombie.animAction.stop();
			}
		}
		else {
			zombie.mixer = new THREE.AnimationMixer( zombie.ent );
		}
		
		const clip = THREE.AnimationClip.findByName( this.animations , zombie.animation );
		if( clip ) {
			zombie.animAction = zombie.mixer.clipAction( clip );
			
			zombie.animAction.setLoop(
				( zombie.action === 'Death' )
					? THREE.LoopOnce
					: THREE.LoopRepeat
			);
			if( zombie.action === 'Death' ) zombie.animAction.clampWhenFinished = true;

			zombie.animAction.play();
		}
		else {
			console.log( 'cannot find ' , zombie.animation , ' in animation stack' , this.animations );
		}
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
		zombie.alive = true;
		this.zombies.push( zombie );
	}
	destroy( x,z,area,damage ) {
		this.zombies.map( zombie => {
			if( zombie.x > x-area && zombie.x < x+area &&
			zombie.z > z-area && zombie.z < z+area ) {
				
				zombie.action = 'Death';
				let animId = Math.floor( Math.random() * 10 ) + 1;
				zombie.animation = `Death${animId}`;
				zombie.alive = false;
				this.setAnimation({ zombie });
				
			}
		});
	}

}