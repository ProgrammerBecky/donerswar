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
		this.spawnTimer = 0;		
		
	}
	loadMasterMesh( id ) {
	
		let self = this;
		G.gltf.load( '/zombies/tramp' + id + '.glb' , result => {
			self.masterMeshes.push( result.scene );
			if( self.animations.length === 0 && result.animations ) self.animations = result.animations;
		});
	
	}
	update( delta ) {
		this.zombies.map( zombie => {
			
			if( ! zombie.ent ) {
				zombie.ent = this.loadZombieEnt( zombie.type );
				G.scene.add( zombie.ent );
				this.setAnimation({ zombie });
			}
			
			if( zombie.ent ) {
				zombie.x += zombie.mx;
				zombie.z += zombie.mz;
				zombie.ent.position.set( zombie.x , 0 , zombie.z );
				zombie.ent.rotation.set( 0 , zombie.f , 0 );
				
				zombie.mixer.update( delta );
			}
		});
	}
	
	setAnimation({ zombie }) {
		
		if( zombie.mixer ) {
			zombie.action.stop();
		}
		else {
			zombie.mixer = new THREE.AnimationMixer( zombie.ent );
		}
		
		const clip = THREE.AnimationClip.findByName( this.animations , zombie.animation );
		zombie.action = zombie.mixer.clipAction( clip );
		if( ! zombie.action ) {
			console.log( zombie , clip , this.animations );
		}
		
		zombie.action.setLoop(
			( zombie.action === 'Death' )
				? THREE.LoopOnce
				: THREE.LoopRepeat
		);

		zombie.action.play();
	}
	
	loadZombieEnt( id ) {
		if( this.masterMeshes[ id ] && this.animations ) {
			const ent = SkeletonUtils.clone( this.masterMeshes[id] );
			ent.scale.set( 100,100,100 );
			return ent;
		}
		return false;
	}
	spawn({ zombie }) {
		zombie.type = Math.floor( Math.random() * ZOMBIE_MESHES );
		this.zombies.push( zombie );
	}

}