<?php 
    include_once 'flight_table.php';

    if (isset($_POST['save'])) { //for saving the data whether it is for editing or for creating new flight
        $flight = json_decode($_POST['save'],true);

        if ($flight['id'] === -1) { //new flight
            //selecting the flight info
            $sql = "SELECT * FROM Flight";
            $result = $conn -> query($sql);

            $flight_id_arr = array();
            while ($_POST = $result->fetchArray(SQLITE3_ASSOC)) {
                $flight_id_arr[] = $_POST['id'];
            }

            $new_flight_id = get_new_id($flight_id_arr); //get new flight id
        }
        else { //edit flight: For updating data, delete first and then insert
            $new_flight_id = $flight['id'];
            $message = delete_data_using_flight_id($new_flight_id,$conn); //delete specific flight
        }
        
        //inserting into userflight table, flight table, journey table and flightjourney table

        //getting flight data
        $flight_date = $flight['date'];
        $flight_type_id = $flight['aircraftTypeID'];
        $markings = $flight['aircraftMarkings'];
        $captain_rank = $flight['captainRank'];
        $captain_name = $flight['captainName'];
        $holders_operating_capacity = $flight['holdersOperatingCapacity'];

        //get user id from user's session
        $username = $_SESSION['username'];
        $sql = "SELECT id FROM User WHERE username = '$username'";
        $result = $conn -> query($sql);
        while ($_POST = $result->fetchArray(SQLITE3_ASSOC)) {
            $session_user_id = $_POST['id'];
        }

        //insert into UserFlight table
        $conn->exec('BEGIN');
        $sql = "INSERT INTO UserFlight(logbook_user_id,flight_id)
                VALUES ($session_user_id,$new_flight_id)";
        $conn -> query($sql);
        $conn -> exec('COMMIT');

        //insert into flight table
        $conn->exec('BEGIN');
        $sql = "INSERT INTO Flight(id,flight_date,flight_type_id,markings,captain_rank,captain_name,holders_operating_capacity)
                VALUES ($new_flight_id,'$flight_date',$flight_type_id,'$markings','$captain_rank','$captain_name','$holders_operating_capacity')";
        $conn -> query($sql);
        $conn -> exec('COMMIT');
       
        // for journey table
        $journey_arr = $flight['inputRowsArray'];
        $new_journey_id_arr = array();
        for ($i=0; $i < count($journey_arr); $i++) {
             //selecting journey info
            $sql = "SELECT * FROM Journey";
            $result = $conn -> query($sql);

            $journey_id_arr = array();
            while ($_POST = $result->fetchArray(SQLITE3_ASSOC)) {
                $journey_id_arr[] = $_POST['id'];
            }

            $new_journey_id = get_new_id($journey_id_arr); //new journey id

            $new_journey_id_arr[] = $new_journey_id;
            

            //getting data

            $each_flight_journey = $journey_arr[$i];

            $flight_from_id = $each_flight_journey['selectedIATAValueFromID'];
            $flight_to_id = $each_flight_journey['selectedIATAValueToID'];
            $departure = $each_flight_journey['departure'];
            $arrival = $each_flight_journey['arrival'];
            $day_in_charge = $each_flight_journey['dayInCharge'];
            $day_second = $each_flight_journey['daySecond'];
            $night_in_charge = $each_flight_journey['nightInCharge'];
            $night_second = $each_flight_journey['nightSecond'];
            $remarks = $each_flight_journey['remarks'];

            
            //inserting into journey table
            $conn->exec('BEGIN');
            $sql = "INSERT INTO Journey(id,flight_from_id,flight_to_id,departure,arrival,day_in_charge,day_second,night_in_charge,night_second,remarks)
                    VALUES($new_journey_id,$flight_from_id,$flight_to_id,'$departure','$arrival','$day_in_charge','$day_second','$night_in_charge','$night_second','$remarks')";
            $conn -> query($sql);
            $conn -> exec('COMMIT');
            
        }
      
        
        //insert into FlightJourney table
        for ($i=0; $i < count($new_journey_id_arr); $i++) {
            $journey_id = $new_journey_id_arr[$i];

            $conn->exec('BEGIN');
            $sql = "INSERT INTO FlightJourney(flight_id,journey_id) VALUES($new_flight_id,$journey_id)";
            $conn -> query($sql);
            $conn -> exec('COMMIT');
        }

        
        
        //getting from IATA Code table
        $sql = "SELECT id FROM IATACode";
        $result = $conn -> query($sql);

        $IATA_code_id_arr = array();
        while ($_POST = $result->fetchArray(SQLITE3_ASSOC)) {
            $IATA_code_id_arr[] = $_POST['id'];
        }
        sort($IATA_code_id_arr);

        $last_IATA_code_id_from_db = $IATA_code_id_arr[count($IATA_code_id_arr)-1];

        $IATA_options_arr = $flight['IATAOptions'];

        for ($i = ($last_IATA_code_id_from_db); $i < count($IATA_options_arr); $i++) {
            $each_IATA_obj = $IATA_options_arr[$i];

            $title = $each_IATA_obj['title'];

            //insert into IATA code table
            $conn->exec('BEGIN');
            $sql = "INSERT INTO IATACode(title) VALUES('$title')";
            $conn -> query($sql);
            $conn -> exec('COMMIT');
        }

        //getting from aircraft type table
        $sql = "SELECT id FROM FlightType";
        $result = $conn -> query($sql);

        $aircraft_type_id_arr = array();
        while ($_POST = $result->fetchArray(SQLITE3_ASSOC)) {
            $aircraft_type_id_arr[] = $_POST['id'];
        }
        sort($aircraft_type_id_arr);

        $last_aircraft_type_id_from_db = $aircraft_type_id_arr[count($aircraft_type_id_arr)-1];

        $aircraft_type_options_arr = $flight['aircraftTypeOptions'];

        for ($i = ($last_aircraft_type_id_from_db); $i < count($aircraft_type_options_arr); $i++) {
            $each_aircraft_type_obj = $aircraft_type_options_arr[$i];

            $title = $each_aircraft_type_obj['title'];

            //insert into IATA code table
            $conn->exec('BEGIN');
            $sql = "INSERT INTO FlightType(title) VALUES('$title')";
            $conn -> query($sql);
            $conn -> exec('COMMIT');
        }

        echo "Form Submitted";
    }
    else if (isset($_POST['load'])) {
        //getting data from flighttype table
        $sql = "SELECT * FROM FlightType";
        $result = $conn->query($sql);

        $flight_info = array();
        $flight_type_arr = array();
        while($_POST = $result->fetchArray(SQLITE3_ASSOC)) {
            $flight_type_obj = array();

            $flight_type_obj['id'] = $_POST['id'];
            $flight_type_obj['title'] = $_POST['title'];

            $flight_type_arr[] =$flight_type_obj;
            //echo $_POST['title'];
        }

        //getting data from IATACode table
        $sql = "SELECT * FROM IATACode";
        $result = $conn->query($sql);

        $flight_IATA_arr = array();
        while($_POST = $result->fetchArray(SQLITE3_ASSOC)) {
            $flight_IATA_obj = array();

            $flight_IATA_obj['id'] = $_POST['id'];
            $flight_IATA_obj['title'] = $_POST['title'];

            $flight_IATA_arr[] = $flight_IATA_obj;
        }

        $flight_info['aircraftTypeOptions'] = $flight_type_arr;
        $flight_info['IATAOptions'] = $flight_IATA_arr;
        
        
        echo json_encode($flight_info, JSON_PRETTY_PRINT);
        //echo "success getting data";
    }
    else if (isset($_POST['loadSpecificData'])) { //load data into form for editing
        $data_obj = json_decode($_POST['loadSpecificData'],true);
        $flight_id_to_be_edited = $data_obj['id'];

        $flight_obj = array(); //flight obj containing all data for that flight id
        
        //get flight from flight table using that id
        $sql = "SELECT * FROM Flight WHERE id = $flight_id_to_be_edited";
        $result = $conn-> query($sql);

        while ($_POST = $result->fetchArray(SQLITE3_ASSOC)) {
            $flight_obj['id'] = $_POST['id'];
            $flight_obj['date'] = $_POST['flight_date'];

            $flight_obj['aircraftMarkings'] = $_POST['markings'];
            $flight_obj['captainRank'] = $_POST['captain_rank'];
            $flight_obj['captainName'] = $_POST['captain_name'];
            $flight_obj['holdersOperatingCapacity'] = $_POST['holders_operating_capacity'];

            $flight_obj['aircraftTypeID'] = $_POST['flight_type_id'];
            
            
            //getting journey id from specific flight id
            $flight_id = $flight_obj['id'];
            $sql2 = "SELECT journey_id FROM FlightJourney WHERE flight_id = $flight_id";
            $result2 = $conn->query($sql2);

            $journey_arr = array();
            while ($_POST = $result2->fetchArray(SQLITE3_ASSOC)) {
                $journey_id = $_POST['journey_id'];

                //get all data from journey table based on journey id
                $sql_journey = "SELECT * FROM Journey WHERE id = $journey_id";
                $result3 = $conn->query($sql_journey);
                while ($_POST = $result3->fetchArray(SQLITE3_ASSOC)) {
                    $journey_obj = array();

                    $journey_obj['selectedIATAValueFromID'] = $_POST['flight_from_id'];
                    $journey_obj['selectedIATAValueToID'] = $_POST['flight_to_id'];

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
            $flight_obj['inputRowsArray'] = $journey_arr;
        }

        echo json_encode($flight_obj, JSON_PRETTY_PRINT);
    }
    else if (isset($_POST['edit'])) {
        if (isset($_SESSION["flight_id_to_be_edited"])) {
            $flight_id = $_SESSION["flight_id_to_be_edited"];

            // unset the session
            unset($_SESSION["flight_id_to_be_edited"]);
            //session_destroy(); 
            echo $flight_id;
        }
        else {
            echo "new";
        }
    }



    function get_new_id($id_array) {
        //return "success from function";
        
        if (count($id_array) == 0) {
            return 0;
        } 
        
        sort ($id_array);
    
        for ($i=0;$i < count($id_array)-1; $i++) {
            if ($id_array[$i+1] > $id_array[$i]+1) {
                return $id_array[$i] + 1;
            }
        }
        return $id_array[count($id_array)-1]+1;
    } 
?>