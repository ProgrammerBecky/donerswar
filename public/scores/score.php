<?php
ini_set( 'display_errors' , 1 );
error_reporting( E_ALL );
include __DIR__ . '/cors.php';

header('Content-Type: application/json; charset=utf-8');

$newScore = new \StdClass();
$keys = ['name','discos','ants','buildings','time','key'];
$ints = [false,true,true,true,true,false];
foreach( $keys as $index=>$key ) {
	if( isset( $_POST[$key] ) && $_POST[$key] !== 'undefined' ) {
		if( $ints[ $index ] ) {
			$newScore->{$key} = (int) $_POST[$key];
		}
		else {
			$newScore->{$key} = $_POST[$key];
		}
	}
}

//$newScore = json_decode( file_get_contents('php://input') ); //Farewell JSON input, server settings say no

if( isset( $newScore->key ) && $newScore->key ) {
	storeScore( $newScore );
}
else {
	$output = new \StdClass();
	$output->key = generate_key();
	$games = append_game( $output->key );
	
	die( json_encode( $output ) );
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
	$stream = fopen( $gameday , 'a' );
	fputs( $stream , implode( "\n" , $games ) );
	fclose( $stream );
	
	$output = new \StdClass();
	$output->ranking = ranking( $games , $score->key );


	die( json_encode( $output ) );
}

function append_game( $key ) {

	$gameday = "games/" . date( 'Y-N' , time() ) . ".json";
	$stream = fopen( $gameday , 'a' );
	fputs( $stream , $key . "\n\n" );
	fclose( $stream );
	
	
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
