<?php
function list_files($dir = ".", $criteria = '/.*/') {
	if ($dh = opendir($dir)) {
		$files = Array();
		$inner_files = Array();
		while ($file = readdir($dh)) {
			if ($file != "." && $file != ".." && $file[0] != '.') {
				if (is_dir($dir . "/" . $file)) {
					$inner_files = list_files($dir . "/" . $file, $criteria);
					if (is_array($inner_files))
						$files = array_merge($files, $inner_files);
				} else {
					if (preg_match($criteria, $file)) {
						array_push($files, $dir . "/" . $file);
					}
				}
			}
		}

		closedir($dh);
		return $files;
	}
}

function array_keys_exist($array, $keys) {
	$bool = true;
    foreach ($keys as $value) {
        $bool = array_key_exists($value, $array) ? $bool : false;
    }
	return $bool;
}
?>