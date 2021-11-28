export class Score {

	constructor() {
	
		this.discos = 0;
		this.ants = 0;
		this.buildings = 0;
		this.startTime = new Date();
		this.storeScore();
		this.name = '';
		this.key = false;
		
		this.updateRank = this.updateRank.bind( this );
		
	}
	
	disco() {
		this.discos++;
		this.storeScore();
	}
	
	ant() {
		this.ants++;
	}
	
	building() {
		this.buildings++;
	}
	
	gameover() {
		this.storeScore();
	}
	
	storeScore() {
		const time = new Date() - this.startTime;
		
		const xhttp = new XMLHttpRequest();
		xhttp.open( "POST" , "scores/score.php" , true );
		xhttp.setRequestHeader( 'Content-Type' , 'application/json; charset=UTF-8' );
		
		let self = this;
		xhttp.onreadystatechange = () => {
			if( xhttp.readyState === 4 && xhttp.status === 200 ) {
				const output = JSON.parse( xhttp.response );
				if( output && output.key ) {
					self.key = output.key;
				}
				if( output && output.ranking ) {
					self.ranking = output.ranking;
					self.updateRank();
				}
			}
		}
		
		xhttp.send( JSON.stringify({
			discos: this.discos,
			ants: this.ants,
			buildings: this.buildings,
			time: time,
			key: this.key,
			name: this.name,
		}) );
	}
	
	updateRank() {
		self.postMessage({
			type: 'ranking',
			rank: this.ranking,
		});		
	}
	
}