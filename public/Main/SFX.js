import * as THREE from './../build/three.module.js';
import { G } from './G.js';

export class SFX {

	constructor() {
		this.listener = new THREE.AudioListener();
		this.loader = new THREE.AudioLoader();
		this.library = [];
	
		[
			'canon'
		].map( sound => this.loadSound(sound) );
	}
	
	loadSound(sfx) {
		this.loader.load( `sfx/${sfx}.ogg` , buffer => {
			const effect = new THREE.Audio( this.listener );
			effect.setBuffer( buffer );
			this.library[ sfx ] = effect;
		});
	}
	
	playSound( sfx, volume ) {
		console.log( 'SFX' , sfx , volume );
		this.library[ sfx ].setLoop( false );
		this.library[ sfx ].setVolume( volume );
		this.library[ sfx ].play();
	}
	
}
