import * as THREE from './../build/three.module.js';
import { G } from './G.js';

export class SFX {

	constructor() {
		this.camera = { x: 0 , y: 0 , z: 0 };
		this.listener = new THREE.AudioListener();
		this.loader = new THREE.AudioLoader();
		this.library = [];
	
		this.ents = [];
	
		[
			'canon',
			'rocket',
			'collapse',
			'laser',
			'minigun',
			'machinegun',
			'flamethrower',
			'explosion',
			'ant1',
			'ant2',
			'ant3',
			'ant4',
		].map( sound => this.loadSound(sound) );
	}
	
	loadSound(sfx) {
		this.loader.load( `sfx/${sfx}.ogg` , buffer => {
			this.library[ sfx ] = buffer;
		});
	}

	playMainTheme() {
		this.themeMusic = new THREE.Audio( this.listener );
		this.loader.load( `sfx/theme.mp3` , buffer => {
			this.themeMusic.setBuffer( buffer );
			this.themeMusic.setLoop( false );
			this.themeMusic.setVolume( 0.5 );
			this.themeMusic.play();
		});
	}
	
	playSound( sfx, volume , x=false , y=false, z=false ) {

		if( ! volume ) {

			const dx = x - this.camera.x;
			const dy = y - this.camera.y;
			const dz = z - this.camera.z;
			const dr = Math.sqrt( dx*dx + dy*dy + dz*dz );
			const volume = 1/15000;
			if( volume > 0 ) {

				const sound = new THREE.PositionalAudio( this.listener );
				sound.setVolume( 1 - dr/15000 );
				sound.setBuffer( this.library[ sfx ] );
				sound.setLoop( false );
				sound.play();
			}
		}
		else {
			console.log( 'TODO:: static sound' );
		}
	}
	
	updateCam({x,y,z}) {
		this.camera = {
			x: x,
			y: y,
			z: z,
		};
	}
	
}
