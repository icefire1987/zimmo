<?php

/**
 * Created by PhpStorm.
 * User: cjurthe
 * Date: 28.06.2016
 * Time: 09:42
 */
class ExposeModel{
    /**
     * @param mysqli $dbCLassObj
     */
    function __construct($dbCLassObj){
        $this->db = $dbCLassObj;
        $this->basepath = "../../";
    }
    function getExpose($search=false){
        $user = $_SESSION["userid"];

        if($search!==false){
            // Such-Parameter übergeben
            $addWhere="";
            // 1. fester Parameter: userid
            $bindParamTyp[] = 'i';
            $bindParam[]=$user;

            foreach($search as $key=>$value){
                if($value==false){
                    continue;
                }
                switch($key) {
                    case "nummer":
                        $addWhere.= " AND objects.go LIKE ? ";
                        $bindParamTyp[]="s";
                        $bindParam[]="%".$value."%";
                        break;
                    case "strasse":
                        $addWhere.= " AND objects.strasse LIKE ? ";
                        $bindParamTyp[]="s";
                        $bindParam[]="%".$value."%";
                        break;
                    case "id":
                        $addWhere.= " AND objects.id = ? ";
                        $bindParamTyp[]="i";
                        $bindParam[]=$value;
                        break;
                }
            }

            $a_params = array();
            $param_type = '';
            $n = count($bindParamTyp);
            for($i = 0; $i < $n; $i++) {
                $param_type .= $bindParamTyp[$i];
            }

            /* with call_user_func_array, array params must be passed by reference */
            $a_params[] = & $param_type;
            for($i = 0; $i < $n; $i++) {
                /* with call_user_func_array, array params must be passed by reference */
                $a_params[] = & $bindParam[$i];
            }

            $prep_stmt = "
                SELECT 
                  objects.id,go,strasse,hausnummer,plz,ort,
                  CASE geschaeftsart WHEN 1 THEN 'Kauf' WHEN 2 THEN 'Miete' END as 'geschaeftsart',
                  CASE objekttyp WHEN 1 THEN 'Haus' WHEN 2 THEN 'Wohnung' WHEN 3 THEN 'Grundstück' END as 'objektart',
                  zimmer,wohnflaeche
                FROM objects
                LEFT JOIN members ON objects.userID = members.id
                LEFT JOIN members as me ON me.id = ?
                WHERE members.teamID = me.teamID AND (members.roleID < me.roleID OR members.id = me.id)
                
               ".$addWhere;
            $stmt =  $this->db->mysqli->prepare($prep_stmt);
            if ($stmt) {
                /* use call_user_func_array, as $stmt->bind_param('s', $param); does not accept params array */
                call_user_func_array(array($stmt, 'bind_param'), $a_params);
            }
        }else{
            // ALL
            $prep_stmt = "
                SELECT 
                  objects.id,go,strasse,hausnummer,plz,ort,
                  CASE geschaeftsart WHEN 1 THEN 'Kauf' WHEN 2 THEN 'Miete' END as 'geschaeftsart',
                  CASE objekttyp WHEN 1 THEN 'Haus' WHEN 2 THEN 'Wohnung' WHEN 3 THEN 'Grundstück' END as 'objektart',
                  zimmer,wohnflaeche
                FROM objects
                LEFT JOIN members ON objects.userID = members.id
                LEFT JOIN members as me ON me.id = ?
                WHERE members.teamID = me.teamID AND (members.roleID < me.roleID OR members.id = me.id)
               ";
            $stmt =  $this->db->mysqli->prepare($prep_stmt);
            if ($stmt) {
                $stmt->bind_param('i', $user);
            }
        }



        if ($stmt) {
            $stmt->execute();
            $stmt->store_result();

            if ($stmt->num_rows > 0) {
                // get variables from result.
                $stmt->bind_result($id, $go, $strasse, $hausnr, $plz, $ort, $ga, $oa,$zimmer,$wohnflaeche);
                WHILE ($stmt->fetch()) {
                    $dbData[] = array(
                        "id" => $id,
                        "go" => $go,
                        "strasse" => $strasse . " " . $hausnr,
                        "plz" => $plz,
                        "ort" => $ort,
                        "ga" => $ga,
                        "oa" => $oa,
                        "zimmer"=>$zimmer,
                        "wohnflaeche"=>$wohnflaeche
                    );
                }
                $stmt->close();

                return $dbData;
            }else if ($stmt->num_rows == 0) {
                $stmt->close();
                return null;
            }else{
                $stmt->close();
                return array("code"=>28,"txt"=>"NoRes Expose::getAll");
            }

        } else {
            print_r($this->db->mysqli->error);
            return array("code"=>29,"txt"=>"DB-Error Expose::getAll");
        }
    }
    function deleteExpose($data){
        $user = $_SESSION["userid"];
        $exposeID = $data["id"];
        $prep_stmt = "
                DELETE objects
                FROM objects
                LEFT JOIN members ON objects.userID = members.id
                LEFT JOIN members as me ON me.id = ?
                WHERE members.teamID = me.teamID AND (members.roleID < me.roleID OR members.id = me.id)
                AND objects.id = ?
               ";
        $stmt =  $this->db->mysqli->prepare($prep_stmt);
        if ($stmt) {
            $stmt->bind_param('ii', $user,$exposeID);
            if ($stmt) {
                $stmt->execute();
                if($this->db->mysqli->affected_rows>0){
                    return array("txt"=>"Delete successfull");
                }else{
                    return array("code"=>29,"txt"=>"NoRes Expose::deleteExecute.User:".$user."#Expo:".$exposeID);
                }

            }else {
                return array("code"=>29,"txt"=>"DB-Error Expose::deleteExecute");
            }
        }else{
            return array("code"=>29,"txt"=>"DB-Error Expose::delete".$this->db->mysqli->error);
        }
    }

    function getExposedata($data){
        $user = $_SESSION["userid"];
        $exposeID = $data["id"];

        $prep_stmt = "
            SELECT 
              objects.*,
              tab_geschaeftsart.name as ga
            FROM objects
            LEFT JOIN members ON objects.userID = members.id
            LEFT JOIN members as me ON me.id = ?  
            LEFT JOIN tab_geschaeftsart ON tab_geschaeftsart.id = objects.geschaeftsart
            WHERE members.teamID = me.teamID AND (members.roleID < me.roleID OR members.id = me.id)
            AND objects.id = ?
           ";

        $stmt =  $this->db->mysqli->prepare($prep_stmt);
        if ($stmt) {
            $stmt->bind_param('ii', $user,$exposeID);

            $stmt->execute();
            $result = $stmt->get_result();
            $dbData = $result->fetch_array(MYSQLI_ASSOC);
            $stmt->close();

            return $dbData;
        } else {
            print_r($this->db->mysqli->error);
            return array("code"=>29,"txt"=>"DB-Error Expose::getAll");
        }
    }
    function getExposeImages($data){
        $user = $_SESSION["userid"];
        $exposeID = $data["id"];

        $prep_stmt = "
            SELECT 
              images.*
            FROM objects
            LEFT JOIN images ON images.objectID = objects.id
            LEFT JOIN members ON objects.userID = members.id
            LEFT JOIN members as me ON me.id = ?            
            WHERE members.teamID = me.teamID AND (members.roleID < me.roleID OR members.id = me.id)
            AND objects.id = ?
            ORDER BY sort
           ";

        $stmt =  $this->db->mysqli->prepare($prep_stmt);
        if ($stmt) {
            $stmt->bind_param('ii', $user,$exposeID);

            $stmt->execute();
            $result = $stmt->get_result();
            //$dbData = new StdClass();
            WHILE($row = $result->fetch_array(MYSQLI_ASSOC)){
                if($result->num_rows>0 && $row["imageTyp"]!=null){
                    switch($row["imageTyp"]){
                        case 1:
                            $imageTyp = "object";
                            $kat = "Titelbild";
                            break;
                        case 2:
                            $imageTyp = "object";
                            $kat = "Objektbild";
                            break;
                        case 3:
                            $imageTyp = "grundriss";
                            break;
                        case 4:
                            $imageTyp = "energieausweis";
                            break;
                    }
                    $base64Data = $row["imagePath"];
                    $tempArr = array(
                        "title"=>$row["title"],
                        "imgString"=>$base64Data,
                        "imageTag"=>$row["imageTag"]
                    );
                    if(isset($kat)){
                        //DROPDOWN
                        $tempArr["kat"] = array(
                            "type"=>"select",
                            "name"=>"Service",
                            "value"=>$kat,
                            "values"=>array("Titelbild", "Objektbild")
                        );
                    }
                    $dbData[$imageTyp][] = $tempArr;
                }

            }
            $stmt->close();
            if(isset($dbData)) {
                return $dbData;
            }
        } else {
            print_r($this->db->mysqli->error);
            return array("code"=>29,"txt"=>"DB-Error Expose::getAll");
        }
    }


    function setExposedata($data,$update=false){
       // What is needed:
        $data["userID"] = $_SESSION["userid"];
       $neededKeys = ["geschaeftsart","objekttyp","strasse","ort"];
       $possibleKeys = [
           "id","geschaeftsart","strasse","hausnummer","plz","ort","bezirk","land","go",
           "lieferung","bezugsfrei","moebliert","saniert","renoviert","objekttyp","lageHaus","lageStockwerk",
           "stockwerke","stockwerk","haustyp","baujahr","sanierung","renovierung","besonderheit",
           "exposetitel","provision","provisionEinheit","kaution","kautionEinheit","kaltmiete",
           "pauschalmiete","nebenkosten","kaufpreis","stellplatz","stellplatztyp","stellplatzkosten",
           "wohnflaeche","grundstueckflaeche","zimmer","schlafzimmer","balkon","terrasse",
           "aussenflaeche_balkon","aussenflaeche_terrasse","decke","wcgast","badezimmer","badtyp",
           "badbesonderheit","heizung","boden","kueche","kuechenausstattung","innenausstattung",
           "energiewert","energieausweisTyp","denkmalschutz","zustand","lage","lagebeschreibung",
           "objektbeschreibung","sonstiges","updatedatum","userID","map","kuechenmarke","nutzflaeche","lageplan","showLageplan"
            ];
       foreach($neededKeys as $k=>$v){
           if(!array_key_exists($v,$data)){
               return array("code"=>29,"txt"=>$v.": Missing Key Expose::set");
           }
       }

        // INSERT INTO objects ( $colanmes ) VALUES ( $values )
        $colnames = "";

        $value_array = array();
        $param_array = array();
        $param_type = '';
        $questionmarks = "";
        //  get VarTyp and colnames AND set empty fields to null
        foreach($possibleKeys as $pk){
            if(!isset($data[$pk])){
                $data[$pk] = null;
            }
            $vartyp = gettype($data[$pk]);
            $colnames .= $pk.',';
            $questionmarks .= '?,';

            switch($vartyp){
                case 'integer':
                    $param_type .= 'i';
                    $value_array[] = htmlspecialchars($data[$pk], ENT_NOQUOTES);
                    break;
                case 'double':
                    $param_type .= 'd';
                    $value_array[] = htmlspecialchars($data[$pk], ENT_NOQUOTES);
                    break;
                case 'array':
                case 'object':
                    $param_type .= 's';
                    $value_array[] = htmlspecialchars(json_encode($data[$pk],JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_NUMERIC_CHECK), ENT_NOQUOTES);
                    break;
                default:
                    $param_type .= 's';
                    $value_array[] = htmlspecialchars($data[$pk], ENT_NOQUOTES);
                    break;
            }
        }

        $param_array[] = &$param_type;
        // set value for each field
        foreach($value_array as $k=>$v){
            $param_array[] = &$value_array[$k];
        }

        $colnames = rtrim($colnames, ",");
        $questionmarks = rtrim($questionmarks, ",");

        if($update==false){
            if (!($stmt = $this->db->mysqli->prepare("INSERT INTO objects($colnames) VALUES ($questionmarks)"))){
                echo "Prepare failed: (" . $this->db->mysqli->errno . ") " . $this->db->mysqli->error;
            }
        }else{
            // REPLACE INTO ... ?!
            if (!($stmt = $this->db->mysqli->prepare("REPLACE INTO objects($colnames) VALUES ($questionmarks)"))){
                echo "Prepare failed: (" . $this->db->mysqli->errno . ") " . $this->db->mysqli->error;
            }
        }


        if (!call_user_func_array(array($stmt, 'bind_param'), $param_array)) {
            echo "Binding parameters failed: (" . $stmt->errno . ") " . $stmt->error;
        }

        if (!$stmt->execute()) {
            echo "Execute failed: (" . $stmt->errno . ") " . $stmt->error;
        }
        return array("returnID"=>$this->db->mysqli->insert_id);
    }

    function setImageInDB($data){
        if (!($stmt = $this->db->mysqli->prepare("REPLACE INTO images(objectID,imagePath,imageTyp,sort,title,imageTag) VALUES (?,?,?,?,?,?)"))){
            echo "Prepare failed: (" . $this->db->mysqli->errno . ") " . $this->db->mysqli->error;
        }
        $insertData  = array(
            "exposeID"=>$data["exposeID"],
            "imagePath"=>$data["imagePath"],
            "imageTyp"=>$data["imageTyp"],
            "sort"=>$data["sort"],
            "imageTitle"=>$data["imageTitle"],
            "imageTag"=>$data["imageTag"]

        );
        if (!$stmt->bind_param('isiisi',$insertData["exposeID"],$insertData["imagePath"],$insertData["imageTyp"],$insertData["sort"],$insertData["imageTitle"],$insertData["imageTag"])) {
            echo "Binding parameters failed: (" . $stmt->errno . ") " . $stmt->error;
        }

        if (!$stmt->execute()) {
            echo "Execute failed: (" . $stmt->errno . ") " . $stmt->error;
        }
        return array("returnID"=>$this->db->mysqli->insert_id);
    }
    function removeImageInDB($data){
        if (!($stmt = $this->db->mysqli->prepare("DELETE FROM images WHERE imagePath=?"))){
            echo "Prepare failed: (" . $this->db->mysqli->errno . ") " . $this->db->mysqli->error;
        }

        if (!$stmt->bind_param('s',$data)) {
            echo "Binding parameters failed: (" . $stmt->errno . ") " . $stmt->error;
        }

        if (!$stmt->execute()) {
            echo "Execute failed: (" . $stmt->errno . ") " . $stmt->error;
        }

    }
    function delete_unused_files($files_used,$path){
        $files_removed=array();
        try{
            $iterator = new DirectoryIterator($path);
            foreach ( $iterator as $fileinfo ) {
                if($fileinfo->isDot())continue;

                if($fileinfo->isDir()){
                    if($this->is_dir_empty($fileinfo->getPathname())){

                        @rmdir($fileinfo->getPathname());
                    }else{
                        $this->delete_unused_files($files_used,$fileinfo->getPathname());
                    }
                }

                if($fileinfo->isFile()){
                    $filename = $fileinfo->getFilename();
                    if(!in_array($filename,$files_used)){
                        $files_removed[]= $filename;
                        @unlink($fileinfo->getPathname());
                    }
                }
            }
        } catch ( Exception $e ){
            print_r($e);
            return false;
        }
        return $files_removed;

    }

    function getPresets($data){
        if(!isset($_SESSION["userid"])){
            return array("code"=>4,"txt"=>"no login");
        }
        $user = $_SESSION["userid"];
        $type = $data["type"];

        $prep_stmt = "
            SELECT 
              tab_presets.*             
            FROM tab_presets
            LEFT JOIN members ON tab_presets.teamID = members.teamID                     
            WHERE members.id = ? AND type = ?
           ";

        $stmt =  $this->db->mysqli->prepare($prep_stmt);
        if ($stmt) {
            $stmt->bind_param('is', $user,$type);
            $stmt->execute();
            $stmt->store_result();
            if ($stmt->num_rows > 0) {
                // get variables from result.
                $stmt->bind_result($id,$teamID,$type,$title,$text);
                WHILE ($stmt->fetch()) {
                    $dbData[] = array(
                        "id" => $id,
                        "teamID" => $teamID,
                        "type" => $type,
                        "title" => $title,
                        "text" => $text
                    );
                }
                $stmt->close();
                return array("code"=>1,"txt"=>json_encode($dbData));
            }else if ($stmt->num_rows == 0) {
                $stmt->close();
                return array("code"=>1,"txt"=>null);
            }else{
                $stmt->close();
                return array("code"=>28,"txt"=>"NoRes Expose::getAll");
            }
            return array("code"=>1,"txt"=>json_encode($dbData));
        } else {
            print_r($this->db->mysqli->error);
            return array("code"=>29,"txt"=>"DB-Error Expose::getAll");
        }
    }

    function insertPresets($data){
        if (!($stmt = $this->db->mysqli->prepare("REPLACE INTO tab_presets(teamID,type,title,text) VALUES (?,?,?,?)"))){
            echo "Prepare failed: (" . $this->db->mysqli->errno . ") " . $this->db->mysqli->error;
        }

        $insertData  = array(
            "teamID"=>$data["user"]["team"]["id"],
            "type"=>$data["presetType"],
            "title"=>$data["title"],
            "text"=>$data["text"]
        );

        if (!$stmt->bind_param('isss',$insertData["teamID"],$insertData["type"],$insertData["title"],$insertData["text"])) {
            echo "Binding parameters failed: (" . $stmt->errno . ") " . $stmt->error;
        }

        if (!$stmt->execute()) {
            echo "Execute failed: (" . $stmt->errno . ") " . $stmt->error;
        }
        return array("returnID"=>$this->db->mysqli->insert_id);
    }
    function updatePresets($data){
        if (!($stmt = $this->db->mysqli->prepare("REPLACE INTO tab_presets(id,title,text) VALUES (?,?,?)"))){
            echo "Prepare failed: (" . $this->db->mysqli->errno . ") " . $this->db->mysqli->error;
        }

        $insertData  = array(
            "id"=>$data["id"],
            "title"=>$data["title"],
            "text"=>$data["text"]
        );

        if (!$stmt->bind_param('iss',$insertData["id"],$insertData["title"],$insertData["text"])) {
            echo "Binding parameters failed: (" . $stmt->errno . ") " . $stmt->error;
        }

        if (!$stmt->execute()) {
            echo "Execute failed: (" . $stmt->errno . ") " . $stmt->error;
        }
        return array("returnID"=>$this->db->mysqli->insert_id);
    }
    function deletePresets($data){
        if (!($stmt = $this->db->mysqli->prepare("DELETE FROM tab_presets WHERE id=?"))){
            echo "Prepare failed: (" . $this->db->mysqli->errno . ") " . $this->db->mysqli->error;
        }

        $insertData  = array(
            "id"=>$data["id"]
        );

        if (!$stmt->bind_param('i',$insertData["id"])) {
            echo "Binding parameters failed: (" . $stmt->errno . ") " . $stmt->error;
        }

        if (!$stmt->execute()) {
            echo "Execute failed: (" . $stmt->errno . ") " . $stmt->error;
        }
        return array("returnID"=>$this->db->mysqli->insert_id);
    }
}