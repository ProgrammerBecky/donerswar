import { G } from './G.js';

export class NavBuilder {
	constructor() {

		this.loadNavMapFromFile();
		//this.buildNewNavMapFromGeo();
		
	}
	loadNavMapFromFile() {

		/* To load a new map from image file */
		let map = new Image();
		map.onload = image => {

			let canvas = document.createElement( 'canvas' );
			canvas.style.position = 'absolute';
			canvas.style.top = 0;
			canvas.style.left = 0;
			canvas.style.zIndex = 1;
			canvas.width = map.width;
			canvas.height = map.height;
			
			const context = canvas.getContext( '2d' );
			context.drawImage( map,0,0 );
			const data = context.getImageData( 0,0, canvas.width,canvas.height );
			//document.getElementById('Content').appendChild( canvas );
			
			G.route.postMessage({
				type:	'init',
				canvas: false,
				mapData: data,
			});
			
		};
		map.src = '/map.png';

	}
	buildNewNavMapFromGeo() {
		/* To build a new nav map from the geo */

		let map = new Image();
		map.onload = image => {
			
			let canvas = document.createElement( 'canvas' );
			canvas.style.position = 'absolute';
			canvas.style.top = 0;
			canvas.style.left = 0;
			canvas.style.zIndex = 1;
			canvas.width = map.width;
			canvas.height = map.height;
			
			const context = canvas.getContext( '2d' );
			context.drawImage( map,0,0 );
			const data = context.getImageData( 0,0, canvas.width,canvas.height );			
			
			let newCanvas = document.createElement( 'canvas' );
			newCanvas.width = map.width;
			newCanvas.height = map.height;
			newCanvas.style.position = 'absolute';
			newCanvas.style.top = 0;
			newCanvas.style.left = 0;
			newCanvas.style.zIndex = 1;
			document.getElementById('Content').appendChild( newCanvas );
			const offscreen = newCanvas.transferControlToOffscreen();
			
			setTimeout( () => {
				console.log( 'REBUILD MAP' );
				G.threeD.postMessage({
					type:	'rebuild-map',
					canvas: offscreen,
					mapData: data,
					width: map.width,
					height: map.height,
				}, [offscreen]);
			} , 30000 );
			
		};
		map.src = '/map.png';		
		
	}
}