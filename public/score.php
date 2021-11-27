<?php

header('Content-Type: application/json; charset=utf-8');
$newScore = json_decode( file_get_contents('php://input') );

if( $newScore->key ) {
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
	
	$gameday = "games/" . date( 'Y-m-d' , time() ) . ".json";
	$games = explode( "\n" , file_get_contents( $gameday ) );
	foreach( $games as $index=>$game ) {
		if( $game === $score->key ) {
			$games[ $index+1 ] = json_encode( $score );
		}
	}
	
	$games = implode( "\n" , $games );
	
	unlink( $gameday );
	file_put_contents( $gameday , $games , FILE_APPEND );

	die( '{}' );
}

function append_game( $key ) {

	$gameday = "games/" . date( 'Y-m-d' , time() ) . ".json";
	file_put_contents( $gameday , $key . "\n\n" , FILE_APPEND );
	
}
function generate_key() {
	
	return uniqid();
	
}