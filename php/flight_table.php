<?php
    $dbname = '../logbook.db';
    $conn = new SQLITE3($dbname);

    session_start();

    if (isset($_POST['loadData'])) { //for loading data
        $load_data_obj = json_decode($_POST['loadData'],true);

        $flight_arr = array(); //whole flight object
 
        //getting flight type from db
        $sql = "SELECT * FROM FlightType";
        $result = $conn->query($sql);

        $flight_type_obj = array();
        while($_POST = $result->fetchArray(SQLITE3_ASSOC)) {
            $flight_type_obj[$_POST['id']] = $_POST['title'];
        }


        //getting IATA code from db
        $sql = "SELECT * FROM IATACode";
        $result = $conn->query($sql);

        $IATA_code_obj = array();
        while ($_POST = $result->fetchArray(SQLITE3_ASSOC)) {
            $IATA_code_obj[$_POST['id']] = $_POST['title'];
        }


        //getting flight_id from User flight using user session
        $username = $_SESSION['username'];
        $sql = " SELECT flight_id FROM User INNER JOIN UserFlight ON User.id=UserFlight.logbook_user_id WHERE User.username='$username'";
        $result = $conn->query($sql);

        $flight_id_arr = array();
        while ($_POST = $result->fetchArray(SQLITE3_ASSOC)) {
            $flight_id_arr[] =  $_POST['flight_id'];
        }


        //getting flight from flight table
        for ($i=0; $i < count($flight_id_arr); $i++) {
            $single_flight_id = $flight_id_arr[$i];
            if ($load_data_obj['message'] === "loadAllData" || ($load_data_obj['month'] === "Any month" && $load_data_obj['year'] === "Any year")) {
                $sql = "SELECT * FROM Flight WHERE id=$single_flight_id";
            }
            else if ($load_data_obj['month'] === "Any month") {
                $year_filter_value = $load_data_obj['year'];
                $sql = "SELECT * FROM Flight WHERE id=$single_flight_id AND substr(flight_date,1,4)='$year_filter_value'";
            }
            else if ($load_data_obj['year'] === "Any year") {
                $month_filter_value = $load_data_obj['month'];
                $sql = "SELECT * FROM Flight WHERE id=$single_flight_id AND substr(flight_date,6,2)='$month_filter_value'";
            }
            else {
                $month_filter_value = $load_data_obj['month'];
                $year_filter_value = $load_data_obj['year'];
                $sql = "SELECT * FROM Flight WHERE id=$single_flight_id AND substr(flight_date,1,4)='$year_filter_value' AND substr(flight_date,6,2)='$month_filter_value'";
            }
            $result = $conn-> query($sql);
            
            while ($_POST = $result->fetchArray(SQLITE3_ASSOC)) {
                $flight_obj = array();

                $flight_obj['id'] = $_POST['id'];

                $flight_date = $_POST['flight_date'];
                $flight_date_arr = explode("-",$flight_date);
                $flight_year = $flight_date_arr[0];
                $flight_month = $flight_date_arr[1];
                $flight_day = $flight_date_arr[2];
                $flight_obj['date'] = $flight_day.".".$flight_month.".".$flight_year;
                
                $flight_type_id = $_POST['flight_type_id'];

                $flight_obj['aircraftType'] = $flight_type_obj[$flight_type_id];
                $flight_obj['aircraftMarkings'] = $_POST['markings'];
                $flight_obj['captain'] = $_POST['captain_rank']." ".$_POST['captain_name'];
                $flight_obj['holdersOperatingCapacity'] = $_POST['holders_operating_capacity'];


                //getting journey id from specific flight id
                $flight_id = $flight_obj['id'];
                $sql = "SELECT journey_id FROM FlightJourney WHERE flight_id = $flight_id";
                $result2 = $conn->query($sql);

                $journey_arr = array();
                while ($_POST = $result2->fetchArray(SQLITE3_ASSOC)) {
                    $journey_id = $_POST['journey_id'];

                    //get all data from journey table based on journey id
                    $sql_journey = "SELECT * FROM Journey WHERE id = $journey_id";
                    $result3 = $conn->query($sql_journey);
                    while ($_POST = $result3->fetchArray(SQLITE3_ASSOC)) {
                        $journey_obj = array();

                        $flight_from_id = $_POST['flight_from_id'];
                        $flight_to_id = $_POST['flight_to_id'];
                        $journey_obj['journeyFrom'] = $IATA_code_obj[$flight_from_id];
                        $journey_obj['journeyTo'] = $IATA_code_obj[$flight_to_id];

                        $journey_obj['departure'] = $_POST['departure'];
                        $journey_obj['arrival'] = $_POST['arrival'];
                        $journey_obj['dayInCharge'] = $_POST['day_in_charge'];
                        $journey_obj['daySecond'] = $_POST['day_second'];
                        $journey_obj['nightInCharge'] = $_POST['night_in_charge'];
                        $journey_obj['nightSecond'] = $_POST['night_second'];
                        $journey_obj['remarks'] = $_POST['remarks'];

                        $journey_arr[] = $journey_obj;
                    }
                }
                $flight_obj['journey'] = $journey_arr;

                //add to flight array
                $flight_arr[] = $flight_obj;
            }
        }

        usort($flight_arr, "compare_date");

        echo json_encode($flight_arr, JSON_PRETTY_PRINT);
    }
    else if (isset($_POST['deleteData'])) { //for deleting data using specific flight id
        $data_obj = json_decode($_POST['deleteData'],true);
        $flight_id = $data_obj['id'];
        //echo $flight_id;

        $message = delete_data_using_flight_id($flight_id,$conn); //call function to delete data

        echo $message;

    }
    else if (isset($_POST['editData'])) { //
        $data_obj = json_decode($_POST['editData'],true);

        //create a session for flight id
        $_SESSION["flight_id_to_be_edited"] = $data_obj['id']; 

        echo "success";
    }

    // function for deleting data using flight id
    function delete_data_using_flight_id($flight_id,$conn) {
        
        //deleting from userflight table
        $sql = "DELETE FROM UserFlight WHERE flight_id = '$flight_id'";
        $result0 = $conn->query($sql);
        if ($result0) {
            $message0 = "success";
        }
        else {
            $message0 = "not successful";
        }
        
        //deleting from flight table
        $sql = "DELETE FROM Flight WHERE id='$flight_id'";
        $result = $conn->query($sql);
        if ($result) {
            $message = "success";
        }
        else {
            $message = "not successful";
        }

        //querying flight journey table to get journey id and use that journey id to delete from journey table
        $sql = "SELECT journey_id FROM FlightJourney WHERE flight_id = '$flight_id'";
        $result = $conn->query($sql);

        while($_POST = $result->fetchArray(SQLITE3_ASSOC)) {
            $journey_id = $_POST['journey_id'];
            
            $sql2 = "DELETE FROM Journey WHERE id = '$journey_id'";
            $result2 = $conn->query($sql2);
            
            if ($result2) {
                $message2 = "success";
            }
            else {
                $message2 = "not successful";
            }
        }

        $sql = "DELETE FROM FlightJourney WHERE flight_id = '$flight_id'";
        $result = $conn->query($sql);

        if ($result) {
            $message3 = "success";
        }
        else {
            $message3 = "not successful";
        }
    
        if ($message0 === "success" && $message === "success" && $message2 === "success" && $message3 === "success") {
            return "Record is deleted successfully";
        }
        else {
            return "Sorry, record is not deleted successfully";
        }
    }

    //function for date comparison
    function compare_date($a, $b){
        $t1 = strtotime($a['date']);
        $t2 = strtotime($b['date']);
        return $t1 - $t2;
    }    
?>