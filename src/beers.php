<?php
// relays GET and POST requests to this remote URL
#$remote_url = 'http://localhost:8888/si664/chatroom/api.php';
// $remote_url = 'http://fractoo.com/si664/chatroom/api.php';
// $host = "/homes/49/jc192699/public_html/dbase/";


$database = "/js/apps/beervis.db";
$pdo = new PDO("sqlite:".$database);

// Configure the "order by" rule. Default: sort by review_counts
$orderby = (isset($_GET['orderby'])) ? $_GET['orderby'] : "review_counts";

/* All fields are provided */
if (isset($_GET['style']) && isset($_GET['style_lvl']) && isset($_GET['state'])) {

	$style_lvl = 'style_lvl'.$_GET['style_lvl'];
	$style 	   = $_GET['style'];
	$state	   = $_GET['state'];

	$stmt = $pdo->prepare('SELECT name, abv, appearance, aroma, palate, taste, overall
						   FROM beers
						   WHERE state = :state AND '.$style_lvl.' = :style 
						   ORDER BY '.$orderby.' DESC LIMIT 10');
	$stmt->execute(
		array(
	   		':style' => $_GET['style'],
	   		':state' => $_GET['state']
	   		)
	);

	$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

	if ($_SERVER['REQUEST_METHOD'] == 'GET') {
		echo json_encode($results);
	}

} 

/* Only state is provided */
else if (isset($_GET['state'])) {

	$state	   = $_GET['state'];

	$stmt = $pdo->prepare('SELECT name, abv, appearance, aroma, palate, taste, overall
						   FROM beers
						   WHERE state = :state ORDER BY '.$orderby.' DESC LIMIT 10');
	$stmt->execute(
		array(
	   		':state' => $_GET['state']
	   		)
	);
	
	$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

	if ($_SERVER['REQUEST_METHOD'] == 'GET') {
		echo json_encode($results);
	}
}

/* Only style is provided */
else if (isset($_GET['style']) && isset($_GET['style_lvl'])) {
	
	$style_lvl = 'style_lvl'.$_GET['style_lvl'];
	$style 	   = $_GET['style'];

	$stmt = $pdo->prepare('SELECT name, abv, appearance, aroma, palate, taste, overall
						   FROM beers
						   WHERE '.$style_lvl.' = :style 
						   ORDER BY '.$orderby.' DESC LIMIT 10');
	$stmt->execute(
		array(
	   		':style' => $_GET['style']
	   		)
	);
	
	$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

	if ($_SERVER['REQUEST_METHOD'] == 'GET') {
		echo json_encode($results);
	}
}

/* Nothing is provided */
else {

	$stmt = $pdo->prepare('SELECT name, abv, appearance, aroma, palate, taste, overall
						   FROM beers
						   ORDER BY '.$orderby.' DESC LIMIT 10');
	$stmt->execute();
	
	$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

	if ($_SERVER['REQUEST_METHOD'] == 'GET') {
		echo json_encode($results);
	}
}


