<?php
class AjaxControl{

    function __construct(){
        require_once("class/Db.php");
        require_once("class/Security.php");
        require_once("class/LoginModel.php");
        require_once("class/ExposeModel.php");
        require_once("class/PDFModel.php");

        $this->Security = new Security("zuumeoImmoApp");
        $this->DB = new myDB();
        $this->basepath = "../../";
        $this->uploadpath =   $this->basepath ."uploads/";

    }
    function setHeaders(){
        header("Access-Control-Allow-Credentials: true");
        header("Access-Control-Allow-Origin: http://localhost:9002");
        //header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization");
    }
    function getInput(){
        $inputJSON = file_get_contents('php://input');
        $this->input = json_decode( $inputJSON, TRUE );
    }

    function router(){
        if(isset($this->input) && isset($this->input["action"])){
            if($this->input["action"] != "login" && $this->input["action"] != "checkLogin" && $this->input["action"] != "logout"){
                if($this->checkLogin()==false){
                    echo json_encode(array("type"=>"err","feedbacktext"=>"Nicht eingeloggt","text"=>"Nicht eingeloggt","code"=>4));
                    return false;
                }
            }
            switch ($this->input["action"]){
                case "login":
                    $this->login();
                    break;
                case "checkLogin":
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
                case "userEdit":
                    $this->userEdit();
                    break;
                case "userChangePW":
                    $this->userChangePW();
                    break;
                case "userCheckInvite":
                    $this->userCheckInvite();
                    break;
                case "userJoinTeam":
                    $this->userJoinTeam();
                    break;
                case "getCurrentUser":
                    $this->getCurrentUser();
                    break;
                case "saveFile":
                    $this->saveFile();
                    break;

                case "getPresets":
                    $this->getPresets();
                    break;
                case "setPresets":
                    $this->setPresets();
                    break;


                default:
                    $this->wrongroute($this->input["action"]);
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

    function getCurrentUser(){
        $loginModel = new LoginModel($this->DB);
        $data = [];
        $data["userid"] = $_SESSION["userid"];
        $loginObj = $loginModel->getCurrentUser($data);
        echo json_encode($loginObj);
    }
    function checkLogin(){
        if($this->Security->userLoggedIn()===false){
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

    function userEdit(){
        $loginModel = new LoginModel($this->DB);
        $data = [];
        $data["prename"] = $this->Security->validateInput('string',$this->input["formdata"],'prename');
        $data["lastname"] = $this->Security->validateInput('string',$this->input["formdata"],'lastname');
        $data["userid"] = $_SESSION['userid'];
        $userObj = $loginModel->editUser($data);
        if(isset($userObj["code"]) && $userObj["code"]==1) {
            echo json_encode(array("type" => "success", "feedbacktext" => "Daten erfolgreich gespeichert"));
        }else if(isset($userObj["code"]) && $userObj["code"]!=1){
            echo json_encode(array("type" => "err", "feedbacktext" => $userObj["txt"]));
        }else{
            echo json_encode(array("type" => "err", "feedbacktext" => "Daten konnten nciht gespeichert werden"));
        }
    }
    function userChangePW(){
        $loginModel = new LoginModel($this->DB);
        $data = [];
        $data["old"] = $this->Security->validateInput('string', $this->input["formdata"], 'old');
        $data["new"] = $this->Security->validateInput('string', $this->input["formdata"], 'new');
        $data["new_confirm"] = $this->Security->validateInput('string', $this->input["formdata"], 'new_confirmed');
        if(strlen($data["new"])>7 && $data["new"] === $data["new_confirm"]){
            $data["password"] = password_hash($data["new"],PASSWORD_DEFAULT);
            $data["userid"] = $_SESSION['userid'];
            $userObj = $loginModel->editPassword($data);
            if (isset($userObj["code"]) && $userObj["code"] == 1) {
                echo json_encode(array("type" => "success", "feedbacktext" => "Daten erfolgreich gespeichert"));
            } else if (isset($userObj["code"]) && $userObj["code"] != 1) {
                echo json_encode(array("type" => "err", "feedbacktext" => $userObj["txt"]));
            } else {
                echo json_encode(array("type" => "err", "feedbacktext" => "Daten konnten nciht gespeichert werden"));
            }
        }else{
            echo json_encode(array("type" => "err", "feedbacktext" => "Die Wiederholung des Passworts ist nicht identisch"));
        }
    }

    function userCheckInvite(){
        $loginModel = new LoginModel($this->DB);
        $data = [];
        $data["userid"] = $_SESSION['userid'];
        $userObj = $loginModel->checkInvite($data);
        if (isset($userObj["code"]) && $userObj["code"] == 1) {
            echo json_encode(array("type" => "success", "feedbacktext" => "Daten erfolgreich abgefragt", "txt"=>$userObj["txt"] ));
        } else if (isset($userObj["code"]) && $userObj["code"] != 1) {
            echo json_encode(array("type" => "err", "txt" => $userObj["txt"]));
        } else {
            echo json_encode(array("type" => "err", "feedbacktext" => "Fehlerhafte Rückgabewerte"));
        }
    }

    function userJoinTeam(){
        $loginModel = new LoginModel($this->DB);
        $data = [];
        $data["userid"] = $_SESSION['userid'];
        $data["teamID"] = $this->Security->validateInput('string', $this->input["formdata"], 'teamID');
        $userObj = $loginModel->userJoinTeam($data);
        if (isset($userObj["code"]) && $userObj["code"] == 1) {
            echo json_encode(array("type" => "success", "feedbacktext" => "Team erfolgreich beigetreten"));
        } else if (isset($userObj["code"]) && $userObj["code"] != 1) {
            echo json_encode(array("type" => "err", "feedbacktext" => $userObj["txt"]));
        } else {
            echo json_encode(array("type" => "err", "feedbacktext" => "Fehlerhafte Rückgabewerte"));
        }
    }

    function userCheckInviteCode(){
        $loginModel = new LoginModel($this->DB);
        $data = [];
        $data["code"] = $this->Security->validateInput('string', $this->input["formdata"], 'code');
        $data["userid"] = $_SESSION['userid'];
        if(strlen($data["code"])==7){

            $userObj = $loginModel->checkInvite($data);
            if (isset($userObj["code"]) && $userObj["code"] == 1) {
                echo json_encode(array("type" => "success", "feedbacktext" => "Daten erfolgreich gespeichert"));
            } else if (isset($userObj["code"]) && $userObj["code"] != 1) {
                echo json_encode(array("type" => "err", "feedbacktext" => $userObj["txt"]));
            } else {
                echo json_encode(array("type" => "err", "feedbacktext" => "Fehlerhafte Rückgabewerte"));
            }
        }else{
            echo json_encode(array("type" => "err", "feedbacktext" => "Der Einladungscode hat das falsche Format"));
        }
    }

    function wrongroute($route){
        echo json_encode(array("type"=>"err","text"=>"Fehlerhafter Funktionsaufruf".$route,"code"=>10,"feedbacktext"=>"Serverfehler. Fehlerhafter Funktionsaufruf: AjaxCtrl->".$route));
    }
    function noroute(){
        echo json_encode(array("type"=>"err","text"=>"Route nicht übermittelt","code"=>10,"feedbacktext"=>"Route nicht übermittelt."));
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
            if(isset($data["id"])){
                $obj = $exposeModel->setExposedata($data,true);
            }else{
                $obj = $exposeModel->setExposedata($data);
            }
            if(isset($obj["code"])){
                echo json_encode(array("type" => "err", "text" => "fehlerhafte Abfrage.".$obj["txt"], "code" => $obj["code"]));
            }else{
                $this->uploadpath = $this->uploadpath . $obj["returnID"]."/";

                $images = $data["images"];
                $images_added = array();
                $err = false;
                foreach($images as $imgType=>$imgArray){
                    // imgType : object, grundriss, energieausweis

                    foreach($imgArray as $imgKey=>$imgObj){
                        $dataobj  =false;
                        // new upoloaded image
                        switch($imgType) {
                            case "object":
                                $imageTyp = 2;
                                if (isset($imgObj["kat"]) && isset($imgObj["kat"]["value"])) {
                                    if ($imgObj["kat"]["value"] == "Titelbild") {
                                        $imageTyp = 1;
                                    }
                                }
                                break;
                            case "grundriss":
                                $imageTyp=3;
                                break;
                            case "energieausweis":
                                $imageTyp=4;
                                break;
                            default:
                                $imageTyp=2;
                                break;
                        }

                        if(strpos($imgObj["imgString"],"base64")) {

                            if ( ! is_dir($this->uploadpath)) {
                                mkdir($this->uploadpath);
                            }

                            $encoded_array = explode("base64,", $imgObj["imgString"]);
                            $imgType_Base64Encoded = $encoded_array[0];
                            $imgSource_Base64Encoded = $encoded_array[1];

                            $decodedImgData = base64_decode($imgSource_Base64Encoded);
                            $decodedImgType = explode("data:image/", $imgType_Base64Encoded);
                            /*
                            $f = finfo_open();
                            $mime_type = finfo_buffer($f, $decodedImgData, FILEINFO_MIME_TYPE);
                            $filetype = substr($mime_type,(strpos($mime_type,"image/")));
                            */
                            $filetype = substr($decodedImgType[1], 0, -1);
                            if ($filetype != false) {
                                $filename = $imgType . "_" . $imgKey . "." . $filetype;
                                $filepath = "uploads/".$obj["returnID"] ."/". $filename ;
                                $filepath_global = $this->uploadpath . $filename;

                                if (file_put_contents($filepath_global, $decodedImgData)) {
                                    $dataobj = array(
                                        "exposeID" => $obj["returnID"],
                                        "imagePath" => $filepath,
                                        "imageTitle" => $imgObj["title"],
                                        "imageTyp" => $imageTyp,
                                        "sort" => $imgKey,
                                        "imageTag" => 1
                                    );
                                }else{
                                    echo json_encode(array(
                                        "type" => "err",
                                        "text" => "Datei ".$imgType." wurde nicht gespeichert.",
                                        "code" => 5));
                                    $err = true;

                                }
                            }else{
                                echo json_encode(array(
                                    "type" => "err",
                                    "text" => "Dateityp ".$imgType." wurde nicht erkannt.",
                                    "code" => 5));
                                $err = true;

                            }
                        }else{
                            // image didn't changed
                            $dataobj = array(
                                "exposeID" => $obj["returnID"],
                                "imagePath" => $imgObj["imgString"],
                                "imageTitle" => $imgObj["title"],
                                "imageTyp" => $imageTyp,
                                "sort" => $imgKey,
                                "imageTag" => 1
                            );
                        }

                        if($dataobj!=false) {
                            //only filename
                            $lastslash = substr($dataobj["imagePath"], strrpos($dataobj["imagePath"], '/') + 1);
                            $images_added[] = $lastslash;
                            $exposeModel->setImageInDB($dataobj);
                        }else{
                            echo json_encode(array(
                                "type" => "err",
                                "text" => "Datei ".$imgType." wurde nicht erkannt.",
                                "code" => 5));
                            $err = true;
                        }

                    }
                }
                $images_unused = $exposeModel->delete_unused_files($images_added,$this->uploadpath);
                // returnvalue = filename -> add uploadpath
                foreach($images_unused as $imgPath){
                    $exposeModel->removeImageInDB("uploads/".$obj["returnID"]."/".$imgPath);
                }
                if($err===false) {
                    echo json_encode(array("type" => "success", "feedbacktext" => "Datensatz erfolgreich gespeichert", "code" => 1, "text" => json_encode($obj), "returnID" => $obj["returnID"]));
                }
            }

        }
    }

    function createPDF(){
        if($this->checkLogin()===true) {

            $data = [];
            $data["id"] = $this->Security->validateInput('int', $this->input["formdata"], 'id');
            $raw = $this->getExposeRecord($data["id"]);
            $raw["images"] = $this->getExposeImages($data["id"]);

            foreach( $raw["images"] as $type => $obj ){
                if($type == "object"){
                    foreach($obj as $key=>$imageArr){
                        if($imageArr["kat"]["value"] == "Titelbild"){
                            $raw["images"]["front"][]= $imageArr;
                            array_splice($raw["images"]["object"], $key, 1);
                        }
                    }
                }
            }
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
            $raw["currentExpose"] = $this->getExposeRecord($data["id"]);
            $raw["images"] = $this->getExposeImages($data["id"]);
            echo json_encode(array("type" => "success", "feedbacktext" => "Abfrage erfolgreich", "code" => 1, "text"=>$raw));
        }
    }
    function getExposeRecord($id){
        $exposeModel = new ExposeModel($this->DB);
        return $exposeModel->getExposedata(array("id"=>$id));
    }

    function getExposeImages($id){
        $exposeModel = new ExposeModel($this->DB);
        return $exposeModel->getExposeImages(array("id"=>$id));
    }

    function saveFile(){
        $dataurl = $this->Security->validateInput('string', $this->input["formdata"], 'dataurl');
        $objectID = $this->Security->validateInput('int', $this->input["formdata"], 'objectID');
        list($type, $dataurl) = explode(';', $dataurl);
        list(, $dataurl)      = explode(',', $dataurl);
        $dataurl = str_replace(' ','+',$dataurl);
        $dataurl = base64_decode($dataurl);

        file_put_contents($this->uploadpath.$objectID."/lage.png",$dataurl);
    }

    function getPresets(){
        $model = new ExposeModel($this->DB);
        $presetType = $this->Security->validateInput('string', $this->input["formdata"], 'presetType');

        $data = [];
        $data["type"] = $presetType;


        $userObj = $model->getPresets($data);
        if (isset($userObj["code"]) && $userObj["code"] == 1) {
            echo json_encode(array("type" => "success", "feedbacktext" => "Daten erfolgreich abgefragt","txt"=> $userObj["txt"]));
        } else if (isset($userObj["code"]) && $userObj["code"] != 1) {
            echo json_encode(array("type" => "err", "feedbacktext" => $userObj["txt"]));
        } else {
            echo json_encode(array("type" => "err", "feedbacktext" => "Fehlerhafte Rückgabewerte", "txt"=> $userObj));
        }

    }

    function setPresets(){
        $modelUser = new LoginModel($this->DB);
        $parse = array("userid"=>$_SESSION["userid"]);
        $userCall = $modelUser->getCurrentUser($parse);
        $user = json_decode($userCall["txt"],true);
        $model = new ExposeModel($this->DB);
        $data = [];

        $data["presetType"] = $this->Security->validateInput('string', $this->input["formdata"], 'presetType');
        $data["id"] = $this->Security->validateInput('integer', $this->input["formdata"], 'presetID');
        $data["action"] = $this->Security->validateInput('string', $this->input["formdata"], 'action');
        $data["title"] = $this->Security->validateInput('string', $this->input["formdata"], 'title');
        $data["text"] = $this->Security->validateInput('string', $this->input["formdata"], 'text');

        $data["user"] = $user;
        if(isset($data["id"]) && $data["id"]>0){
            if($data["action"] == "delete"){
                $model->deletePresets($data);
            }
            if($data["action"] == "update"){
                $model->updatePresets($data);
            }
        }else{
            if($data["action"] == "insert"){
                if($model->insertPresets($data)){
                    echo json_encode(array("type" => "success", "feedbacktext" => "Daten erfolgreich gespeichert","txt"=> $data));
                }else{
                    echo json_encode(array("type" => "err", "feedbacktext" => "Fehlerhafte Rückgabewerte", "txt"=> $data));
                }
            }
        }
    }

}

try{
    $ctrl = new AjaxControl();
    $ctrl->setHeaders();
    $ctrl->getInput();
    $ctrl->router();
}catch(EXCEPTION $e){
    echo json_encode(array("type" => "err", "feedbacktext" => "Serverfehler", "code" => 10));
}









?>
