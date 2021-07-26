<?php 
    $dbname = '../logbook.db';
    $conn = new SQLITE3($dbname);

    session_start();

    if (isset($_POST['get_user_data'])) { //for loading data
        //getting user data from user table
        $username = $_SESSION['username'];

        $sql = "SELECT * FROM User WHERE username='$username'";
        $result = $conn->query($sql);

        $user_obj = array();
        while($_POST = $result->fetchArray(SQLITE3_ASSOC)) {
            $user_obj['id'] = $_POST['id'];
            $user_obj['username'] = $_POST['username'];
            $user_obj['email'] = $_POST['email'];
        }
        echo json_encode($user_obj,JSON_PRETTY_PRINT);
    }
    else if (isset($_POST['update'])) {
        $user_obj = json_decode($_POST['update'],true);

        $id = $user_obj['id'];
        $password = $user_obj['password'];

        $hashed_password = password_hash($password, PASSWORD_DEFAULT); //hash the password


        $sql = "UPDATE User set user_password='$hashed_password' WHERE id=$id";
        if ($conn-> exec($sql)) {
            $message = "Updated succesfully!";
        }
        else {
            $message = "Sorry! Update unsuccessful.";
        }

        echo $message;
    }
    else if (isset($_POST['delete'])) {
        $user_obj = json_decode($_POST['delete'],true);
        $user_id = $user_obj['id'];
        
        //delete user from user table
        $sql = "DELETE FROM User WHERE id=$user_id";
        if ($conn->query($sql)) {
            $message = "deleted";
        }
        else {
            $message = "not deleted";
            exit();
        }


        //selecting flight using flight_id
        $sql = "SELECT flight_id FROM UserFlight WHERE logbook_user_id=$user_id";
        $result = $conn->query($sql);

        while($_POST = $result->fetchArray(SQLITE3_ASSOC)) {
            $flight_id = $_POST['flight_id'];

            //selecting journey id from flightJourney table
            $sql2 = "SELECT journey_id FROM FlightJourney WHERE flight_id = $flight_id";
            $result2 = $conn->query($sql2);
            while ($_POST = $result2->fetchArray(SQLITE3_ASSOC)) {
                $journey_id = $_POST['journey_id'];

                //delete from journey table
                $sql3 = "DELETE FROM Journey WHERE id = '$journey_id'";
                $result3 = $conn->query($sql3);
                
                if ($result3) {
                    $message = "deleted";
                }
                else {
                    $message = "not deleted";
                    exit();
                }
            }

            //delete from flightJourney table
            $sql2 = "DELETE FROM FlightJourney WHERE flight_id = '$flight_id'";
            $result2 = $conn->query($sql2);

            if ($result2) {
                $message = "deleted";
            }
            else {
                $message = "not deleted";
                exit();
            }

            
            //delete from flight table
            $sql2 = "DELETE FROM Flight WHERE id='$flight_id'";
            $result2 = $conn->query($sql2);
            if ($result2) {
                $message = "success";
            }
            else {
                $message = "not successful";
            }
        }


        //delete flight id and user id from user flight table
        $sql = "DELETE FROM UserFlight WHERE logbook_user_id=$user_id";
        if ($conn->query($sql)) {
            $message = "deleted";
        }
        else {
            $message = "not deleted";
            exit();
        }
        
        if ($message = "deleted") {
            // unset the session
            unset($_SESSION["username"]);
            echo "User account deleted";
        }
    }
?>