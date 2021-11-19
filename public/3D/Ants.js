import * as THREE from './../build/three.module.js';
import { SkeletonUtils } from './../jsm/utils/SkeletonUtils.js';
import { G } from './G.js';

export class Ants {

	constructor() {
	
		this.ants = [];
		for( let i=0 ; i<10 ; i++ ) {
			this.spawnAnt();
		}
	
		const metRough = G.texture.load( '/high/ant/antMetRough.png' );
		this.antMat = new THREE.MeshStandardMaterial({
			metalnessMap: metRough,
			roughnessMap: metRough,
			entMap: G.environmentMap,
			skinning: true,
		});
	
		let self = this;
		G.gltf.load( '/high/ant/Ant.glb' , result => {
		
			result.scene.traverse( child => {
				if( child.isMesh ) {
					if( ! self.antMat.map ) {
						self.antMat.map = child.material.map;
						self.antMat.normalMap = child.material.normalMap;
					}
					child.material = self.antMat;
				}
			});
			self.masterMesh = result.scene;
			self.animations = result.animations;
		
		});
	
	}
	
	spawnAnt() {
		this.ants.push({
			x: Math.random() * 85000,
			y: 375,
			z: Math.random() * 85000,
			f: Math.random() * Math.PI * 2,
			action: 'Idle',
		});
	}
	
	getAntMesh({ ant }) {
		if( ! this.masterMesh ) return;
	
		ant.ent = SkeletonUtils.clone( this.masterMesh );
		ant.ent.scale.set( 5000,5000,5000 );
		ant.decisionTimer = Math.random() * 10;
		G.scene.add( ant.ent );
		this.setAnimation({ ant });
	
	}
	
	
	setAnimation({ ant }) {
	
		if( ant.mixer ) {
			ant.animAction.stop();
		}
		else {
			ant.mixer = new THREE.AnimationMixer( ant.ent );
		}
		
		const clip = THREE.AnimationClip.findByName( this.animations , ant.action );
	
		ant.animAction = ant.mixer.clipAction( clip );
		
		ant.animAction.setLoop(
			( ant.action === 'Death' )
				? THREE.LoopOnce
				: THREE.LoopRepeat
		);

		ant.animAction.play();

	}	
	
	makeDecision() {
		
	}
	
	update( delta ) {
	
		this.ants.map( ant => {
		
			ant.decisionTimer -= delta;
			if( ant.decisionTimer < 0 ) {
				this.makeDecision();
			}
		
			if( ! ant.ent ) {
				this.getAntMesh({ ant });
			}
			else {
				ant.ent.position.set( ant.x , ant.y , ant.z );
				ant.ent.rotation.set( 0 , ant.f , 0 );
				ant.mixer.update( delta );
			}
			
		});
	
	}


}