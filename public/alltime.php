<?php
ini_set( 'display_errors' , true );
error_reporting( E_ALL );
header('Content-Type: application/json; charset=utf-8');

$hiScoresFile = "games/alltime.json";
$scores = getDayScores( 'alltime' );

$mostRecentFile = "games/mostRecent.txt";
if( file_exists( $mostRecentFile ) ) {
	$mostRecent = file_get_contents( $mostRecentFile );
}
else {
	$mostRecent = date( 'Y-m-d' , time() - (60*60*24*30) );
}

$time = strtotime( $mostRecent .' 00:00:00' );
$today = time();

while( $time < $today ) {
	$dayScores = getDayScores( date( 'Y-m-d' , $time ) );
	$scores = topScores( $scores , $dayScores );
	$time += 60*60*24;
}

$yesterday = time() - ( 60*60*24 );
unlink( $mostRecentFile );
file_put_contents( $mostRecentFile , date('Y-m-d' , $yesterday ) );

$scores = json_encode( $scores );
if( file_exists( $hiScoresFile ) ) {
	unlink( $hiScoresFile );
}
file_put_contents( $hiScoresFile , $scores );

function topScores( $scores , $newScores ) {
	foreach( $newScores as $newScore ) {
		$scores[] = $newScore;
	}
	
	usort( $scores , function ($a,$b) {
		if( $a->discos > $b->discos ) return -1;
		if( $a->discos === $b->discos ) {
			if( $a->ants > $b->ants ) return -1;
			if( $a->ants === $b->ants ) {
				if( $a->buildings < $b->buildings ) return -1;
				if( $a->buildings === $b->buildings ) {
					if( $a->time < $b->time ) return -1;
				}
			}
		}
		return 1;
	});	
	
	$output = [];
	for( $i=0 ; $i<100 ; $i++ ) {
		if( isset( $scores[$i] ) ) {
			$output[] = $scores[$i];
		}
	}
	
	return $output;
	
}
function getDayScores( $file ) {

	$gameday = "games/${file}.json";
	if( file_exists( $gameday ) ) {
		$datas = explode( "\n" , file_get_contents( $gameday ) );
		$scores = [];
		for( $i=1 ; $i<count($datas) ; $i+=2 ) {
			$data = json_decode( $datas[ $i ] );
			if( $data ) {
				$scores[ $data->key ] = $data;
			}
		}
		$datas = null;

		usort( $scores , function ($a,$b) {
			if( $a->discos > $b->discos ) return -1;
			if( $a->discos === $b->discos ) {
				if( $a->ants > $b->ants ) return -1;
				if( $a->ants === $b->ants ) {
					if( $a->buildings < $b->buildings ) return -1;
					if( $a->buildings === $b->buildings ) {
						if( $a->time < $b->time ) return -1;
					}
				}
			}
			return 1;
		});
		
		return $scores;
	}
	return [];
}

die( $scores );
