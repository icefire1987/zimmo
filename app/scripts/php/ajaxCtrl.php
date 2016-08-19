<?php
class AjaxControl{

    function __construct(){
        require_once("class/Db.php");
        require_once("class/Security.php");
        require_once("class/LoginModel.php");
        require_once("class/ExposeModel.php");
        require_once("class/PDFModel.php");

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
                // TOOL
                case "exposeSearchAll":
                    $this->exposeSearch();
                    break;
                case "exposeSearchOne":
                    $this->exposeSearch(true);
                    break;
                case "exposeDelete":
                    $this->exposeDelete();
                    break;
                case "createPDF":
                    $this->createPDF();
                    break;
                case "echoRecord":
                    $this->echoRecord();
                    break;
                case "exposeInsert":
                    $this->exposeInsert();
                    break;
                case "logout":
                    $this->logout();
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
        $_SESSION["userid"]=2;
        return true;
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
        echo json_encode(array("type"=>"err","text"=>"Route nicht übermittelt","code"=>10));
    }

    function exposeSearch($parse=false){
        //var_dump($_SESSION);
        if($this->checkLogin()===true){
            $exposeModel = new ExposeModel($this->DB);
            $data = [];
            if($parse!==false) {
                $data["nummer"] = $this->Security->validateInput('string', $this->input["formdata"], 'nummer');
                $data["strasse"] = $this->Security->validateInput('string', $this->input["formdata"], 'strasse');
                $data["id"] = $this->Security->validateInput('int', $this->input["formdata"], 'id');

                if ($data["nummer"] === false && $data["strasse"] === false && $data["id"] === false) {
                    echo json_encode(array("type" => "err", "text" => "Bitte einen Suchwert eingeben", "code" => 91));
                    return false;
                    /*
                    if ($data["nummer"] === false) {
                        echo json_encode(array("type" => "err", "text" => "fehlerhafte Eingabe: nummer", "code" => 91));
                        return false;
                    } else if ($data["strasse"] === false) {
                        echo json_encode(array("type" => "err", "text" => "fehlerhafte Eingabe: strasse", "code" => 92));
                        return false;
                    } else if ($data["id"] === false) {
                        echo json_encode(array("type" => "err", "text" => "fehlerhafte Eingabe: id", "code" => 93));
                        return false;
                    }
                    */
                } else {
                    $obj = $exposeModel->getExpose($data);
                    if(isset($obj["code"])){
                        echo json_encode(array("type" => "err", "text" => "fehlerhafte Abfrage", "code" => $obj["code"]));
                    }else{
                        echo json_encode(array("type" => "success", "feedbacktext" => "Abfrage erfolgreich", "code" => 1, "text"=>json_encode($obj)));
                    }

                }
            }else{
                $obj = $exposeModel->getExpose();
                if(isset($obj["code"])){
                    echo json_encode(array("type" => "err", "text" => "fehlerhafte Abfrage", "code" => $obj["code"]));
                }else{
                    echo json_encode(array("type" => "success", "feedbacktext" => "Abfrage erfolgreich", "code" => 1, "text"=>json_encode($obj)));
                }
            }
        }
    }

    function logout(){
        session_destroy();
        session_unset();
        if (isset($_SERVER['HTTP_COOKIE'])) {
            $cookies = explode(';', $_SERVER['HTTP_COOKIE']);
            foreach($cookies as $cookie) {
                $parts = explode('=', $cookie);
                $name = trim($parts[0]);
                setcookie($name, '', time()-1000);
                setcookie($name, '', time()-1000, '/');
            }
        }
        echo json_encode(array("type" => "success", "text" => "Logout", "code" => 1));
    }
    function exposeDelete(){
        if($this->checkLogin()===true){
            $exposeModel = new ExposeModel($this->DB);
            $data = [];
            $data["id"] = $this->Security->validateInput('int', $this->input["formdata"], 'id');

            $obj = $exposeModel->deleteExpose($data);

            if(isset($obj["code"])){
                echo json_encode(array("type" => "err", "text" => "fehlerhafte Abfrage.".$obj["txt"], "code" => $obj["code"]));
            }else{
                echo json_encode(array("type" => "success", "feedbacktext" => "Löschen erfolgreich", "code" => 1, "text"=>json_encode($obj)));
            }

        }
    }
    function exposeInsert(){
        if($this->checkLogin()===true){
            $exposeModel = new ExposeModel($this->DB);

            $data = $this->input["formdata"];

            $obj = $exposeModel->setExposedata($data);

            if(isset($obj["code"])){
                echo json_encode(array("type" => "err", "text" => "fehlerhafte Abfrage.".$obj["txt"], "code" => $obj["code"]));
            }else{
                echo json_encode(array("type" => "success", "feedbacktext" => "Datensatz erfolgreich gespeichert", "code" => 1, "text"=>json_encode($obj),"returnID"=>$obj["returnID"]));
            }

        }
    }

    function createPDF(){
        if($this->checkLogin()===true) {

            $data = [];
            $data["id"] = $this->Security->validateInput('int', $this->input["formdata"], 'id');
            $raw = $this->getExposeRecord($data["id"]);

            $pdfmodel = new PDFModel($this->DB);

            $obj = $pdfmodel->createPDF($raw);
            if(isset($obj["addData"])){
                echo json_encode(array("type" => "info", "feedbacktext" => "PDF erfolgreich erstellt", "code" => 1, "text"=>$obj, "addData"=>$obj["addData"]));
            }else{
                echo json_encode(array("type" => "err", "text" => "fehlerhafte Abfrage.".$obj["txt"], "code" => $obj["code"]));
            }


        }
    }
    function echoRecord(){
        if($this->checkLogin()===true) {
            $data = [];
            $data["id"] = $this->Security->validateInput('int', $this->input["formdata"], 'id');
            $raw = $this->getExposeRecord($data["id"]);
            echo json_encode(array("type" => "success", "feedbacktext" => "Abfrage erfolgreich", "code" => 1, "text"=>$raw));
        }
    }
    function getExposeRecord($id){
        $exposeModel = new ExposeModel($this->DB);
        return $exposeModel->getExposedata(array("id"=>$id));
    }
}

$ctrl = new AjaxControl();
$ctrl->setHeaders();
$ctrl->getInput();
$ctrl->router();








?>
