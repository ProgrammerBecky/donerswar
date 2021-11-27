import * as THREE from './../build/three.module.js';
import { G } from './G.js';

export class Level {

	constructor() {
		this.level = 1;
		this.stage = 0;
	
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
		}) );	
		const geo = new THREE.CylinderGeometry( 200 , 200 , 6000 , 16 , 1 , true );
		this.disco = new THREE.Mesh( geo , discoMat );
		G.scene.add( this.disco );

		this.setupLevel();
		this.stage = 0;
	}
	
	setupLevel() {
		if( this.level === 1 ) {
			this.setupGetGroover();
		}
	}
	
	checkLevel( delta ) {

		if( this.level === 1 ) {
			this.disco.rotation.y += delta * 0.3;
			
			this.levelCheckTimer += delta;
			if( this.levelCheckTimer > 0.5 ) {
				this.levelCheckTimer = 0;
				
				if( this.level === 1 ) {
					this.checkLevelGroover();
				}
				
			}
			
			let active = G.mechs.mechs.find( search => search.active );
			if( ! active ) {
				this.level = 0;
				self.postMessage({
					type: 'game-over',
					victory: false,
				});
				G.score.gameover();
				self.postMessage({
					type: 'music',
					music: 'defeat',
					volume: 0.5,
				});			
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
		
		this.stages = [
			{
				disco: {x: 21575, z: 57973},
				ants: {maximumAnts: 5, headJumpChance: 0},
				spawnAhead: 1,
				spawnBehind: 0,
				rewardMech: false,
			},
			{
				disco: { x: 19048, z: 43083},
				ants: {maximumAnts: 10, headJumpChance: 0.05},
				spawnAhead: 3,
				spawnBehind: 0,
				rewardMech: 1,
			},
			{
				disco: { x: 10664, z: 14927 },
				ants: { maximumAnts: 15, headJumpChance: 0.2},
				spawnAhead: 10,
				spawnBehind: 10,
				rewardMech: false,
			},
			{
				disco: { x: 19819, z: 7500 },
				ants: { maximumAnts: 15, headJumpChance: 0.3},
				spawnAhead: 10,
				spawnBehind: 10,
				rewardMech: false,
			},
			{
				disco: { x: 35081 , z: 11674},
				ants: { maximumAnts: 20, headJumpChance: 0.4},
				spawnAhead: 20,
				spawnBehind: 20,
				rewardMech: 2,
			},
			{
				disco: { x: 38770 , z: 26410},
				ants: { maximumAnts: 25, headJumpChance: 0.5},
				spawnAhead: 20,
				spawnBehind: 20,
				rewardMech: false,
			},
			{
				disco: { x: 54385 , z: 10279},
				ants: { maximumAnts: 10, headJumpChance: 0.5},
				spawnAhead: 5,
				spawnBehind: 5,
				rewardMech: false,
			},
			{
				disco: { x: 68956 , z: 21360},
				ants: { maximumAnts: 12, headJumpChance: 0.5},
				spawnAhead: 10,
				spawnBehind: 10,
				rewardMech: 3,
			},
			{
				disco: { x: 77455 , z: 47863},
				ants: { maximumAnts: 15, headJumpChance: 0.5},
				spawnAhead: 12,
				spawnBehind: 12,
				rewardMech: false,
			},
			{
				disco: { x: 72385 , z: 67290},
				ants: { maximumAnts: 15, headJumpChance: 0.5},
				spawnAhead: 12,
				spawnBehind: 12,
				rewardMech: false,
			},
			{
				disco: { x: 64766 , z: 77392},
				ants: { maximumAnts: 25, headJumpChance: 0.5},
				spawnAhead: 20,
				spawnBehind: 20,
				rewardMech: false,
			},
			{
				disco: { x: 42500 , z: 42500},
				ants: { maximumAnts: 50, headJumpChance: 1},
				spawnAhead: 50,
				spawnBehind: 50,
				rewardMech: false,
			},
			{
				disco: { x: 0 , z: 0},
				ants: { maximumAnts: 0, headJumpChance: 0},
				spawnAhead: 0,
				spawnBehind: 0,
				rewardMech: false,
				victory: true,
			},
		];	
		
	}
	checkLevelGroover() {
		
		let victory = false;
		for( let i=0 ; i<G.mechs.mechs.length ; i++ ) {
			if( G.mechs.mechs[i].active ) {
				const dx = this.disco.position.x - G.mechs.mechs[i].x;
				const dz = this.disco.position.z - G.mechs.mechs[i].z;
				const dr = Math.sqrt( dx*dx + dz*dz )
				if( dr < 1000 ) {
					victory=true;
				}
			}
		}
		
		if( victory ) {
			G.score.disco();
			const data = this.stages[ this.stage ];
			
			if( data.victory ) {
				this.level = 0;
				self.postMessage({
					type: 'music',
					music: 'victory',
					volume: 0.5,
				});		
				self.postMessage({
					type: 'game-over',
					victory: true,
				});
				G.score.gameover();
				return;
			}

			G.ants.maximumAnts = data.ants.maximumAnts;
			G.ants.headJumpChance = data.ants.headJumpChance;
			
			for( let i=0 ; i<data.spawnAhead ; i++ ) {
				G.ants.spawnAnt(
					data.disco.x + Math.random() * 5000 - 2500,
					data.disco.z + Math.random() * 5000 - 2500
				);
			}
			
			if( data.spawnBehind > 0 ) {
				const oldDisco = this.stages[ this.stage-2 ].disco;
				for( let i=0 ; i<data.spawnBehind ; i++ ) {
					G.ants.spawnAnt(
						oldDisco.x + Math.random() * 5000 - 2500,
						oldDisco.z + Math.random() * 5000 - 2500
					);
				}
			}

			this.disco.position.set( data.disco.x , 1500 , data.disco.z );

			if( data.rewardMech ) {
				
				const spawnDisco = this.stages[ this.stage-1 ].disco;
				
				self.postMessage({
					type: 'music',
					music: 'mechunlock' + data.rewardMech,
					volume: 0.3,
				});
				
				G.mechs.mechs[ data.rewardMech ].x = spawnDisco.x;
				G.mechs.mechs[ data.rewardMech ].z = spawnDisco.z;
				G.mechs.mechs[ data.rewardMech ].active = true;
				G.mechs.mechs[ data.rewardMech ].inactiveTimer = 0;
				G.mechs.updatePositions();
				
				self.postMessage({
					type: 'mech-status',
					mechId: data.rewardMech,
					status: true,
				});						
			}
			else {
				
				self.postMessage({
					type: 'music',
					music: 'stage-complete',
					volume: 0.3,
				});
				
			}

			this.stage++;

		}

	}
		

}