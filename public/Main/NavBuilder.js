export class NavBuilder {
	constructor({ threeD, route }) {

		this.loadNavMapFromFile({ route });
		//this.buildNewNavMapFromGeo({ threeD });
		
	}
	loadNavMapFromFile({ route }) {

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

			/* Debug */
			/*
			canvas = document.createElement( 'canvas' );
			canvas.width = map.width;
			canvas.height = map.height;
			canvas.style.position = 'absolute';
			canvas.style.top = 0;
			canvas.style.left = 0;
			canvas.style.zIndex = 1;
			document.getElementById('Content').appendChild( canvas );
			const offscreen = canvas.transferControlToOffscreen();
			route.postMessage({
				type:	'init',
				canvas: offscreen,
				mapData: data,
			}, [offscreen]);
			/* End Debug */
			
			
			route.postMessage({
				type:	'init',
				canvas: false,
				mapData: data,
			});
			
			setTimeout( () => {
				route.postMessage({
					type:	'route',
					sx: 0, sz: 650,
					dx: 256, dz: 320,
					debug: false,
					quick: true,
				});
			} , 1 );			

		};
		map.src = '/map.png';

	}
	buildNewNavMapFromGeo({ threeD }) {
		/* To build a new nav map from the geo */
		
		const canvas = document.createElement( 'canvas' );
		canvas.style.position = 'absolute';
		canvas.style.top = 0;
		canvas.style.left = 0;
		canvas.style.opacity = 1;
		canvas.style.zIndex = 2;
		canvas.width = 64;
		canvas.height = 64;
		document.getElementById('Content').appendChild( canvas );		
		
		const offscreen = canvas.transferControlToOffscreen();
		threeD.postMessage({
			type:	'buildRoutes',
			canvas: offscreen,
		} , [offscreen]);
		
	}
}