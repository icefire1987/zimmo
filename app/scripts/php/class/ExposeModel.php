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
                if($value==""){
                    break;
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
                  CASE objekttyp WHEN 1 THEN 'Grundstück' WHEN 2 THEN 'Haus' WHEN 3 THEN 'Wohnung' END as 'objektart'
                FROM objects
                LEFT JOIN members ON objects.userID = members.id
                LEFT JOIN members as me ON me.id = ?
                WHERE members.departmentID = me.departmentID AND (members.roleID < me.roleID OR members.id = me.id)
                
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
                  CASE objekttyp WHEN 1 THEN 'Grundstück' WHEN 2 THEN 'Haus' WHEN 3 THEN 'Wohnung' END as 'objektart'
                FROM objects
                LEFT JOIN members ON objects.userID = members.id
                LEFT JOIN members as me ON me.id = ?
                WHERE members.departmentID = me.departmentID AND (members.roleID < me.roleID OR members.id = me.id)
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
                $stmt->bind_result($id, $go, $strasse, $hausnr, $plz, $ort, $ga, $oa);
                WHILE ($stmt->fetch()) {
                    $dbData[] = array(
                        "id" => $id,
                        "go" => $go,
                        "strasse" => $strasse . " " . $hausnr,
                        "plz" => $plz,
                        "ort" => $ort,
                        "ga" => $ga,
                        "oa" => $oa
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
                WHERE members.departmentID = me.departmentID AND (members.roleID < me.roleID OR members.id = me.id)
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
              objects.*             
            FROM objects
            LEFT JOIN members ON objects.userID = members.id
            LEFT JOIN members as me ON me.id = ?
            WHERE members.departmentID = me.departmentID AND (members.roleID < me.roleID OR members.id = me.id)
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

    function setExposedata($data){
       // What is needed:

       $neededKeys = ["geschaeftsart","objekttyp","strasse","ort"];
       $possibleKeys = ["geschaeftsart","strasse","hausnummer","plz","ort","bezirk","land","go","lieferung","moebiliert","saniert","renoviert","objekttyp","lageHaus","lageStockwerk","stockwerke","stockwerk","haustyp","baujahr","sanierung","renovierung","besonderheit","exposetitel","provision","provisionEinheit","kaution","kautionEinheit","kaltmiete","pauschalmiete","nebenkosten","kaufpreis","stellplatz","stellplatztyp","stellplatzkosten","wohnflaeche","grundstueckflaeche","zimmer","schlafzimmer","balkon","terrasse","aussenflaeche_balkon","aussenflaeche_terrasse","decke","wcgast","badezimmer","badtyp","badbesonderheit","heizung","boden","kueche","kuechenausstattung","innenausstattung","energiewert","energieausweisTyp","denkmalschutz","zustand","lage","manualTextLage","manualTextAusstattung","manualTextObjekt","updatedatum","userID","map"];
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
        var_dump($param_array);

        if (!($stmt = $this->db->mysqli->prepare("INSERT INTO objects($colnames) VALUES ($questionmarks)"))){
            echo "Prepare failed: (" . $this->db->mysqli->errno . ") " . $this->db->mysqli->error;
        }

        if (!call_user_func_array(array($stmt, 'bind_param'), $param_array)) {
            echo "Binding parameters failed: (" . $stmt->errno . ") " . $stmt->error;
        }

        if (!$stmt->execute()) {
            echo "Execute failed: (" . $stmt->errno . ") " . $stmt->error;
        }

    }
}