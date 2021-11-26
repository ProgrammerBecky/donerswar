import * as THREE from './../build/three.module.js';
import { G } from './G.js';

export class SFX {

	constructor() {
		
		this.vumeterCreate = this.vumeterCreate.bind( this );
		this.vuMin = new Image();
		this.vuMin.src = 'intro/vuMin.png';
		
		this.vuMax = new Image();
		this.vuMax.src = 'intro/vuMax.png';

		this.canvas = document.getElementById( 'vumeter' );
		this.canvas.width = 1920;
		this.canvas.height = 1080;
		this.context = this.canvas.getContext( '2d' );
		
		
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
			'step',
		].map( sound => this.loadSound(sound) );

	}
	
	loadSound(sfx) {
		this.loader.load( G.url + `sfx/${sfx}.ogg` , buffer => {
			this.library[ sfx ] = buffer;
		});
	}

	update() {
		if( this.themeMusic && ! this.themeMusic.isPlaying ) {
			this.playTheme( 'gameLoop1' );
		}
	}

	playTheme( theme , volume = 0.1 ) {
		
console.log(  G.url + `sfx/${theme}.mp3` );		
		this.loader.load( G.url + `sfx/${theme}.mp3` , buffer => {
			if( this.themeMusic ) this.themeMusic.stop();

			this.themeMusic = new THREE.Audio( this.listener );
			this.themeMusic.setBuffer( buffer );
			this.themeMusic.setVolume( volume );
			this.themeMusic.play();
			
			if( ['theme','gameloop1'].includes( theme ) ) {
				this.themeMusic.setLoop( true );				
			}
			else {
				this.themeMusic.setLoop( false );
			}
			if( theme === 'theme' ) this.vumeterCreate();
		});
	}

	vuMeterEnd() {
		this.analyser = false;
	}
	vumeterPlayback() {
		if( this.vuMin && this.vuMax ) {
			
			this.analyser.getByteFrequencyData( this.fft );
			
			const canvasWidth = this.canvas.width;
			const vuWidth = 58;
			
			this.fft.map( (fft,index) => {
				
				const x=1920*index/28;
				if( x < 1920 ) {
					const y=565 - ( fft*565/256 );
					const w=28/1920;
					const oy = 565 - y;

					this.context.drawImage(
						this.vuMin, 0, 0, 58, y,
							x, 0, 58, y);

					this.context.drawImage(
						this.vuMax, 0, y, 58, oy,
							x, y, 58, oy);
				}
			});
		}
	}

	vumeterCreate() {
		const context = this.themeMusic.context;
		const source = this.themeMusic.source;
		this.analyser = context.createAnalyser();
		
		source.connect( this.analyser );
		this.analyser.fftSize = 64;
		
		const bufferLength = this.analyser.frequencyBinCount;
		this.fft = new Uint8Array( bufferLength );
		
		this.analyser.getByteTimeDomainData( this.fft );
	}
	
	playSound( sfx, volume=false , x=false , y=false, z=false ) {

		if( ! volume ) {

			const dx = x - this.camera.x;
			const dy = y - this.camera.y;
			const dz = z - this.camera.z;
			const dr = Math.sqrt( dx*dx + dy*dy + dz*dz );
			const volume = Math.min( 1 , Math.max( 0 , 1 - dr/15000 ) );

			const sound = new THREE.PositionalAudio( this.listener );
			sound.setVolume( volume );
			sound.setBuffer( this.library[ sfx ] );
			sound.setLoop( false );
			sound.play();
			
			this.ents.push({
				x: x,
				y: y,
				z: z,
				sound: sound
			});
			
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
		
		let removeIndex = [];
		this.ents.map( (ent,index) => {
			if( ent.sound.isPlaying ) {

				const dx = ent.x - x;
				const dy = ent.y - y;
				const dz = ent.z - z;
				const dr = Math.sqrt( dx*dx + dy*dy + dz*dz );
				const volume = 1 - dr/15000;

				if( volume > 0 && volume < 1 ) {
					ent.sound.setVolume( volume );
				}
				else {
					ent.sound.setVolume( 0 );
				}
				
			}
			else {
				removeIndex.push( index );
			}
		});
		
		while( removeIndex.length > 0 ) {
			this.ents.splice( removeIndex.shift() , 1 );
		}
	}
	
}
