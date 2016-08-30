<?php

/**
 * Created by PhpStorm.
 * User: cjurthe
 * Date: 28.06.2016
 * Time: 09:42
 */
class myDB{

    function __construct(){
        /*
        define("HOST", "localhost");
        define("USER", "root");
        define("PASSWORD", "");
        define("DATABASE", "immo");
*/

        define("HOST", "localhost");     // The host you want to connect to.
        define("USER", "db11206237-ex");    // The database username.
        define("PASSWORD", "zuumeo001");    // The database password.
        define("DATABASE", "db11206237-expose");    // The database name.

        define("CAN_REGISTER", "any");
        define("DEFAULT_ROLE", "member");
        define("SECURE", true);

        $this->mysqli = new mysqli(HOST, USER, PASSWORD, DATABASE);
        if ($this->mysqli->connect_error) {
            die('Connect Error (' . $this->mysqli->connect_errno . ') '. $this->mysqli->connect_error);
        }
        $this->mysqli->query("SET NAMES UTF8");

    }
    /**
     * @return mysqli the database connection handler
     */
    function connect(){
        return  $this->mysqli;
    }
    
    
    

    

    

    /*
    
    

    
    */
}