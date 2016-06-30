<?php
class AjaxControl{

    function __construct(){
        require_once("class/Db.php");
        require_once("class/Security.php");
        require_once("class/LoginModel.php");

        $this->Security = new Security("zuumeoImmoApp_Session");
        $this->DB = new myDB();
    }
    function setHeaders(){
        header("Access-Control-Allow-Credentials: true");
        header("Access-Control-Allow-Origin: http://localhost:9002");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization");
    }
    function getInput(){
        $inputJSON = file_get_contents('php://input');
        $this->input = json_decode( $inputJSON, TRUE );
    }

    function router(){
        if(isset($this->input) && isset($this->input["action"])){
            switch ($this->input["action"]){
                case "login":
                    $this->login();
                    break;
                case "check":
                    $this->checkLogin();
                    break;
                case "register":
                    $this->register();
                    break;
            }

        }else{
            $this->noroute();
        }
    }

    function login(){
        $loginModel = new LoginModel($this->DB);
        $data = [];
        $data["email"] = $this->Security->validateInput('string',$this->input["formdata"],'mailaddress');
        $data["password"] = $this->Security->validateInput('string',$this->input["formdata"],'password');
        $loginObj = $loginModel->login($data);
        echo json_encode($loginObj);
    }

    function checkLogin(){
        if($this->Security->userLoggedIn()===false){
            echo json_encode(array("type"=>"err","text"=>"Nicht eingeloggt","code"=>4));
            return false;
        }else{
            return true;
        }
    }

    function register(){
        $loginModel = new LoginModel($this->DB);
        $data = [];
        $data["prename"] = $this->Security->validateInput('string',$this->input["formdata"],'prename');
        $data["lastname"] = $this->Security->validateInput('string',$this->input["formdata"],'lastname');
        $data["email"] = $this->Security->validateInput('mail',$this->input["formdata"],'mailaddress');
        $data["password"] = $this->Security->validateInput('string',$this->input["formdata"],'password');

        if($data["prename"]===false){
            echo json_encode(array("type"=>"err","text"=>"fehlerhafte Eingabe: Vorname","code"=>91));
            return false;
        }else if($data["lastname"]===false){
            echo json_encode(array("type"=>"err","text"=>"fehlerhafte Eingabe: Nachname","code"=>92));
            return false;
        }else if($data["email"]===false){
            echo json_encode(array("type"=>"err","text"=>"fehlerhafte Eingabe: eMail","code"=>93));
            return false;
        }else if($data["password"]===false){
            echo json_encode(array("type"=>"err","text"=>"fehlerhafte Eingabe: Passwort","code"=>94));
            return false;
        }else{
                $loginObj = $loginModel->registerUser($data);
                echo json_encode($loginObj);
        }
    }

    function noroute(){
        echo json_encode(array("type"=>"err","text"=>"Route nicht vorhanden","code"=>10));
    }
}

$ctrl = new AjaxControl();
$ctrl->setHeaders();
$ctrl->getInput();
$ctrl->router();








?>
