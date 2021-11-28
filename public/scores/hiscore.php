<?php

/* OMG THIS SERVER IS PHP... AND I DONT HAVE A DB... FORGIVE ME */

include __DIR__ . '/cors.php';

header('Content-Type: application/json; charset=utf-8');

$gameday = "games/" . date( 'Y-N' , time() ) . ".json";
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
}
else {
	$scores = [];
}

die( json_encode( $scores ) );
