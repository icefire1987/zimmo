<?php

/**
 * Created by PhpStorm.
 * User: cjurthe
 * Date: 28.06.2016
 * Time: 09:42
 */
class LoginModel{
    /**
     * @param mysqli $dbCLassObj
     */
    function __construct($dbCLassObj){
        $this->db = $dbCLassObj;
    }


    function login($data) {
        $input_email = $data["email"];
        $input_password= $data["password"];

        // Using prepared statements means that SQL injection is not possible.
        if ($stmt =  $this->db->mysqli->prepare("SELECT members.id, members.email, passwordhash,prename,lastname,role.name as role
									FROM members
									LEFT JOIN role ON role.id = members.roleID
							       	WHERE email = ?
							        LIMIT 1")) {
            $stmt->bind_param('s', $input_email);  // Bind "$email" to parameter.
            $stmt->execute();    // Execute the prepared query.
            $stmt->store_result();


            if ($stmt->num_rows == 1) {
                // get variables from result.
                $stmt->bind_result($user_id, $user_email, $db_password,$prename,$lastname,$role);
                $stmt->fetch();
                
                // If the user exists we check if the account is locked
                // from too many login attempts

                if ($this->checkbrute($user_id) == true) {
                    // Account is locked
                    // Send an email to user saying their account is locked
                    return array("code"=>3,"txt"=>"Loginsperre");
                } else {
                    // hash the password with the unique salt.

                    // Check if the password in the database matches
                    // the password the user submitted.
                    if (password_verify($input_password, $db_password)) {
                        // Password is correct!
                        // Get the user-agent string of the user.
                        $user_browser = $_SERVER['HTTP_USER_AGENT'];
                        // XSS protection as we might print this value
                        $user_id = preg_replace("/[^0-9]+/", "", $user_id);
                        $_SESSION['userid'] = $user_id;
                        // XSS protection as we might print this value
                        $username = preg_replace("/[^a-zA-Z0-9_\-]+/",
                            "",
                            $user_email);
                        $_SESSION['login_string'] = hash('sha512',
                            $db_password . $user_browser);
                        // Login successful.
                        return array("code"=>1,"txt"=>"Login erfolgreich","data"=>json_encode(array("prename"=>$prename,"lastname"=>$lastname,"role"=>$role)));
                    } else {
                        // Password is not correct
                        // We record this attempt in the database
                        $now = time();
                        $this->db->mysqli->query("INSERT INTO login_attempts(user_id, time)
	        					VALUES ('$user_id', '$now')");
                        return array("code"=>4,"txt"=>"Falsches Passwort");
                    }
                }
            } else {
                // No user exists.
                return array("code"=>5,"txt"=>"Nutzer unbekannt");
            }

        }else{
            return array("code"=>9,"txt"=>"Prepare failed: (" . $this->db->mysqli->errno . ") " . $this->db->mysqli->error);
        }
    }
    function getCurrentUser($data){
        if (!($stmt = $this->db->mysqli->prepare("
            SELECT prename, lastname, teams.name as team,role.name
            
            FROM members 
            LEFT JOIN teams ON teams.id = members.teamID
            LEFT JOIN role ON role.id = members.roleID
            WHERE members.id = ?"))){
            echo "Prepare failed: (" . $this->db->mysqli->errno . ") " . $this->db->mysqli->error;
        }
        $insertData  = array(
            "userid"=>$data["userid"]
        );
        if (!$stmt->bind_param('i',$insertData["userid"])) {
            echo "Binding parameters failed: (" . $stmt->errno . ") " . $stmt->error;
        }

        if (!$stmt->execute()) {
            echo "Execute failed: (" . $stmt->errno . ") " . $stmt->error;
        }else{
            $stmt->store_result();

            if ($stmt->num_rows == 1) {
                // get variables from result.
                $stmt->bind_result($prename, $lastname, $team,$role);
                $stmt->fetch();

                return array("code" => 1, "txt" => json_encode(array("prename" => $prename, "lastname" => $lastname,"team"=>array("name"=>$team),"role"=>$role)));
            }
        }
    }

    function editUser($data){

        if (!($stmt = $this->db->mysqli->prepare("UPDATE members SET prename=?, lastname=? WHERE id=?"))){
            return array("code"=>9,"txt"=>"Prepare failed: (" . $this->db->mysqli->errno . ") " . $this->db->mysqli->error);
        }

        if (!$stmt->bind_param('ssi',$data["prename"],$data["lastname"],$data["userid"])) {
            return array("code"=>9,"txt"=>"Binding parameters failed: (" . $stmt->errno . ") " . $stmt->error);
        }

        if (!$stmt->execute()) {
            return array("code"=>9,"txt"=>"Execute failed: (" . $stmt->errno . ") " . $stmt->error);
        }else{
            return array("code"=>1);
        }

    }

    function editPassword($data){
        if (!($stmt = $this->db->mysqli->prepare("UPDATE members SET passwordhash=? WHERE id=?"))){
            return array("code"=>9,"txt"=>"Prepare failed: (" . $this->db->mysqli->errno . ") " . $this->db->mysqli->error);
        }

        if (!$stmt->bind_param('si',$data["password"],$data["userid"])) {
            return array("code"=>9,"txt"=>"Binding parameters failed: (" . $stmt->errno . ") " . $stmt->error);
        }

        if (!$stmt->execute()) {
            return array("code"=>9,"txt"=>"Execute failed: (" . $stmt->errno . ") " . $stmt->error);
        }else{
            return array("code"=>1);
        }
    }
    function checkbrute($user_id) {
        // Get timestamp of current time
        $now = time();

        // All login attempts are counted from the past 2 hours.
        $valid_attempts = $now - (2 * 60 * 60);

        if ($stmt =  $this->db->mysqli->prepare("SELECT time
				FROM login_attempts
				WHERE user_id = ?
				AND time > ?")) {
            $stmt->bind_param('is', $user_id, $valid_attempts);

            // Execute the prepared query.
            $stmt->execute();
            $stmt->store_result();

            // If there have been more than 5 failed logins
            if ($stmt->num_rows > 5) {
                return true;
            } else {
                return false;
            }
        }
    }
    /*
    function login_check() {
        // Check if all session variables are set
        if (isset($_SESSION['user_id'],
            $_SESSION['username'],
            $_SESSION['login_string'])) {

            $user_id = $_SESSION['user_id'];
            $login_string = $_SESSION['login_string'];
            $username = $_SESSION['username'];

            // Get the user-agent string of the user.
            $user_browser = $_SERVER['HTTP_USER_AGENT'];

            if ($stmt =  $this->db->mysqli->prepare("SELECT password
                                      FROM members
                                      WHERE id = ? LIMIT 1")) {
                // Bind "$user_id" to parameter.
                $stmt->bind_param('i', $user_id);
                $stmt->execute();   // Execute the prepared query.
                $stmt->store_result();

                if ($stmt->num_rows == 1) {
                    // If the user exists get variables from result.
                    $stmt->bind_result($password);
                    $stmt->fetch();
                    $login_check = hash('sha512', $password . $user_browser);

                    if ($login_check == $login_string) {
                        // Logged In!!!!
                        return true;
                    } else {
                        // Not logged in
                        return false;
                    }
                } else {
                    // Not logged in
                    return false;
                }
            } else {
                // Not logged in
                return false;
            }
        } else {
            // Not logged in
            return false;
        }
    }

   */

    function registerUser($data){
        $prename=$data["prename"];
        $lastname=$data["lastname"];
        $email=$data["email"];
        $password=$data["password"];
        $password_hash=password_hash($password,PASSWORD_DEFAULT);




        $prep_stmt = "SELECT id FROM members WHERE email = ? LIMIT 1";
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




        // Insert the new user into the database
        if ($insert_stmt =  $this->db->mysqli->prepare("INSERT INTO members (prename,lastname, email, passwordhash) VALUES (?, ?, ?, ?)")) {
            $insert_stmt->bind_param('ssss', $prename,$lastname, $email, $password_hash);
            // Execute the prepared query.
            if (! $insert_stmt->execute()) {
                return array("code"=>22,"txt"=>"Konnte Nutzer nicht registrieren");
            }else{
                return array("code"=>0,"txt"=>"Done");
            }
        }else{
            return array("code"=>29,"txt"=>"DB-Error Login::insertUser");
        }



    }

    function checkInvite($data){
        $one = 1;
        if ($stmt =  $this->db->mysqli->prepare("
                                    SELECT invites.teamID,teams.name, CONCAT(membersAdmin.prename,' ',membersAdmin.lastname) as admin , invites.send  
									FROM invites
									LEFT JOIN teams ON invites.teamID = teams.id
									LEFT JOIN members as membersAdmin ON teams.adminID = membersAdmin.id
							       	WHERE userID=? AND isOpen = ?
							        LIMIT 1")) {
            $stmt->bind_param('ii', $data["userid"],$one);  // Bind "code" to parameter.
            $stmt->execute();    // Execute the prepared query.
            $stmt->store_result();


            if ($stmt->num_rows == 1) {
                // get variables from result.
                $stmt->bind_result($teamid,$name, $admin, $send);
                $stmt->fetch();

                return array("code"=>1,"txt"=>json_encode(array("team"=>$name,"admin"=>$admin,"send"=>$send,"teamID"=>$teamid)));
            }

        }
    }

    function userJoinTeam($data){

        if (!($stmt = $this->db->mysqli->prepare("UPDATE members SET teamID = ? WHERE id=?"))){
            echo "Prepare failed: (" . $this->db->mysqli->errno . ") " . $this->db->mysqli->error;
        }

        if (!$stmt->bind_param('ii',$data["teamID"],$data["userid"])) {
            echo "Binding parameters failed: (" . $stmt->errno . ") " . $stmt->error;
        }

        if (!$stmt->execute()) {
            echo "Execute failed: (" . $stmt->errno . ") " . $stmt->error;
        }else{
            if (!($stmt = $this->db->mysqli->prepare("UPDATE invites SET isOpen = ?, accepted = NOW() WHERE userID=? AND isOpen = ?"))){
                echo "Prepare failed: (" . $this->db->mysqli->errno . ") " . $this->db->mysqli->error;
            }
            $insertData  = array(
                "userid"=>$data["userid"],
                "one"=>1,
                "zero"=>0
            );
            if (!$stmt->bind_param('iii',$insertData["zero"],$insertData["userid"],$insertData["one"])) {
                echo "Binding parameters failed: (" . $stmt->errno . ") " . $stmt->error;
            }

            if (!$stmt->execute()) {
                echo "Execute failed: (" . $stmt->errno . ") " . $stmt->error;
            }
        }
        return array("code"=>1);
    }

}