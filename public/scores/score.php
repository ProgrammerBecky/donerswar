<?php

ini_set( 'display_errors' , true );
error_reporting( E_ALL );

header('Content-Type: application/json; charset=utf-8');
$newScore = json_decode( file_get_contents('php://input') );

if( isset( $newScore->key ) ) {
	storeScore( $newScore );
}
else {
	if( $newScore->discos === 0
	&&	$newScore->ants === 0
	&&	$newScore->buildings === 0
	) {
		$output = new \StdClass();
		$output->key = generate_key();

		$games = append_game( $output->key );
		
		die( json_encode( $output ) );
	}
}


function storeScore( $score ) {
	
	$newkey = uniqid();
	
	$gameday = "games/" . date( 'Y-N' , time() ) . ".json";
	$games = explode( "\n" , file_get_contents( $gameday ) );
	
	foreach( $games as $index=>$game ) {
		if( $game === $score->key ) {
			$games[ $index+1 ] = json_encode( $score );
		}
	}

	unlink( $gameday );
	file_put_contents( $gameday , implode( "\n" , $games ) , FILE_APPEND );
	
	$output = new \StdClass();
	$output->ranking = ranking( $games , $score->key );


	die( json_encode( $output ) );
}

function append_game( $key ) {

	$gameday = "games/" . date( 'Y-N' , time() ) . ".json";
	file_put_contents( $gameday , $key . "\n\n" , FILE_APPEND );
	
}
function generate_key() {
	
	return uniqid();
	
}
function ranking( $games , $key ) {

	

	$scores = [];
	for( $i=1 ; $i<count($games) ; $i+=2 ) {
		$data = json_decode( $games[ $i ] );
		if( $data ) {
			$scores[ $data->key ] = $data;
		}
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
	
	foreach( $scores as $index=>$score ) {
		if( $score->key === $key ) return $index + 1;
	}
}	
