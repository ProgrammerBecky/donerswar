export class NavBuilder {
	constructor({ threeD, route }) {
	
		const canvas = document.createElement( 'canvas' );
		canvas.style.position = 'absolute';
		canvas.style.top = 0;
		canvas.style.left = 0;
		canvas.style.opacity = 1;
		canvas.style.zIndex = 2;
		canvas.width = 1024;
		canvas.height = 1024;
		document.getElementById('Content').appendChild( canvas );
		const offscreen = canvas.transferControlToOffscreen();

		threeD.postMessage({
			type:	'buildRoutes',
			canvas: offscreen,
		} , [offscreen]);
		
	}
}