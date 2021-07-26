<?php
    include_once 'form.php';

    if (isset($_POST['register'])) {
        $new_user = json_decode($_POST['register'],true);
        //echo json_encode($new_user, JSON_PRETTY_PRINT);

        //getting new user data
        $id = $new_user['id'];
        $new_username = $new_user['new_username'];
        $new_email = $new_user['new_email'];
        $new_password = $new_user['new_password'];

        //checking if both username and email exists
        $sql = "SELECT COUNT(*) as count FROM User WHERE username='$new_username' AND email='$new_email'";
        $result = $conn -> query($sql);
        $row = $result->fetchArray();
        $numRows = $row['count'];

        if ($numRows !== 0) {
            exit("username and email exists!");
        }

        // checking if username exists
        $sql = "SELECT COUNT(*) as count FROM User WHERE username='$new_username'";
        $result = $conn -> query($sql);
        $row = $result->fetchArray();
        $numRows = $row['count'];

        if ($numRows !== 0) {
            exit("username exists!");
        }

        //checking if email exists
        $sql = "SELECT COUNT(*) as count FROM User WHERE email='$new_email'";
        $result = $conn -> query($sql);
        $row = $result->fetchArray();
        $numRows = $row['count'];

        if ($numRows !== 0) {
            exit("Email exists!");
        }

        
        //query User for getting new user id
        $sql = "SELECT id FROM User";
        $result = $conn -> query($sql);
        $user_id_arr = array();
        while ($_POST = $result->fetchArray(SQLITE3_ASSOC)) {
            $user_id_arr[] = $_POST['id'];
        }

        $new_user_id = get_new_id($user_id_arr); //get new user id


        $hashed_password = password_hash($new_password, PASSWORD_DEFAULT); //hash the password
        
        //insert into User table
        $conn->exec('BEGIN');
        $sql = "INSERT INTO User(id,username,email,user_password)
                VALUES ($new_user_id,'$new_username','$new_email','$hashed_password')";

        if( $conn->exec($sql) ){
            $message = "success";
        }else{
            $message = "Sorry, Data is not inserted.";
        }
        //$conn -> query($sql);
        $conn -> exec('COMMIT');

        
        echo $message;
    }   
    else if (isset($_POST['login'])) {
        $user = json_decode($_POST['login'],true);

        //getting user data
        $username = $user['username'];
        $user_password = $user['password'];

        $loggedInfoObj = array(); //associative array for username and message
        $loggedInfoObj['username'] = $username;

        $sql = "SELECT user_password FROM User WHERE username='$username'";
        $result = $conn->query($sql);

        $counter = 0;
        while($_POST = $result->fetchArray(SQLITE3_ASSOC)) {
            $password_from_db = $_POST['user_password'];
            $counter++;
        }

        if ($counter === 0) {
            $loggedInfoObj['message'] = "Username not exist!";
            echo json_encode($loggedInfoObj, JSON_PRETTY_PRINT);
            exit();
        }


        //check password
       
        if (password_verify($user_password, $password_from_db)) {
            //create a session for that user
            $_SESSION["username"] = $loggedInfoObj['username'];

            $loggedInfoObj['message'] = "success";
        } else {
            $loggedInfoObj['message'] = "Incorrect Password!";
        }
        echo json_encode($loggedInfoObj, JSON_PRETTY_PRINT);
    }
    else if(isset($_POST['logout'])) {
        $user = json_decode($_POST['logout'],true);
        $username_to_be_logged_out = $user['username'];

        if (isset($_SESSION["username"])) {
            if ($_SESSION["username"] === $username_to_be_logged_out) {
                // unset the session for username
                unset($_SESSION["username"]);
                echo "success";
            }
            else {
                echo "such username not exist.";
            }
        }
        else {
            echo "no such session exists";
        }
    }
    else if(isset($_POST['check_logged_in'])) {
        $loggedInfoObj = array();
        if (isset($_SESSION["username"])) {
            $loggedInfoObj['username'] = $_SESSION["username"];
            $loggedInfoObj['message'] = "success";
        }
        else {
            $loggedInfoObj['username'] = "";
            $loggedInfoObj['message'] = "not logged in";
        }
        echo json_encode($loggedInfoObj, JSON_PRETTY_PRINT);
    }
?>