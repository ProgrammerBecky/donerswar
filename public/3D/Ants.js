import * as THREE from './../build/three.module.js';
import { SkeletonUtils } from './../jsm/utils/SkeletonUtils.js';
import { G } from './G.js';

const WORLD_SIZE = 85000;
const NAV_MAP_SIZE = 1024;
const NAV_TO_WORLD_SCALE = WORLD_SIZE / NAV_MAP_SIZE;

export class Ants {

	constructor() {
	
		this.route = false;
		this.collectiveDecisionTimer = 5;
	
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
			id: this.ants.length,
			x: Math.random() * 85000,
			y: 375,
			z: Math.random() * 85000,
			f: Math.random() * Math.PI * 2,
			action: 'Idle',
			decisionTimer: 5,
		});
	}
	
	getAntMesh({ ant }) {
		if( ! this.masterMesh ) return;
	
		ant.ent = SkeletonUtils.clone( this.masterMesh );
		ant.ent.scale.set( 5000,5000,5000 );
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
	
	newRoute({ unit, dx, dz, route }) {
		this.route = route;
		this.dx = dx;
		this.dz = dz;
		
		console.log( 'got collective route' , this.route );
	}
	
	despawnAnt({ ant }) {
		let index = this.ants.findIndex( search => search.id === ant.id );
		G.scene.remove( ant );
		this.ants.splice( index , 1 );
	}
	
	doWalk({ ant , delta }) {
		
		let x = Math.floor( ant.x / NAV_TO_WORLD_SCALE );
		let z = Math.floor( ant.z / NAV_TO_WORLD_SCALE );
		if( x < 0 || z < 0 || x > NAV_MAP_SIZE || z > NAV_MAP_SIZE ) {
			return this.despawnAnt({ ant });
		}

		if( ! this.route[z] || ! this.route[z][x] || this.route[z][x] === 'DESTINATION' ) {
			ant.action = 'Idle';
			this.setAnimation({ ant });
			return;
		}

		let targetX = this.route[z][x].x * NAV_TO_WORLD_SCALE;
		let targetZ = this.route[z][x].z * NAV_TO_WORLD_SCALE;

		const dx = targetX - ant.x;
		const dz = targetZ - ant.z;
		const df = Math.atan2( dx , dz );
		
		let throttle = 2;
		
		let right = df - ant.f;
		if( right < 0 ) right += Math.PI*2;
		let left = ant.f - df;
		if( left < 0 ) left += Math.PI*2;
		const rotSpeed = delta * 1.5;
		
		throttle = ( Math.abs( df - ant.f ) < 0.05 ) ? 2 : 1;
		if( right < left ) {
			if( right > rotSpeed ) {
				if( right > Math.PI/2 ) throttle = 0;
				ant.f += rotSpeed;
			}
			else {
				ant.f = df;
			}
		}
		else if( left < right ) {
			if( left > rotSpeed ) {
				if( left > Math.PI/2 ) throttle = 0;
				ant.f -= rotSpeed;
			}
			else {
				ant.f = df;
			}
		}
		
		console.log( throttle );
		
		if( throttle > 0 ) {

			const moveSpeed = ( throttle === 2 )
				? delta * 600
				: delta * 80;

			ant.x += Math.sin( ant.f ) * moveSpeed;
			ant.z += Math.cos( ant.f ) * moveSpeed;	
			if( Math.abs( this.dx - ant.x ) + Math.abs( this.dz - ant.z ) < moveSpeed ) {
				ant.action = 'Idle';
				this.setAnimation({ ant });
				return;					
			}
			
		}

	}
	
	makeCollectiveDecision() {
		
		if( G.mechs ) {

			console.log( 'making collective decision' );

			const targetMech = Math.floor( G.mechs.mechs.length * Math.random() );
			self.postMessage({
				type: 'ant-navigate',
				sx: 0,
				sz: 0,
				dx: G.mechs.mechs[ targetMech ].x,
				dz: G.mechs.mechs[ targetMech ].z,
				collection: 'Ant',
				unit: 0,
			});
			
		}
		
	}
	
	makeDecision({ ant }) {
		
		if( this.route ) {

			if( ant.action === 'Idle' ) {
				ant.decisionTimer = 2 + Math.random() * 5;
				ant.action = 'Idle_Aggitated';
				this.setAnimation({ ant });
			}
			else if( ant.action === 'Idle_Aggitated' ) {
				ant.decisionTimer = 10 + Math.random() * 20;
				ant.action = 'Walk';
				this.setAnimation({ ant });
			}
			else if( ant.action === 'Walk' ) {
				ant.decisionTimer = 5 + Math.random() * 15;
				ant.action = 'Idle';
				this.setAnimation({ ant });
			}
			
			console.log( ant.id + ' is now ' + ant.action );

		}
		return;
		
	}
	
	update( delta ) {
	
		this.collectiveDecisionTimer -= delta;
		if( this.collectiveDecisionTimer < 0 ) {
			this.collectiveDecisionTimer = 60 + Math.random() * 60;
			this.makeCollectiveDecision();
		}
	
		this.ants.map( ant => {
		
			ant.decisionTimer -= delta;
			if( ant.decisionTimer < 0 ) {
				this.makeDecision({ ant });
			}
		
			if( ! ant.ent ) {
				this.getAntMesh({ ant });
			}
			else {
				
				if( ant.action === 'Walk' ) this.doWalk({ ant , delta });
				
				ant.ent.position.set( ant.x , ant.y , ant.z );
				ant.ent.rotation.set( 0 , ant.f , 0 );
				ant.mixer.update( delta );
			}
			
		});
	
	}


}