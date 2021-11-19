import * as THREE from './../build/three.module.js';
import { G } from './G.js';

export class Particles {

	constructor() {
		
		this.sandTex = [];
		this.particles = [];
		
		for( let s=1 ; s<=16 ; s++ ) {
			this.sandTex.push(
				new THREE.SpriteMaterial({
					map: G.texture.load( `/high/sand/sand${s}.png` ),
					transparent: true,
				})
			);
		}
		
	}

	update( delta ) {
		this.particles.map( particle => {
			if( particle.type === 'sand' ) this.updateSand({ sand: particle , delta });
		});
	}
	
	destroy({ particle }) {
		const index = this.particles.find( search => search === particle );
		if( index > -1 ) {
			this.particles.splice( index , 1 );
		}
	}
		
	spawnBuildingDestroy({ building }) {
		
		/*
		const vb = building.ent.geometry.attributes.position.array;
		for( let i=0 ; i<vb.length ; i+=3 ) {
			if( Math.random() < 0.05 ) {
				let wx = building.ent.position.x + vb[i];
				let wy = building.ent.position.y + vb[i+1];
				let wz = building.ent.position.z + vb[i+2];
				this.spawnSand({
					x: wx + Math.random() * 250 - 125,
					y: wy + Math.random() * 250 - 125,
					z: wz + Math.random() * 250 - 125,
				});
			}
		}
		*/
		
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
	
	spawnSand({ x,y,z }) {
		let t = Math.floor( Math.random() * 16 );
		let life = ( Math.random() < 0.1 )
			? 5 + Math.random() * 55
			: 5 + Math.random() * 10
		
		let ent = new THREE.Sprite( this.sandTex[ t ].clone() );
		ent.position.set( x,y,z );
		G.scene.add( ent );
		
		this.particles.push({
			ent: ent,
			x: x,
			y: y,
			z: z,
			scale: 150 + Math.random()*300,
			life: life,
			maxLife: life,
			drift: 5 + Math.random() * 15,
			type: 'sand',
		});
		
	}
	updateSand({ sand, delta }) {
		sand.life -= delta;
		let opacity = sand.life / sand.maxLife;
		
		if( opacity > 0 ) {
			sand.scale += delta * 150;
			sand.ent.scale.set( sand.scale, sand.scale );
			sand.ent.position.y += delta * sand.drift;
			sand.ent.material.opacity = opacity;
		}
		else {
			G.scene.remove( sand.ent );
			this.destroy({ particle: sand });
		}
	}

}