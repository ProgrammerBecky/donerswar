import { G } from './G.js';

export class HighScore {
	constructor() {
		
		document.getElementById('HighScore').addEventListener( 'click' , (e) => {
			G.highScores.show();
		});		
		
		document.getElementById('Today').addEventListener( 'click' , (e) => {
			G.highScores.type = 'today';
			G.highScores.getScores();
			G.highScores.show();
		});		

		document.getElementById('AllTime').addEventListener( 'click' , (e) => {
			G.highScores.type = 'all-time';
			G.highScores.getScores();
			G.highScores.show();
		});		
		
		document.getElementById('CloseHighScore').addEventListener( 'click' , (e) => {
			G.highScores.hide();
		});
		
		this.type = 'today';
		this.getScores();
	}
	setRank( rank ) {
		this.rank = rank;
		const templated = `You are ranked ${this.ordinalSuffix(this.rank)}`;
		
		const _el = document.getElementsByClassName('Ranking');
		
		for( let i=0 ; i<_el.length ; i++ ) {
			_el[i].innerHTML = templated;
		}
		
		const showRank = document.getElementById('GameRank');
		showRank.classList.remove( 'faded' );
		setTimeout( (showRank) => {
			showRank.classList.add( 'faded' );
		} , 8000 , showRank );
	}
	
	ordinalSuffix(i) {
		var j = i % 10,
			k = i % 100;
		if (j == 1 && k != 11) {
			return i + "st";
		}
		if (j == 2 && k != 12) {
			return i + "nd";
		}
		if (j == 3 && k != 13) {
			return i + "rd";
		}
		return i + "th";
	}	
	
	getScores() {
	
		let self = this;
	
		const _table = document.getElementById('HighScoreTable');
		_table.innerHTML = '';
	
		const date = new Date();
		const url = ( this.type === 'today' )
			? G.url + 'scores/hiscore.php?t=' + date.getTime()
			: G.url + 'scores/alltime.php?t=' + date.getTime();
	
		const xhttp = new XMLHttpRequest();
		xhttp.open( "GET" , url , true );
		xhttp.setRequestHeader( 'Content-Type' , 'application/json; charset=UTF-8' );

		xhttp.onreadystatechange = () => {
			if( xhttp.readyState === 4 && xhttp.status === 200 ) {
				self.scores = JSON.parse( xhttp.response );
				this.populateHighScore();
			}
		}
		
		xhttp.send();
	
	}
	
	show() {
		this.getScores();
		document.getElementById('HighScores').style.display = 'block';
	}
	hide() {
		document.getElementById('HighScores').style.display = 'none';
	}
	nameEntry() {
		
	}
	safeName(rawStr) {
		const encodedStr = rawStr.replace(/[\u00A0-\u9999<>\&]/g, function(i) {
		   return '&#'+i.charCodeAt(0)+';';
		});	
		return encodedStr;		
	}
	
	populateHighScore() {
		const _table = document.getElementById('HighScoreTable');
		_table.innerHTML = '';
		
		let html = '';
		
		document.getElementById('Showing').innerHTML = ( this.type === 'today' )
			? 'This Week' : 'All-Time';
		
		this.scores.map( (score,index) => {
			html += `<tr>
				<td>${(index+1)}</td>
				<td style='text-align:left'>${score.name}</td>
				<td>${score.discos}</td>
				<td>${score.ants}</td>
				<td>${score.buildings}</td>
				<td>${this.showTime(score.time)}</td>
			</tr>`;
		});
		
		_table.innerHTML = html;
		
	}
	
	showTime( ms ) {
		let h = 0;
		let m = 0;
		let s = 0;
		
		while( ms >= 3600000 ) {
			ms -= 3600000;
			h++;
		}
		while( ms >= 60000 ) {
			ms -= 60000;
			m++;
		}
		while( ms >= 1000 ) {
			ms -= 1000;
			s++;
		}
		
		if( h === 0 ) h = '';
		if( s < 10 ) s = '0' + s;
		
		if( h > 0 ) {
			if( m < 10 ) m = '0' + m;
			return `${h}h${m}m${s}s`;
		}
		else {
			return `${m}m${s}s`;
		}
	}
}