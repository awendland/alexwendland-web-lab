<?php
# Load external functions php file
include_once './php/functions.php';
# Get all lab.ini files in any subdirectories
$demoConfigFiles = list_files(".", '/lab.ini/');
# Load all valid lab.ini file configurations into an array
$demos = array();
foreach ($demoConfigFiles as $key => $value) {
	$config = parse_ini_file($value);
	if (array_keys_exist($config, array('name', 'url', 'description'))) {
		$config['url'] = substr($value, 0, -7) . $config['url'];
		$config['id'] = substr($value, 8, -8);
		$demos[] = $config;
	}
}
# END OF PHP HEADER
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
	<head>
		<title>Labs - AlexWendland.com</title>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<link rel="stylesheet" href="main.css">
		<script type="text/javascript" charset="UTF-8" src="main.js"></script>
	</head>
	<body>
		<div id="top-bar">
			<span id="branding"> <a title="The Lab" href="/">The Lab</a></span>
		</div>
		<div id="side-nav">
			<ul>
				<?php
				foreach ($demos as $demo) {
					echo('<li data-id="' . $demo["id"] . '" data-url="' . $demo['url'] . '"><a href="#' . $demo["id"] . '">' . $demo["name"] . '</a><br><div class="description">' . $demo['description'] . '</div></li>');
				}
				?>
			</ul>
		</div>
		<div id="view">

		</div>
	</body>
</html>