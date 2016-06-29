<?php

include("class/Db.php");
include("class/Security.php");
include("class/LoginModel.php");

$inputJSON = file_get_contents('php://input');
$input= json_decode( $inputJSON, TRUE );

$Security = new Security("zuumeoImmoApp_Session");

$db = new myDB();
$loginModel = new LoginModel($db);


if(isset($input) && isset($input["action"]) && $input["action"]=="login"){
var_dump($_SESSION);
    $_SESSION["time"] = "KHJHJH";
    $db = new myDB();
    $loginModel = new LoginModel($db);
    $data = [];
    $data["username"] = $Security->validateInput('string',$input,'username');
    $data["password"] = $Security->validateInput('string',$input,'password');
    $loginObj = $loginModel->login($data);


}


if(isset($input) && isset($input["action"]) && $input["action"]=="check"){
    checkCookie();
}





header("Access-Control-Allow-Credentials: true");

header("Access-Control-Allow-Origin: http://localhost:9002");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization");

?>
