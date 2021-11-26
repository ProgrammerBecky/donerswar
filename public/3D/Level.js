import * as THREE from './../build/three.module.js';
import { G } from './G.js';

export class Level {

	constructor() {
		this.level = 1;
		this.stage = 1;
	
		this.levelCheckTimer = 0;
	
		const normal = G.texture.load( G.path + 'disco/disco-normal.png' );
		normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
		normal.repeat.set( 1 , 6 );
		
		const metrough = G.texture.load( G.path + 'disco/disco-metrough.png' );
		metrough.wrapS = metrough.wrapT = THREE.RepeatWrapping;
		metrough.repeat.set( 1 , 6 );
		
		const discoMat = G.lights.applyLightMap( new THREE.MeshStandardMaterial({
			color: new THREE.Color( 2,2,2 ),
			normalMap: normal,
			normalScale: new THREE.Vector2(4,4),
			metalnessMap: metrough,
			metalness: 1,
			roughnessMap: metrough,
			roughness: 1,
			envMap: G.environmentMap,
			envMapIntensity: 0.5,
			transparent: true,
			opacity: 0.9,
		}) );	
		const geo = new THREE.CylinderGeometry( 200 , 200 , 6000 , 16 , 1 , true );
		this.disco = new THREE.Mesh( geo , discoMat );
		G.scene.add( this.disco );

		this.setupLevel();
	
	}
	
	setupLevel() {
		if( this.level === 1 ) {
			this.setupGetGroover();
		}
	}
	
	checkLevel( delta ) {

		this.disco.rotation.y += delta * 0.3;
		
		this.levelCheckTimer += delta;
		if( this.levelCheckTimer > 0.5 ) {
			this.levelCheckTimer = 0;
			
			if( this.level === 1 ) {
				this.checkLevelGroover();
			}
			
		}
		
	}
	
	setupGetGroover() {
		this.disco.position.set( 10000 , 1500 , 51684 );
		G.ants.maximumAnts = 3;
		G.ants.headJumpChance = 0;
		G.ants.spawnAnt( 10000 , 51684 );
		G.ants.spawnAnt( 45000 , 51684 );
		G.ants.spawnAnt( 10000 , 21684 );
	}
	checkLevelGroover() {
		
		if( this.stage === 1 ) {
			if( this.checkMechPos({ rng: 1000 }) ) {
				this.stage++;
				self.postMessage({
					type: 'music',
					music: 'stage-victory',
					volume: 0.3,
				});
				this.disco.position.set(21575,1500,57973);
				G.ants.maximumAnts = 5;
				G.ants.headJumpChance = 0;
				G.ants.spawnAnt( 21575, 57973 );				
				G.mechs.mechs[1].x = 10000;
				G.mechs.mechs[1].z = 51684;
				G.mechs.mechs[1].active = true;
				self.postMessage({
					type: 'mech-status',
					mechId: 1,
					status: true,
				});						
			}
		}
		else if( this.stage === 2 ) {
			if( this.checkMechPos({ rng: 1000 }) ) {
				this.stage++;
				this.disco.position.set( 19048.259, 1500 , 43083 );
			}
		}
		else if( this.stage === 3 ) {
			if( this.checkMechPos({ rng: 8000 }) ) {
				this.stage++;
				self.postMessage({
					type: 'music',
					music: 'victory',
					volume: 0.3,
				});
				G.ants.maximumAnts = 10;
				G.ants.headJumpChance = 0.05;
				//G.ants.spawnAnt( 21575, 57973 );				
				G.mechs.mechs[2].x = 19050;
				G.mechs.mechs[2].z = 43083;
				G.mechs.updatePositions();
				G.mechs.mechs[2].active = true;
				self.postMessage({
					type: 'mech-status',
					mechId: 1,
					status: true,
				});	
/*
				self.postMessage({
					type: 'music',
					music: 'stage-three',
					volume: 0.3,
				});
			*/
			}
		}
		
	}
		
	checkMechPos({ x=false,z=false,rng }) {
		
		if( ! x ) x = this.disco.position.x;
		if( ! z ) z = this.disco.position.z;
		
		for( let i=0 ; i<G.mechs.mechs.length ; i++ ) {
			if( G.mechs.mechs[i].active ) {
				const dx = x - G.mechs.mechs[i].x;
				const dz = z - G.mechs.mechs[i].z;
				const dr = Math.sqrt( dx*dx + dz*dz )
				if( dr < rng ) return true;
			}
		}
		return false;
	}

}