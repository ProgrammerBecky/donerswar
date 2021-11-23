import * as THREE from './../build/three.module.js';
import { G } from './G.js';

export class SFX {

	constructor() {
		this.camera = new THREE.Camera();
		this.listener = new THREE.AudioListener();
		this.camera.add( this.listener );
		this.scene = new THREE.Scene();
		this.scene.add( this.camera );
		this.loader = new THREE.AudioLoader();
		this.library = [];
	
		this.ents = [];
	
		[
			'canon'
		].map( sound => this.loadSound(sound) );
	}
	
	loadSound(sfx) {
		this.loader.load( `sfx/${sfx}.ogg` , buffer => {
			this.library[ sfx ] = buffer;
		});
	}
	
	playSound( sfx, volume , x=false , y=false, z=false ) {

		if( ! volume ) {
			const sound = new THREE.PositionalAudio( this.listener );
			sound.setBuffer( this.library[ sfx ] );
			sound.setLoop( false );
			sound.setRefDistance( 2000 );

			let ent = new THREE.Group();
			ent.position.set( x,y,z );
			ent.add( sound );
			this.scene.add( ent );
			this.ents.push( ent );
			sound.play();
		}
		else {
			console.log( 'TODO:: static sound' );
		}
	}
	
	updateCam(x,y,z,f) {
		this.camera.position.set( x , y , z );
		this.camera.rotation.set( 0 , f , 0 );
	}
	
}
