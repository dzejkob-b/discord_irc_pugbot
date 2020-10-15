<?php
    $dir = "logs";
    $list = array();

    if (($hand = opendir($dir)) != false) {
        while (($file = readdir($hand)) != false) {
            $full_path = $dir . "/" . $file;
            
            if (!is_dir($full_path) && $file != "." && $file != "..") {
                $idx = 0;
                
                while ($idx < count($list)) {
                    if (strcmp($file, $list[$idx]['file']) > 0) {
                        break;
                    } else {
                        $idx++;
                    }
                }

                if ($idx == count($list)) {
                    $list[] = array(
                        'file' => $file,
                        'full_path' => $full_path
                    );
                    
                } else {
                    $list = array_merge(
                        array_slice($list, 0, $idx),
                        array(array(
                            'file' => $file,
                            'full_path' => $full_path
                        )),
                        array_slice($list, $idx)
                    );
                }
            }
        }
    }

?><!DOCTYPE html>
<html lang="en">
    <head>
        <title>#UTCTF.pug | logs</title>

        <meta http-equiv="content-type" content="text/html; charset=utf-8"/>
		<meta name="robots" content="noindex, nofollow"/>
		
		<style type="text/css">
		
			body { font-family : Arial;font-size : 12px;padding : 20px; }
            
            ul { padding : 20px 20px 20px 40px;border : 1px solid black;background-color : rgba(230, 230, 230); }

            p { padding : 0 20px 20px 20px;margin : 0; }

            pre {  border : 1px solid #c2fcff;background-color : #edfeff;padding : 30px;font-family : Courier new;font-size : 14px;margin : 20px 0 0 0;display : inline-block;text-align : left; }
		
		</style>
	</head>
	<body>

        <?php
            if (isset($_GET['all']) && $_GET['all'] == 1) {
                echo '<pre>';

                foreach ($list as $c) {
                    echo '<strong>' . $c['file'] . '</strong>' . "\r\n";
                    
                    if ($cnt = file_get_contents($c['full_path'])) {
                        echo $cnt . "\r\n";
                    }
                }

                echo '<pre>';
                
            } else {
                echo '<p><a href="/logs.php?all=1" target="_blank">Show all</a></p>';
                echo '<ul>';

                foreach ($list as $c) {
                    echo '<li><a href="/' . $c['full_path'] . '" target="_blank">' . $c['file'] . '</li></a>';
                }

                echo '</ul>';
            }
        ?>
		
	</body>
</html>
