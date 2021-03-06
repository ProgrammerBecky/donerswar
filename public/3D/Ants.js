import * as THREE from './../build/three.module.js';
import { SkeletonUtils } from './../examples/jsm/utils/SkeletonUtils.js';
import { G } from './G.js';

const WORLD_SIZE = 85000;
const NAV_MAP_SIZE = 512;
const NAV_TO_WORLD_SCALE = WORLD_SIZE / NAV_MAP_SIZE;

export class Ants {

	constructor() {
		
		this.maximumAnts = 3;
		this.headJumpChance = 0;
	
		this.colliders = [];
	
		this.route = false;
		this.collectiveDecisionTimer = 5;
	
		this.removeIds = [];
		this.antCount = 0;	

		this.antAttackCheckResetTimer = 0;
		this.antAttackCheckIndex = 0;
	
		this.ants = [];
		for( let i=0 ; i<10 ; i++ ) {
			this.spawnAnt();
		}
		
		this.source = new THREE.Vector3();
		this.dir = new THREE.Vector3();
		this.raycaster = new THREE.Raycaster();
	
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
		G.gltf.load( G.path+'ant/Ant.glb' , result => {

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
			const geo = new THREE.CubeGeometry( 250,125,850 );
			const collider = new THREE.Mesh( geo , mat );
			collider.name = 'Collider';
			collider.position.set( 0,75,-150 );
			par.add( collider );

			self.masterMesh = par;
			self.animations = result.animations;
		
		});
	
	}
	
	spawnAnt({ x , z } = false) {
		
		if( !x ) {
			let farAway = false;
			while( ! farAway ) {
				x = Math.random() * 85000;
				z = Math.random() * 85000;
				farAway = true;
				G.mechs.mechs.map( mech => {
					const dx = mech.x - x;
					const dz = mech.z - z;
					const dr = Math.sqrt( dx*dx + dz*dz );
					if( dr < 20000 ) farAway = false;
				});
			}
		}
		
		this.antCount++;
		this.ants.push({
			id: this.antCount,
			x: x,
			y: 0,
			z: z,
			f: Math.random() * Math.PI * 2,
			action: 'Idle',
			decisionTimer: 5,
			hp: 50,
			heat: 0,
			hasOwnMat: false,
			attackTarget: false,
			headJump: false,
			gravity: 0,
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
		
		if( ant.anim === 'Walk' ) {
			if( ['Hit1','Hit2','Hit3'].includes( ant.animAction._clip.name ) ) {
				if( ant.animAction.isPlaying ) return;
			}
		}
		
		if( ant.mixer ) {
			ant.animAction.stop();
		}
		else {
			ant.mixer = new THREE.AnimationMixer( ant.ent );
		}
		
		const clip = THREE.AnimationClip.findByName( this.animations , ant.action );
	
		ant.animAction = ant.mixer.clipAction( clip );
		
		if( ['Hit1','Hit2','Hit3','Death','Bite','Jump','Sting'].includes( ant.action ) ) {
			ant.animAction.setLoop( THREE.LoopOnce );
			ant.animAction.clampWhenFinished = true;
		}
		else {
			ant.animAction.setLoop( THREE.LoopRepeat );
			ant.animAction.clampWhenFinished = false;
		}

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
		
		this.removeIds.push( ant.id );
	}
	discardAnt({ ant }) {
		ant.ent.traverse( child => {
			if( child.name === 'Collider' ) {
				const colIndex = this.colliders.findIndex( search => search === child );
				if( colIndex > -1 ) {
					this.colliders.splice( colIndex , 1 );
				}
			}
		});
		
		this.removeIds.push( ant.id );
		
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
		
		this.doMove({ ant , delta , targetX , targetZ , df });
		
	}
	doMove({ ant , delta , targetX , targetZ , df , attack=false }) {
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
		
		if( throttle > 0 && delta > 0 ) {

			const moveSpeed = ( throttle === 2 )
				? delta * 900
				: delta * 300;

			ant.x += Math.sin( ant.f ) * moveSpeed;
			ant.z += Math.cos( ant.f ) * moveSpeed;	
			if( Math.abs( this.dx - ant.x ) + Math.abs( this.dz - ant.z ) < moveSpeed ) {
				ant.action = 'Idle';
				this.setAnimation({ ant });
				return false;					
			}
			
		}
		
		if( ant.f === df ) return true;
		return false;

	}
	
	makeCollectiveDecision() {
		
		if( G.mechs ) {


			let dx = false, dz = false;

			const active = G.mechs.mechs.find( search => search.active );
			if( active && active.length > 0 ) {
				let targetMech = Math.floor( (active.length+1) * Math.random() );
				if( G.mechs.mechs[ targetMech ].active ) {
					dx = G.mechs.mechs[ targetMech ].x;
					dz = G.mechs.mechs[ targetMech ].z;
				}
			}
			
			if( dx === false ) {
				dx = G.level.disco.position.x;
				dz = G.level.disco.position.z;
			}
			
			self.postMessage({
				type: 'ant-navigate',
				sx: 0,
				sz: 0,
				dx: dx,
				dz: dz,
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
				self.postMessage({
					type: 'sound',
					sfx: 'ant1',
					x: ant.x,
					y: ant.y,
					z: ant.z,
				});				
			}
			else if( ant.action === 'Idle_Aggitated' ) {
				ant.decisionTimer = 10 + Math.random() * 20;
				ant.action = 'Walk';
				this.setAnimation({ ant });
				self.postMessage({
					type: 'sound',
					sfx: 'ant2',
					x: ant.x,
					y: ant.y,
					z: ant.z,
				});
			}
			else if( ant.action === 'Walk' ) {
				ant.decisionTimer = 5 + Math.random() * 15;
				ant.action = 'Idle';
				this.setAnimation({ ant });
				self.postMessage({
					type: 'sound',
					sfx: 'ant1',
					x: ant.x,
					y: ant.y,
					z: ant.z,
				});				
			}

		}
		return;
		
	}
	
	update( delta ) {
	
		this.collectiveDecisionTimer -= delta;
		if( this.collectiveDecisionTimer < 0 ) {
			this.collectiveDecisionTimer = 20 + Math.random() * 20;
			this.makeCollectiveDecision();
		}
		if( this.ants.length < this.maximumAnts ) this.spawnAnt();

		this.antAttackCheckIndex++;
		this.antAttackCheckResetTimer += delta;
		if( this.antAttackCheckResetTimer > 10 ) {
			if( this.antAttackCheckIndex >= this.ants.length ) {
				this.antAttackCheckIndex = 0;
				this.antAttackCheckResetTimer = 0;
			}
		}

		this.ants.map( (ant,index) => {
		
			if( ! ant.ent ) {
				this.getAntMesh({ ant });
			}
			else {

				if( index === this.antAttackCheckIndex ) {
					this.considerAttacking({ ant });
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
			
				if( ant.hp <=0 ) {
					if( ant.action !== 'Death' ) {
						G.score.ant();
						ant.action = 'Death';
						this.setAnimation({ ant });
					}

					ant.gravity += delta * 500;
					ant.y = Math.max( ant.y - ant.gravity * delta , 0 );
					
					if( ant.y === 0 &&
						! ant.animAction.isRunning() &&
						ant.heat === 0 &&
						ant.animAction.time > 0 &&
						ant.animAction._clip.name === 'Death'
					) {
						ant.ent.position.set( ant.x , 375 + ant.y , ant.z );
						this.discardAnt({ ant });
					}
				}
				else {

					if( ant.animAction && ! ant.animAction.isRunning() && ! ['Jump','Sting'].includes( ant.action ) ) {
						ant.action = 'Idle';
						this.setAnimation({ ant });
					}
					ant.decisionTimer -= delta;
					if( ant.decisionTimer < 0 ) {
						this.makeDecision({ ant });
					}
					
					//Ant Logic Tree
					if( ant.action === 'Jump' ) {
						this.updateJump({ ant, delta });
					}
					else if( ant.action === 'Sting' ) {
						if( ! ant.animAction.isRunning() ) {
							this.doJumpAway({ ant });
						}
					}
					else {
						if( ant.y > 0 ) {
							if( ant.x < ant.attackTarget.x - 200
							||	ant.x > ant.attackTarget.x + 200
							||	ant.z < ant.attackTarget.z - 200
							||	ant.z > ant.attackTarget.z + 200
							) {
								ant.gravity += delta * 500;
								ant.y = Math.max( ant.y - ant.gravity * delta , 0 );
							}
							else {
								ant.gravity = 0;
							}
						}
						else {
							if( ant.attackTarget ) {
								this.doAttack({ ant , delta });
							}
							else if( ant.action === 'Walk' ) {
								this.doWalk({ ant , delta });
							}
						}
					}
				}

				
				ant.ent.position.set( ant.x , 375 + ant.y , ant.z );
				ant.ent.rotation.set( 0 , ant.f , 0 );
				ant.mixer.update( delta );
				
			}
			
		});
		
		while( this.removeIds.length > 0 ) {
			const antId = this.removeIds.shift();
			const index = this.ants.findIndex( search => search.id === antId );
			console.log( 'removing' , antId , index );
			this.ants.splice( index , 1 );
		}
	
	}
	
	doAttack({ ant , delta }) {
		
		if( ant.action === 'Bite' && ant.animAction.isRunning() ) return;

		const mech = ant.attackTarget;
		const targetX = mech.x - ant.x;
		const targetZ = mech.z - ant.z;
		const dr = Math.sqrt( targetX*targetX + targetZ*targetZ );
		const df = Math.atan2( targetX,targetZ );
		
		const attackRange = ( ant.headJump ) ? 3500 : 900;
		const minRange = 500;
		
		if( dr < minRange ) {
			if( ant.action !== 'Walk' ) {
				ant.dx = ant.x + Math.random() * (3*(attackRange-(attackRange/2)));
				ant.dz = ant.z + Math.random() * (3*(attackRange-(attackRange/2)));
				ant.action = 'Walk';
				ant.attackTarget = false;
				this.setAnimation({ ant });					
			}
			this.doMove({ ant , delta , targetX , targetZ , df });
		}
		else if( dr > attackRange ) {
			if( ant.action !== 'Walk' ) {
				ant.action = 'Walk';
				this.setAnimation({ ant });					
			}
			this.doMove({ ant , delta , targetX , targetZ , df });
			
		}
		else {
			if(
				this.doMove({ ant , delta , targetX , targetZ , df , attack: true })
			) {
				if( ant.headJump ) {
					this.doJump({ ant , mech, delta });
					self.postMessage({
						type: 'sound',
						sfx: 'ant4',
						x: ant.x,
						y: ant.y,
						z: ant.z,
					});					
				}
				else {
					self.postMessage({
						type: 'sound',
						sfx: 'ant3',
						x: ant.x,
						y: ant.y,
						z: ant.z,
					});					
					G.mechs.takeDamage({ mech , damage: 1 });
					ant.action = 'Bite';
					this.setAnimation({ ant });
				}
			}
			
		}
		
	}
	
	doJumpAway({ ant }) {
		
		if( ant.y > 0 ) {
			ant.action = 'Jump';
			ant.sx = ant.x;
			ant.sy = ant.y;
			ant.sz = ant.z;
			
			let valid = true;
			do {
				ant.dx = ant.x + Math.random() * 3000 - 1500;
				ant.dy = 0;
				ant.dz = ant.z + Math.random() * 3000 - 1500;
				
				valid = true;
				this.source.set( ant.dx , 15000 , ant.dz );
				this.dir.set( 0 , -1 , 0 );
				this.raycaster.set( this.source , this.dir );
				this.raycaster.far = 15500;
				
				const intersects = this.raycaster.intersectObject( G.world.map , true );
				if( intersects[0] ) {
					if( intersects[0].point.y > 1 ) {
						valid = false;
					}
				}
			} while( ! valid );
						
			this.setAnimation({ ant });
			self.postMessage({
				type: 'sound',
				sfx: 'ant4',
				x: ant.x,
				y: ant.y,
				z: ant.z,
			});			
		}
		else {
			ant.decisionTimer = 2 + Math.random() * 5;
			ant.action = 'Idle_Aggitated';
			this.setAnimation({ ant });
			self.postMessage({
				type: 'sound',
				sfx: 'ant2',
				x: ant.x,
				y: ant.y,
				z: ant.z,
			});			
		}
	}
	
	updateJump({ ant, delta }) {
		
		let progress = ant.animAction.time / ant.animAction._clip.duration;
		let oProgress = 1 - progress;
		
		ant.x = ant.sx * oProgress + ant.dx * progress;
		ant.y = ant.sy * oProgress + ant.dy * progress;
		ant.z = ant.sz * oProgress + ant.dz * progress;
		
		if( ! ant.animAction.isRunning() ) {
			ant.action = 'Sting';
			this.setAnimation({ ant });
		
			if( ant.x > ant.attackTarget.x - 200
			&&	ant.x < ant.attackTarget.x + 200
			&&	ant.z > ant.attackTarget.z - 200
			&&	ant.z < ant.attackTarget.z + 200
			) {
				G.mechs.takeDamage({
					mech: ant.attackTarget,
					damage: 10
				});
			}
		
		}
		
	}
	
	doJump({ ant , mech , delta }) {

		ant.dx = mech.x;
		ant.dz = mech.z;
		ant.sx = ant.x;
		ant.sy = 0;
		ant.sz = ant.z;
		ant.gravity = 0;
		
		if( mech.id === 0 ) {
			ant.dy = 900;
		} else if( mech.id === 1 ) {
			ant.dy = 1000;
		}
		else if( mech.id === 2 ) {
			ant.dy = 1200;
		}
		else if( mech.id === 3 ) {
			ant.dy = 1200;
		}
		
		ant.action = 'Jump';
		this.setAnimation({ ant });
		
	}
	
	considerAttacking({ ant }) {
		let rng = 8000;
		let tMech = false;
		let rawRng = 8000;
		
		G.mechs.mechs.map( mech => {
			if( mech.active ) {
				
				let dx = mech.x - ant.x;
				let dz = mech.z - ant.z;
				let dr = Math.sqrt( dx*dx + dz*dz );
				if( mech.spotlight ) dr *= 0.5;
				if( dr < rng ) {
					rng = dr;
					tMech = mech;
					rawRng = ( mech.spotlight ) ? dr * 2 : dr;
				}
				
			}
		});
		
		if( tMech ) {
			
			if( rawRng > 1000 && Math.random() < this.headJumpChance ) {
				ant.headJump = true;
			}
			
			let dx = tMech.x - ant.x;
			let dz = tMech.z - ant.z;

			this.source.set( ant.x , 800 , ant.z );
			this.dir.set( dx , 0 , dz );
			this.dir.normalize();
			this.raycaster.set( this.source , this.dir );
			this.raycaster.far = rawRng;
			
			const intersects = this.raycaster.intersectObject( G.world.map , true );
			if( intersects.length === 0 ) {
				ant.attackTarget = tMech;;
			}
		}
	}
	
	destroy( x,z,area,damage,generateHeat ) {
		this.ants.map( ant => {
			if( ant.hp > 0 ) {
				if( ant.x > x-area && ant.x < x+area &&
				ant.z > z-area && ant.z < z+area ) {
					
					if( damage > 0 ) {
						ant.hp -= damage;
						if( generateHeat ) {
							ant.heat += damage*2;
						}
						if( ant.hp > 0 && ant.action.substr(0,3) !== 'Hit' ) {
							const seq = Math.floor( Math.random() * 3 ) + 1;
							ant.action = 'Hit' + seq;
							ant.decisionTimer = 1 + Math.random() * 2;
							this.setAnimation({ ant });
						}
					}
					
				}
			}
		});
	}	


}