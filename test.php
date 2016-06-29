<?php

$name="te";
$limit = 0;
$path = '/';
$domain = null;
$secure = null;

session_name($name . '_Session');
// Set SSL level
$https = isset($secure) ? $secure : isset($_SERVER['HTTPS']);

// Set session cookie options
session_set_cookie_params($limit, $path, $domain, $https, true);
session_start();
var_dump($_SESSION);
$_SESSION["time"]=date("Y-m-d H:i:s");
echo 'now:'.date("Y-m-d H:i:s")."\r\n";

if(isset($_SESSION)){
    echo "Session variable exists<br/>";

    if(!isset($_SESSION['test'])){
        $_SESSION['test'] = "Success!";
        echo "Variable has been set, refresh the page and see if stored it properly.";
    }else{
        echo $_SESSION['test'];
    }
}else{
    echo "No session variable has been created.";
}
?>