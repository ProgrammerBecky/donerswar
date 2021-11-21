import * as THREE from './../build/three.module.js';
import { G } from './G.js';

export class Particles {

	constructor() {
		
		this.smokeTex = [];
		this.sandTex = [];
		this.fireTex = [];
		this.particles = [];
		
		for( let s=1 ; s<=16 ; s++ ) {
			this.sandTex.push(
				new THREE.SpriteMaterial({
					map: G.texture.load( `/high/sand/sand${s}.png` ),
					transparent: true,
					name: 'SANDTEX'+s,
				})
			);
			this.smokeTex.push(
				new THREE.SpriteMaterial({
					map: G.texture.load( `/high/smoke/smoke${s}.png` ),
					transparent: true,
					name: 'SMOKETEX'+s,
				})			
			);
		}
		for( let s=1 ; s<=20 ; s++ ) {
			this.fireTex.push(
				new THREE.SpriteMaterial({
					map: G.texture.load( `/high/flame/flame${s}.png` ),
					transparent: true,
					name: 'SMOKETEX'+s,
				})			
			);
		}
		
	}
	
	destroy({ index, particle }) {
		if( particle.ent ) G.scene.remove( particle.ent );
		if( particle.lightRef ) G.lights.removeLight( particle.lightRef );
		if( index > -1 ) {
			this.particles.splice( index , 1 );
		}
	}
	
	spawnBuildingDestroy({ building }) {
		
		for( let x=building.bounds.min.x; x<building.bounds.max.x ; x+= 1000 ) {
			for( let y=building.bounds.min.y; y<building.bounds.max.y ; y+= 1000 ) {
				for( let z=building.bounds.min.z; z<building.bounds.max.z ; z+= 1000 ) {
			
					let wx = x + Math.random()*1000-500;
					let wy = y + Math.random()*1000-500;
					let wz = z + Math.random()*1000-500;
					this.spawnSand({
						x: wx,
						y: wy,
						z: wz,
					});
			
				}
			}
		}
		
	}
	
	spawnSand({ x,y,z, size=150, maxLife = 300 }) {
		const t = Math.floor( Math.random() * 16 );
		const life = Math.min(
			maxLife,
				( Math.random() < 0.02 )
				? 5 + Math.random() * 235
				: ( Math.random() < 0.02 )
				? 5 + Math.random() * 45
				: 5 + Math.random() * 15
			);
		
		const ent = new THREE.Sprite( this.sandTex[ t ].clone() );
		ent.material.rotation = Math.PI*2*Math.random();
		ent.position.set( x,y,z );
		G.scene.add( ent );
		
		ent.material.color = G.lights.getSpriteColour({ x,z });
		
		this.particles.push({
			ent: ent,
			scale: size + Math.random()*size*2,
			life: life,
			maxLife: life,
			drift: 5 + Math.random() * 15,
			type: 'cloud',
			lightSensitive: true,
		});
		
	}
	
	spawnSmokeEmitter({ x,y,z, duration, size, ringDensity, speed, drift, emitFrequency }) {
	
		const spin = Math.PI * Math.random() * 2;
	
		for( let i=0 ; i<ringDensity ; i ++ ) {
			const f = (Math.PI*2)*(i/ringDensity) + spin;
	
			const life = duration/2 + Math.random()*duration;
	
			this.particles.push({
				x: x,
				y: y,
				z: z,
				cos: Math.cos( f ),
				sin: Math.sin( f ),
				speed: speed,
				emitTimer: 0,
				scale: size + Math.random()*size,
				life: life,
				drift: drift,
				type: 'smokeEmitter',
				emitFrequency: emitFrequency,
			});
		}
	}	
	
	spawnSmoke({ emitter }) {

		const t = Math.floor( Math.random() * 16 );
		const life = ( Math.random() < 0.01 )
			? 5 + Math.random() * 55
			: ( Math.random() < 0.02 )
			? 3 + Math.random() * 15
			: 1 + Math.random() * 3;
			
		const ent = new THREE.Sprite( this.smokeTex[ t ].clone() );
		ent.position.set( emitter.x, emitter.y, emitter.z );
		ent.material.rotation = Math.PI*2*Math.random();
		G.scene.add( ent );
		
		ent.material.color = G.lights.getSpriteColour({ x: emitter.x, z: emitter.z });
		
		this.particles.push({
			ent: ent,
			scale: emitter.scale + Math.random()*emitter.scale,
			life: life,
			maxLife: life,
			drift: emitter.drift * Math.random() * 0.1,
			type: 'cloud',
			lightSensitive: true,
		});
		
	}
	
	updateSmokeEmitter({ index, particle , delta }) {
		
		particle.life -= delta;	
		
		particle.x += particle.sin * delta * particle.speed;
		particle.z += particle.cos * delta * particle.speed;
		particle.y += particle.drift * delta;
		
		if( particle.life > 0 ) {
			particle.emitTimer += delta;
			while( particle.emitTimer > 0 ) {
				particle.emitTimer -= particle.emitFrequency;
				particle.emitFrequency *= 1.1;
				particle.y += delta * particle.drift;
				this.spawnSmoke({ emitter: particle });
			}
		}
		else {
			this.destroy({ index, particle });
		}
	}
	
	updateCloud({ index, particle, delta }) {
		particle.life -= delta;
		let opacity = particle.life / particle.maxLife;
		
		if( opacity > 0 ) {
			particle.scale += delta * 150;
			particle.ent.scale.set( particle.scale, particle.scale );
			particle.ent.position.y += delta * particle.drift;
			particle.ent.material.opacity = opacity;
		}
		else {
			this.destroy({ index, particle });
		}
	}
	
	updateFire({ index, particle, delta }) {
		particle.elapsed += delta;
		let frame = Math.floor( particle.elapsed / (particle.lifespan/20) );
		if( frame !== particle.frame ) {
			if( frame > 15 ) {
				G.lights.removeLight( particle.lightRef );
				particle.lightRef = false;
			}
			if( frame >= 20 ) {
				this.destroy({ index, particle });
				return;
			}
			else {
				particle.ent.material = this.fireTex[ frame ].clone();
				particle.ent.material.rotation = particle.rotation;
				particle.frame = frame;
			}
		}
		
		const size = particle.size * (particle.elapsed/particle.lifespan);
		particle.ent.scale.set( size , size , size );
		
		particle.gravity += delta * 25;
		particle.ent.position.y = Math.max( particle.ent.position.y - particle.gravity * delta , 0 );
		
	}
	
	spawnFire({ x,y,z,size }) {
		
		const rotation = Math.PI*2*Math.random();

		const ent = new THREE.Sprite( this.fireTex[ 0 ].clone() );
		ent.position.set( x,y,z );
		ent.scale.set( size/20,size/20,size/20 );
		ent.material.rotation = rotation;
		G.scene.add( ent );
		
		this.particles.push({
			ent: ent,
			frame: 1,
			elapsed: 0,
			lifespan: 1,
			rotation: rotation,
			type: 'fire',
			gravity: 0,
			size: size,
			lightSensitive: false,
			lightRef: G.lights.registerLight({
				x: ent.position.x,
				z: ent.position.z,
				f: 0,
				splatSize: 8,
				splat: 3,
			})
		});
		
	}	
	
	spawnRocket({ x,y,z,dir,speed,duration,arc }) {
		
		this.particles.push({
			x: x,
			y: y,
			z: z,
			speed: speed,
			duration: duration,
			dir: new THREE.Vector3( dir.x , dir.y , dir.z ),
			source: new THREE.Vector3( x,y,z ),
			raycaster: new THREE.Raycaster(),
			arc: arc,
			puffTimer: 0,
			type: 'rocket',
			lightRef: G.lights.registerLight({
				x: x,
				z: z,
				f: 0,
				splatSize: 8,
				splat: 0,
			})
		});

	}
	
	detonateRocket({ particle, target=false }) {
		
		this.spawnSmokeEmitter({
			x: particle.x,
			y: particle.y,
			z: particle.z,
			drift: 3000,
			speed: 3000,
			ringDensity: 12,
			duration: 1.5,
			size: 500,
			emitFrequency: 0.025
		});			
		
		G.world.destroy( particle.x , particle.z , 1500 , 5000 , target );
	}
	
	updateRocket({ index, particle, delta }) {
		
		particle.duration -= delta;
		if( particle.duration < 0 || particle.y < 0 ) {
			this.detonateRocket({ particle });
			this.destroy({ index, particle });
		}
		else {
				
			particle.speed -= delta * 2000;
			
			particle.raycaster.far = particle.speed * delta;
			particle.source.set( particle.x , particle.y , particle.z );
			particle.raycaster.set( particle.source , particle.dir );
			const intersects = particle.raycaster.intersectObject( G.world.map , true );
			
			if( intersects.length > 0 ) {
				this.detonateRocket({ particle });
				this.destroy({ index, particle });				
			}
			else {
			
				let altSpeed = 1-particle.dir.y;
				particle.x += particle.dir.x * delta * particle.speed * altSpeed;
				particle.z += particle.dir.z * delta * particle.speed * altSpeed;
				particle.dir.y += particle.arc * delta;
				
				particle.puffTimer += delta;
				while( particle.puffTimer > 0 ) {
					particle.puffTimer -= 0.0375;
					this.spawnFire({
						x: particle.x,
						y: particle.y,
						z: particle.z,
						size: 450,
					});
				}
				particle.y += particle.dir.y * delta * particle.speed;
			
				G.lights.updateLight({
					lightId: particle.lightRef,
					x: particle.x,
					z: particle.z,
					f: 0,
				});
			}
			
		}
		
	}
	
	update( delta ) {
		this.particles.map( (particle,index) => {
			if( particle.type === 'cloud' ) {
				this.updateCloud({ index, particle , delta });
			}
			else if( particle.type === 'smokeEmitter' ) {
				this.updateSmokeEmitter({ index, particle , delta });
			}
			else if( particle.type === 'fire' ) {
				this.updateFire({ index, particle, delta });
			}
			else if( particle.type === 'rocket' ) {
				this.updateRocket({ index, particle, delta });
			}
		});
	}

}