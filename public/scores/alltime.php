<?php

include __DIR__ . '/cors.php';

header('Content-Type: application/json; charset=utf-8');

$hiScoresFile = "games/alltime.json";
$scores = getDayScores( 'alltime' );

$year = date( 'Y' , time() );
$month = date( 'N' , time() );
$month -= 6;
if( $month < 1 ) {
	$month += 12;
	$year--;
}

for( $i=0 ; $i<7 ; $i++ ) {

	$dayScores = getDayScores( "{$year}-{$month}" );
	$scores = topScores( $scores , $dayScores );
	
	$month++;
	if( $month === 13 ) {
		$month = 1;
		$year++;
	}
}

$scores = json_encode( $scores );
if( file_exists( $hiScoresFile ) ) {
	unlink( $hiScoresFile );
}
$stream = fopen( $hiScoresFile , 'a' );
fputs( $stream , $scores );
fclose( $stream );

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
