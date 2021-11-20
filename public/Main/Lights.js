import { G } from './G.js';

const LIGHT_MAP_SIZE = 512;

export class Lights {

	constructor() {
		this.createCanvas();
		this.loadSplats();
	}

	createCanvas() {
		
		let canvas = document.createElement( 'canvas' );
		canvas.width = LIGHT_MAP_SIZE;
		canvas.height = LIGHT_MAP_SIZE;
		const offscreen = canvas.transferControlToOffscreen();

		canvas.style.position = 'absolute';
		canvas.style.top = '0';
		canvas.style.left = '0';
		canvas.style.zIndex = -1;
		document.body.appendChild( canvas );

		G.threeD.postMessage({
			type: 'init-lighting',
			canvas: offscreen,
		} , [ offscreen ]);
		
		
		
	}

	loadSplats() {
		
		this.splats = [];
		
		for( let i=0 ; i<=2 ; i++ ) {
			
			const img = new Image();
			img.setAttribute( 'data-index' , i );
			
			img.onload = () => {
				
				let canvas = document.createElement( 'canvas' );
				canvas.width = img.width;
				canvas.height = img.height;
				const context = canvas.getContext( '2d' );
				context.drawImage( img,0,0 );
				
				let splat = document.createElement( 'canvas' );
				splat.width = img.width;
				splat.height = img.height;
				const offscreen = splat.transferControlToOffscreen();
				
				G.threeD.postMessage({
					type: 'lightSplat',
					index: img.getAttribute( 'data-index' ),
					splat: offscreen,
					imageData: context.getImageData(0,0,img.width,img.height),
				}, [ offscreen ]);
			}
			img.src = '/high/lights/' + i + '.png';
		}
		
	}

}