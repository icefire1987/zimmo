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
        $input_username = $data["username"];
        $input_password= $data["password"];

        // Using prepared statements means that SQL injection is not possible.
        if ($stmt =  $this->db->mysqli->prepare("SELECT id, username, password, salt
									FROM members
							       	WHERE email = ?
							        LIMIT 1")) {
            $stmt->bind_param('s', $input_username);  // Bind "$email" to parameter.
            $stmt->execute();    // Execute the prepared query.

            // get variables from result.
            $stmt->bind_result($user_id, $username, $db_password, $salt);
            $stmt->fetch();

            if ($stmt->num_rows == 1) {
                // If the user exists we check if the account is locked
                // from too many login attempts

                if ($this->checkbrute($user_id) == true) {
                    // Account is locked
                    // Send an email to user saying their account is locked
                    return array("code"=>3,"txt"=>"Loginsperre");
                } else {
                    // hash the password with the unique salt.
                    $password = hash('sha512', $input_password . $salt);
                    // Check if the password in the database matches
                    // the password the user submitted.
                    if ($db_password == $password) {
                        // Password is correct!
                        // Get the user-agent string of the user.
                        $user_browser = $_SERVER['HTTP_USER_AGENT'];
                        // XSS protection as we might print this value
                        $user_id = preg_replace("/[^0-9]+/", "", $user_id);
                        $_SESSION['user_id'] = $user_id;
                        // XSS protection as we might print this value
                        $username = preg_replace("/[^a-zA-Z0-9_\-]+/",
                            "",
                            $username);
                        $_SESSION['username'] = $username;
                        $_SESSION['login_string'] = hash('sha512',
                            $password . $user_browser);
                        // Login successful.
                        return 1;
                    } else {
                        // Password is not correct
                        // We record this attempt in the database
                        $now = time();
                        $this->db->mysqli->query("INSERT INTO login_attempts(user_id, time)
	        					VALUES ('$user_id', '$now')");
                        return 4;
                    }
                }
            } else {
                // No user exists.
                return 5;
            }

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

    function login($data) {
        $username = $data["username"];


        // Using prepared statements means that SQL injection is not possible.
        if ($stmt =  $this->db->mysqli->prepare("SELECT id, username, password, salt
									FROM members
							       	WHERE email = ?
							        LIMIT 1")) {
            $stmt->bind_param('s', $username);  // Bind "$email" to parameter.
            $stmt->execute();    // Execute the prepared query.
            $stmt->store_result();

            // get variables from result.
            $stmt->bind_result($user_id, $username, $db_password, $salt);
            $stmt->fetch();

            // hash the password with the unique salt.
            $password = hash('sha512', $password . $salt);
            if ($stmt->num_rows == 1) {
                // If the user exists we check if the account is locked
                // from too many login attempts

                if ($this->checkbrute($user_id) == true) {
                    // Account is locked
                    // Send an email to user saying their account is locked
                    return 3;
                } else {
                    // Check if the password in the database matches
                    // the password the user submitted.
                    if ($db_password == $password) {
                        // Password is correct!
                        // Get the user-agent string of the user.
                        $user_browser = $_SERVER['HTTP_USER_AGENT'];
                        // XSS protection as we might print this value
                        $user_id = preg_replace("/[^0-9]+/", "", $user_id);
                        $_SESSION['user_id'] = $user_id;
                        // XSS protection as we might print this value
                        $username = preg_replace("/[^a-zA-Z0-9_\-]+/",
                            "",
                            $username);
                        $_SESSION['username'] = $username;
                        $_SESSION['login_string'] = hash('sha512',
                            $password . $user_browser);
                        // Login successful.
                        return 1;
                    } else {
                        // Password is not correct
                        // We record this attempt in the database
                        $now = time();
                        $this->db->mysqli->query("INSERT INTO login_attempts(user_id, time)
	        					VALUES ('$user_id', '$now')");
                        return 4;
                    }
                }
            } else {
                // No user exists.
                return 5;
            }
        }
    }

    function registerUser(){
        $error_msg  ="";
        // Sanitize and validate the data passed in
        $username = filter_input(INPUT_POST, 'username', FILTER_SANITIZE_STRING);
        $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
        $email = filter_var($email, FILTER_VALIDATE_EMAIL);
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            // Not a valid email
            $error_msg .= '<p class="error">The email address you entered is not valid</p>';
        }

        $password = filter_input(INPUT_POST, 'p', FILTER_SANITIZE_STRING);
        if (strlen($password) != 128) {
            // The hashed pwd should be 128 characters long.
            // If it's not, something really odd has happened
            $error_msg .= '<p class="error">Invalid password configuration.</p>';
        }

        // Username validity and password validity have been checked client side.
        // This should should be adequate as nobody gains any advantage from
        // breaking these rules.
        //

        $prep_stmt = "SELECT id FROM members WHERE email = ? LIMIT 1";
        $stmt =  $this->db->mysqli->prepare($prep_stmt);

        // check existing email
        if ($stmt) {
            $stmt->bind_param('s', $email);
            $stmt->execute();
            $stmt->store_result();

            if ($stmt->num_rows == 1) {
                // A user with this email address already exists
                $error_msg .= '<p class="error">A user with this email address already exists.</p>';
                $stmt->close();
            }
            $stmt->close();
        } else {
            $error_msg .= '<p class="error">Database error Line 39</p>';
            $stmt->close();
        }

        // check existing username
        $prep_stmt = "SELECT id FROM members WHERE username = ? LIMIT 1";
        $stmt =  $this->db->mysqli->prepare($prep_stmt);

        if ($stmt) {
            $stmt->bind_param('s', $username);
            $stmt->execute();
            $stmt->store_result();

            if ($stmt->num_rows == 1) {
                // A user with this username already exists
                $error_msg .= '<p class="error">A user with this username already exists</p>';
                $stmt->close();
            }
            $stmt->close();
        } else {
            $error_msg .= '<p class="error">Database error line 55</p>';
            $stmt->close();
        }

        // TODO:
        // We'll also have to account for the situation where the user doesn't have
        // rights to do registration, by checking what type of user is attempting to
        // perform the operation.

        if (empty($error_msg)) {
            // Create a random salt
            //$random_salt = hash('sha512', uniqid(openssl_random_pseudo_bytes(16), TRUE)); // Did not work
            $random_salt = hash('sha512', uniqid(mt_rand(1, mt_getrandmax()), true));

            // Create salted password
            $password = hash('sha512', $password . $random_salt);

            // Insert the new user into the database
            if ($insert_stmt =  $this->db->mysqli->prepare("INSERT INTO members (username, email, password, salt) VALUES (?, ?, ?, ?)")) {
                $insert_stmt->bind_param('ssss', $username, $email, $password, $random_salt);
                // Execute the prepared query.
                if (! $insert_stmt->execute()) {
                    header('Location: ../error.php?err=Registration failure: INSERT');
                }
            }
            header('Location: ./register_success.php');
        }
        return $error_msg;
    }
*/
}