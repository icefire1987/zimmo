<?php
/**
 * Created by PhpStorm.
 * User: cjurthe
 * Date: 28.06.2016
 * Time: 09:44
 */

class Security{
    function __construct($name){
        $this->sec_session_start($name);
    }

    function esc_url($url) {

        if ('' == $url) {
            return $url;
        }

        $url = preg_replace('|[^a-z0-9-~+_.?#=!&;,/:%@$\|*\'()\\x80-\\xff]|i', '', $url);

        $strip = array('%0d', '%0a', '%0D', '%0A');
        $url = (string) $url;

        $count = 1;
        while ($count) {
            $url = str_replace($strip, '', $url, $count);
        }

        $url = str_replace(';//', '://', $url);

        $url = htmlentities($url);

        $url = str_replace('&amp;', '&#038;', $url);
        $url = str_replace("'", '&#039;', $url);

        if ($url[0] !== '/') {
            // We're only interested in relative links from $_SERVER['PHP_SELF']
            return '';
        } else {
            return $url;
        }
    }
    function  userLoggedIn(){
        return (isset($_SESSION) && isset($_SESSION["userid"]));
    }
    function sec_session_start($name, $limit = 16000, $path = '/', $domain = null, $secure = null){
        $lifetime=7200;
        // Set the cookie name
        session_name($name . '_Session');

        // Set SSL level
        $https = isset($secure) ? $secure : isset($_SERVER['HTTPS']);

        // Set session cookie options
        //session_set_cookie_params($limit, $path, $domain, $https, true);
        $currentCookieParams = session_get_cookie_params();
        $rootDomain = null;

        // SESSION Cookie
        session_set_cookie_params(
            $lifetime,
            $currentCookieParams["path"],
            $rootDomain,
            $https,
           true
        );
        session_start();

        // JS-Cookie
        session_set_cookie_params(
            $lifetime,
            $currentCookieParams["path"],
            $rootDomain,
            $https,
            false
        );

        // Make sure the session hasn't expired, and destroy it if it has
        if(self::validateSession())
        {
            // Check to see if the session is new or a hijacking attempt
            if(!self::preventHijacking())
            {
                // Reset session data and regenerate id
                $_SESSION = array();
                $_SESSION['IPaddress'] = isset($_SERVER['HTTP_X_FORWARDED_FOR'])
                    ? $_SERVER['HTTP_X_FORWARDED_FOR'] : $_SERVER['REMOTE_ADDR'];
                $_SESSION['userAgent'] = $_SERVER['HTTP_USER_AGENT'];
                self::regenerateSession();

                // Give a 5% chance of the session id changing on any request
            }elseif(rand(1, 100) <= 5){
                self::regenerateSession();
            }
        }else{
            $_SESSION = array();
            session_destroy();
            session_start();
        }
    }

    static function regenerateSession()
    {
        // If this session is obsolete it means there already is a new id
        if(isset($_SESSION['OBSOLETE']))
            return;

        // Set current session to expire in 10 seconds
        $_SESSION['OBSOLETE'] = true;
        $_SESSION['EXPIRES'] = time() + 10;

        // Create new session without destroying the old one
        session_regenerate_id(false);

        // Grab current session ID and close both sessions to allow other scripts to use them
        $newSession = session_id();
        session_write_close();

        // Set session ID to the new one, and start it back up again
        session_id($newSession);
        session_start();

        // Now we unset the obsolete and expiration values for the session we want to keep
        unset($_SESSION['OBSOLETE']);
        unset($_SESSION['EXPIRES']);
    }

    /**
     * This function is used to see if a session has expired or not.
     *
     * @return bool
     */
    static protected function validateSession()
    {
        if( isset($_SESSION['OBSOLETE']) && !isset($_SESSION['EXPIRES']) )
            return false;

        if(isset($_SESSION['EXPIRES']) && $_SESSION['EXPIRES'] < time())
            return false;

        return true;
    }

    /**
     * This function checks to make sure a session exists and is coming from the proper host. On new visits and hacking
     * attempts this function will return false.
     *
     * @return bool
     */
    static protected function preventHijacking()
    {
        if(!isset($_SESSION['IPaddress']) || !isset($_SESSION['userAgent']))
            return false;


        if( $_SESSION['userAgent'] != $_SERVER['HTTP_USER_AGENT']
            && !( strpos($_SESSION['userAgent'], ÔTridentÕ) !== false
                && strpos($_SERVER['HTTP_USER_AGENT'], ÔTridentÕ) !== false))
        {
            return false;
        }

        $sessionIpSegment = substr($_SESSION['IPaddress'], 0, 7);

        $remoteIpHeader = isset($_SERVER['HTTP_X_FORWARDED_FOR'])
            ? $_SERVER['HTTP_X_FORWARDED_FOR'] : $_SERVER['REMOTE_ADDR'];

        $remoteIpSegment = substr($remoteIpHeader, 0, 7);

        if($_SESSION['IPaddress'] != $remoteIpHeader) {
            return false;
        }

        if( $_SESSION['userAgent'] != $_SERVER['HTTP_USER_AGENT'])
            return false;

        return true;
    }

    function validateInput($typ,$array,$key){
        $newValue = "";
        if(!isset($array) || !isset($array[$key])){
            return false;
        }
        $string = trim($array[$key]);
        switch ($typ){
            case 'string':
                if(!is_string($string)){
                    return false;
                }
                $newValue = htmlentities($string, ENT_QUOTES, "UTF-8");
                break;
            case 'int':
                $newValue = intval($string);
                break;
            
            case 'mail':
                $newValue = filter_var($string, FILTER_SANITIZE_EMAIL);
                if (filter_var($newValue, FILTER_VALIDATE_EMAIL) === false) {
                    return false;
                }
                break;
        }


        return $newValue;
    }
}