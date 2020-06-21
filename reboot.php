<?php	
	session_start();
	
	$self = "/reboot.php";
	$action = false;
	
	if (isset($_POST["status"])) {
		$action = "status";
	} else if (isset($_POST["reboot"])) {
		$action = "reboot";
	} else if (isset($_POST["pull"])) {
		$action = "pull";
	}
	
	if ($action) {
		$hash = md5(uniqid(rand(), true)) . '~' . $action;
		$_SESSION["ac"] = $hash;
		
		header("Location: " . $self . "?g=" . $hash);
		die();
		
	} else if (isset($_SESSION["ac"])) {
		
		$g = isset($_GET["g"]) ? $_GET["g"] : false;
		
		if ($_SESSION["ac"] == $g) {
			$action = substr($g, strpos($g, "~") + 1);
		}
		
		unset($_SESSION["ac"]);
		
	} else if (isset($_GET["g"])) {
		header("Location: " . $self);
		die();
	}
?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <title>#UTCTF.pug</title>

        <meta http-equiv="content-type" content="text/html; charset=utf-8"/>
		<meta name="robots" content="noindex, nofollow"/>
		
		<style type="text/css">
		
			body { font-family : Arial;font-size : 12px;padding : 20px;text-align : center; }
			
			div.ctrl { border : 1px solid #d1d1d1;background-color : #ebebeb;padding : 30px;display : inline-block; }
			div.ctrl button { width : 130px;height : 50px;font-size : 16px;padding-left : 45px;text-align : left;display : inline-block; }
			div.ctrl button+button { margin-left : 20px; }
			div.ctrl button.status { background-image : url('ico_status.png');background-repeat : no-repeat;background-position : 10px 50%; }
			div.ctrl button.pull { background-image : url('ico_pull.png');background-repeat : no-repeat;background-position : 10px 50%; }
			div.ctrl button.reboot { background-image : url('ico_restart.png');background-repeat : no-repeat;background-position : 10px 50%; }
			
			pre {  border : 1px solid #c2fcff;background-color : #edfeff;padding : 30px;font-family : Courier new;font-size : 14px;margin : 20px 0 0 0;display : inline-block;text-align : left; }
		
		</style>
	</head>
	<body>
		
		<form method="post" action="<?php echo $self; ?>">
			<div class="ctrl">
				<button type="submit" name="status" class="status">Status</button>
				<button type="submit" name="pull" class="pull" onclick="return confirm('Do you really want git pull from master?')">Pull</button>
				<button type="submit" name="reboot" class="reboot" onclick="return confirm('Are you sure you want to restart the service?')">Reboot</button>
			</div>
		</form>
		
		<?php
			switch ($action) {
				case "status" :
					$cmd = "systemctl status discord_bot.service 2>&1";

					$out = trim(shell_exec($cmd));
					echo '<pre>' . $out . '</pre>';
					break;

				case "pull" :
					$cmd = "git pull origin master 2>&1";

					$out = trim(shell_exec($cmd));
					echo '<pre>' . $out . '</pre>';
					break;

				case "reboot" :
					$cmd = "sudo systemctl restart discord_bot.service 2>&1";
					
					$out = trim(shell_exec($cmd));
					
					if (empty($out)) {
						$out = "Successfully rebooted (check `status` for uptime)";
					}
					
					echo '<pre>' . $out . '</pre>';
					break;
			}
		?>
		
	</body>
</html>