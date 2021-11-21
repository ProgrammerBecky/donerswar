import * as THREE from './../build/three.module.js';
import { SkeletonUtils } from './../jsm/utils/SkeletonUtils.js';
import { G } from './G.js';

const WORLD_SIZE = 85000;
const NAV_MAP_SIZE = 512;
const NAV_TO_WORLD_SCALE = WORLD_SIZE / NAV_MAP_SIZE;

let ANT_COUNT = 30;

export class Ants {

	constructor() {
	
		this.colliders = [];
	
		this.route = false;
		this.collectiveDecisionTimer = 5;
	
		this.ants = [];
		for( let i=0 ; i<10 ; i++ ) {
			this.spawnAnt();
		}
	
		//const metRough = G.texture.load( '/high/ant/antMetRough.png' );
		this.antMat = G.lights.applyLightMap(
			new THREE.MeshStandardMaterial({
				metalness: 0.3,
				roughness: 0.7,
				envMap: G.environmentMap,
				skinning: true,
			})
		);
	
		let self = this;
		G.gltf.load( '/high/ant/Ant.glb' , result => {

			let body = null;
		
			result.scene.scale.set( 5000,5000,5000 );
		
			result.scene.traverse( child => {
				if( child.isMesh ) {
					
					body = child;
					
					child.updateWorldMatrix( true , true );					
					child.geometry.computeBoundingBox();
					child.geometry.needsUpdate = true;
					
					if( ! self.antMat.map ) {
						self.antMat.map = child.material.map;
						self.antMat.normalMap = child.material.normalMap;
					}
					child.material = self.antMat;
				}
			});
			
			const par = new THREE.Group();
			par.add( result.scene );

			const mat = new THREE.MeshBasicMaterial({
				color: 0xff0000,
				visible: false,
			});
			const geo = new THREE.CubeGeometry( 250,100,850 );
			const collider = new THREE.Mesh( geo , mat );
			collider.name = 'Collider';
			collider.position.set( 0,100,-150 );
			par.add( collider );

			self.masterMesh = par;
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
			hp: 50,
			heat: 0,
			hasOwnMat: false,
		});
	}
	
	getAntMesh({ ant }) {
		if( ! this.masterMesh ) return;
	
		ant.ent = SkeletonUtils.clone( this.masterMesh );
		G.scene.add( ant.ent );

		ant.ent.traverse( child => {
			if( child.name === 'Collider' ) {
				this.colliders.push( child );
			}
		});
		
		
		this.setAnimation({ ant });
	
	}
	
	
	setAnimation({ ant }) {
	
		if( ant.hp <= 0 && ant.action !== 'Death' ) return ;
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
		if( ant.action === 'Death' ) ant.animAction.clampWhenFinished = true;

		ant.animAction.play();

	}	
	
	newRoute({ unit, dx, dz, route }) {
		this.route = route;
		this.dx = dx;
		this.dz = dz;
		
		console.log( 'got collective route' , this.route );
	}
	
	despawnAnt({ ant }) {
		
		G.scene.remove( ant.ent );
		ant.ent.traverse( child => {
			if( child.name === 'Collider' ) {
				const colIndex = this.colliders.findIndex( search => search === child );
				if( colIndex > -1 ) {
					this.colliders.splice( colIndex , 1 );
				}
			}
		});
		
		let index = this.ants.findIndex( search => search.id === ant.id );
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
		
		if( throttle > 0 ) {

			const moveSpeed = ( throttle === 2 )
				? delta * 900
				: delta * 300;

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

		}
		return;
		
	}
	
	update( delta ) {
	
		this.collectiveDecisionTimer -= delta;
		if( this.collectiveDecisionTimer < 0 ) {
			this.collectiveDecisionTimer = 60 + Math.random() * 60;
			this.makeCollectiveDecision();
		}
		if( this.ants.length < ANT_COUNT ) this.spawnAnt();
	
		this.ants.map( ant => {
		
			if( ! ant.ent ) {
				this.getAntMesh({ ant });
			}
			else {

				if( ant.hp <=0 && ant.action !== 'Death' ) {
					ant.action = 'Death';
					this.setAnimation({ ant });
					ANT_COUNT++;
				}

				if( ant.action !== 'Death' ) {
					ant.decisionTimer -= delta;
					if( ant.decisionTimer < 0 ) {
						this.makeDecision({ ant });
					}
					
					if( ant.action === 'Walk' ) this.doWalk({ ant , delta });
				}
				if( ant.heat > 0 ) {
					if( ! ant.hasOwnMat ) {
						ant.ent.traverse( child => {
							if( child.isMesh ) {
								child.material = child.material.clone();
							}
						});
						ant.hasOwnMat = true;
					}
					ant.heat = Math.max( 0 , ant.heat - delta*10 );
					let heat = Math.min( ant.heat , 255 );
					ant.ent.traverse( child => {
						if( child.isMesh ) {
							child.material.color = new THREE.Color( 1+heat , 1+heat/2 , 1 );
						}
					});
				}
				
				ant.ent.position.set( ant.x , ant.y , ant.z );
				ant.ent.rotation.set( 0 , ant.f , 0 );
				ant.mixer.update( delta );
			}
			
		});
	
	}
	
	destroy( x,z,area,damage,generateHeat ) {
		this.ants.map( ant => {
			if( ant.hp > 0 ) {
				if( ant.x > x-area && ant.x < x+area &&
				ant.z > z-area && ant.z < z+area ) {
					
					ant.hp -= damage;
					if( generateHeat ) {
						ant.heat += damage*2;
					}
					
				}
			}
		});
	}	


}