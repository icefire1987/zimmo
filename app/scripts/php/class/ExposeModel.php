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
    function getExposeAll(){
        $prep_stmt = "SELECT id FROM objects ";
        $stmt =  $this->db->mysqli->prepare($prep_stmt);
        if ($stmt) {
            $stmt->execute();
            $stmt->store_result();

            if ($stmt->num_rows > 1) {
                // get variables from result.
                $stmt->bind_result($id);
                WHILE($stmt->fetch()){
                    $dbData[] = array("id"=>$id);
                }
                $stmt->close();

                return array("code"=>1,"txt"=>json_encode($dbData));
            }else{
                $stmt->close();
                return array("code"=>28,"txt"=>"NoRes Expose::getAll");
            }

        } else {
            $stmt->close();
            return array("code"=>29,"txt"=>"DB-Error Expose::getAll");
        }
    }
    function getExpose($data){
        $strasse=$data["strasse"];
        $nummer=$data["nummer"];
        $id=$data["id"];

        $prep_stmt = "SELECT * FROM object WHERE email = ? ";
        $stmt =  $this->db->mysqli->prepare($prep_stmt);

        // check existing email
        if ($stmt) {
            $stmt->bind_param('s', $email);
            $stmt->execute();
            $stmt->store_result();

            if ($stmt->num_rows == 1) {
                // A user with this email address already exists
                $stmt->close();
                return array("code"=>21,"txt"=>"eMail bereits vergeben");
            }else{
                $stmt->close();
            }

        } else {
            $stmt->close();
            return array("code"=>29,"txt"=>"DB-Error Login::mailexist");
        }




    }

}