<?php
# Load external functions php file
include_once './php/functions.php';
# Get all lab.ini files in any subdirectories
$demoConfigFiles = list_files(".", '/lab.json/');
# Load all valid lab.ini file configurations into an array
$demos = array();
foreach ($demoConfigFiles as $key => $value) {
	$config = json_decode(file_get_contents($value), true);
	if (array_keys_exist($config, array('name', 'url', 'description'))) {
		$prefix = substr($value, 0, -8);
		$config['url'] = $prefix . $config['url'];
		$config['id'] = substr($prefix, 8, -1);
		$config['files'] = array();
		if (array_key_exists('sources', $config)) {
			foreach ($config['sources'] as $type => $paths) {
				$config['files'][$type] = [];
				foreach ((array)$paths as $path) {
					$prefixed_path = $prefix . $path;
					$config['files'][$type][$path] = file_get_contents($prefixed_path);
				}
			}
		}
		$demos[] = $config;
	}
}
usort($demos, function($o1, $o2) {
	return strcmp($o1['name'], $o2['name']);
});
# END OF PHP HEADER
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
	<head>
		<title>Labs - AlexWendland.com</title>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<link rel="stylesheet" href="main.css">
		<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/8.4/styles/pojoaque.min.css">
		<script src="//cdnjs.cloudflare.com/ajax/libs/highlight.js/8.4/highlight.min.js"></script>
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
			<div id="source-view">
				<div id="top-pad"></div>
				<pre id="source"><code class="hljs"></code></pre>
				<a id="source-name" target="_blank"></a>
			</div>
			<div id="iframe"></div>
			<ul id="source-tabs" class="hide"></ul>
			<div id="actions">
				<button id="reload-button" class="svg"><svg xmlns="http://www.w3.org/2000/svg" height="16px" version="1.1" viewBox="0 0 16 16" width="16px" xml:space="preserve"><path d="M14 8c-0.609 0-0.898 0.43-1 0.883C12.635 10.516 11.084 13 8 13c-0.757 0-1.473-0.172-2.114-0.474L6.414 12C6.773 11.656 7 11.445 7 11c0-0.523-0.438-1-1-1H3c-0.609 0-1 0.492-1 1v3c0 0.541 0.428 1 1 1 0.484 0 0.688-0.273 1-0.594l0.408-0.407C5.458 14.632 6.685 15 8 15c4.99 0 7-4.75 7-5.938C15 8.336 14.469 8 14 8zM3 7.117C3.365 5.485 4.916 3 8 3c0.757 0 1.473 0.171 2.114 0.473L9.586 4C9.227 4.344 9 4.555 9 5c0 0.523 0.438 1 1 1h3c0.609 0 1-0.492 1-1V2c0-0.541-0.428-1-1-1 -0.484 0-0.688 0.273-1 0.594l-0.408 0.407C10.542 1.368 9.315 1 8 1 3.01 1 1 5.75 1 6.938 1 7.664 1.531 8 2 8 2.609 8 2.898 7.57 3 7.117z"/></svg></button>
				<button id="fullscreen-button" class="svg"><svg xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 -256 1792 1792" version="1.1" width="100%" height="100%"><g transform="matrix(1,0,0,-1,121.49153,1270.2373)"><path d="M1283 995 928 640 1283 285 1427 429q29 31 70 14 39-17 39-59V-64q0-26-19-45-19-19-45-19h-448q-42 0-59 40-17 39 14 69L1123 125 768 480 413 125 557-19q31-30 14-69-17-40-59-40H64q-26 0-45 19-19 19-19 45v448q0 42 40 59 39 17 69-14L253 285 608 640 253 995 109 851Q90 832 64 832 52 832 40 837 0 854 0 896v448q0 26 19 45 19 19 45 19h448q42 0 59-40 17-39-14-69l-144-144 355-355 355 355-144 144q-31 30-14 69 17 40 59 40h448q26 0 45-19 19-19 19-45V896q0-42-39-59-13-5-25-5-26 0-45 19z" fill="currentColor"/></g></svg></button>
				<button id="source-button">Code</button>
			</div>
		</div>
	</body>
	<script>
		<?php
		$demoSources = array();
		foreach ($demos as $key1 => $demo) {
			$demoSources[$demo['id']] = $demo['files'];
		}
		echo "var allSources = " . json_encode($demoSources);
		?>;
		console.log(allSources);
	</script>
</html>