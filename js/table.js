function TableModel () {
    var self = this;

    self.flights_arr = ko.observableArray();    

    self.dayInChargeTotal = ko.observable();
    self.daySecondTotal = ko.observable();
    self.nightInChargeTotal = ko.observable();
    self.nightSecondTotal = ko.observable();
    self.grandTotal = ko.observable();

    self.month_filter_arr = ko.observableArray();
    self.year_filter_arr = ko.observableArray();

    self.monthFilterValue = ko.observable();
    self.yearFilterValue = ko.observable();

    self.selectedRowID = ko.observable();

    //any month and any year
    self.month_filter_arr.push("Any month");
    self.year_filter_arr.push("Any year");
    //self.year_filter_arr.push("2019");
    self.isDeleted = ko.observable(false);

    self.loggedInUsername = ko.observable();


    //initialization
    self.init = function () {

        //check whether the user has logged in or not
        var request;
        request = $.ajax({
            url: "php/index.php",
            type: "POST",
            data: {'check_logged_in':"checking logged in user"}
        });
        
        // Callback handler that will be called on success
        request.done(function (response, textStatus, jqXHR){
            // Log a message to the console
            
            var JSONResponse = JSON.parse(response);
            if (JSONResponse['message'] === "success") {
                self.loggedInUsername(JSONResponse['username']);
                //self.isLoggedIn(true);
                self.loadAllData();
            }
            else {
            window.location.href = "index.html";
            }
            
            console.log(JSONResponse);
        });
    
        // Callback handler that will be called on failure
        request.fail(function (jqXHR, textStatus, errorThrown){
            // Log the error to the console
            console.error(
                "The following error occurred: "+
                textStatus, errorThrown
            );
        });
    }; 

    self.loadAllData = function () {
        var dataObj = {};
        dataObj['message'] = "loadAllData";
        dataObj['month'] = "";
        dataObj['year'] = "";

        var dataJSONObj = JSON.stringify(dataObj);
        var request;

        request = $.ajax({
            url: "php/flight_table.php",
            type: "POST",
            data: {'loadData': dataJSONObj}
        });
    
        // Callback handler that will be called on success
        request.done(function (response, textStatus, jqXHR){
            
            var flightJSON = JSON.parse(response);
            
            if (flightJSON.length === 0) {
                self.dayInChargeTotal("0:00");
                self.daySecondTotal("0:00");
                self.nightInChargeTotal("0:00");
                self.nightSecondTotal("0:00");
                self.grandTotal("0:00");
            }
            else {
                loadData(flightJSON);
                self.selectedRowID(""); //empty the selection
                console.log(flightJSON);
            }
        });
    
        // Callback handler that will be called on failure
        request.fail(function (jqXHR, textStatus, errorThrown){
            // Log the error to the console
            console.error(
                "The following error occurred: "+
                textStatus, errorThrown
            );
        });
    };

    // for changing the select box for filtering year or month
    self.onChangeOptions = function () {
        self.flights_arr([]);

        var month;
        if (self.monthFilterValue() === "Any month") {
            month = "Any month";
        }
        else {
            month = change_month_string_to_number(self.monthFilterValue());
        }   
    
        var filterObj = {};
        filterObj['message'] = "";
        filterObj['month'] = month;
        filterObj['year'] = self.yearFilterValue();

        var dataJSONObj = JSON.stringify(filterObj);
        
        var request;
        request = $.ajax({
            url: "php/flight_table.php",
            type: "POST",
            data: {'loadData':dataJSONObj}
        });

        // Callback handler that will be called on success
        request.done(function (response, textStatus, jqXHR){
            var flightJSON = JSON.parse(response);
            
            if (flightJSON.length === 0) {
                self.dayInChargeTotal("0:00");
                self.daySecondTotal("0:00");
                self.nightInChargeTotal("0:00");
                self.nightSecondTotal("0:00");
                self.grandTotal("0:00");

                if (self.isDeleted()) {
                    location.reload();
                }
            }
            else {
                loadData(flightJSON);
                self.selectedRowID(""); //empty the selection
            }

        });

        // Callback handler that will be called on failure
        request.fail(function (jqXHR, textStatus, errorThrown){
            // Log the error to the console
            console.error(
                "The following error occurred: "+
                textStatus, errorThrown
            );
        });
        
    };

    //function for loading data into the table 
    function loadData(flightJSON) {
        var dateArray = [];
       
        //self.month_filter_arr([]);
        //self.year_filter_arr([]);
        //self.month_filter_arr.push("Any month");
        //self.year_filter_arr.push("Any year");

        for (var i=0; i < flightJSON.length; i++) {
            self.flights_arr.push(flightJSON[i]);

            if (!(dateArray.includes(flightJSON[i].date))) {
                dateArray.push(flightJSON[i].date);
            }
            
        }
        
        var total = sum_up_hours(self.flights_arr(),"dayInCharge");//sum up the hours
        self.dayInChargeTotal(total);

        total = sum_up_hours(self.flights_arr(),"daySecond");
        self.daySecondTotal(total);

        total = sum_up_hours(self.flights_arr(),"nightInCharge");
        self.nightInChargeTotal(total);

        total = sum_up_hours(self.flights_arr(),"nightSecond");
        self.nightSecondTotal(total);
        

        var total_hours_arr = [self.dayInChargeTotal(),self.daySecondTotal(),self.nightInChargeTotal(),self.nightSecondTotal()];
        //var total_hours_arr = ["7610:25","453:11","467:05","21:45"];
        //var total_hours_arr = ["488:28",":30","1:12",":58","1:53","1:23","1:27","1:32","1:26","2:11","1:26"];
        total = hours_sum(total_hours_arr);
        self.grandTotal(total);

        for (var i=0; i < dateArray.length; i++) {
            var month = dateArray[i].split(".")[1];
            var year = dateArray[i].split(".")[2];
            //console.log(month);
            //console.log(year);

            month = change_month_format(month);

            if (self.month_filter_arr.indexOf(month) === -1) {
                self.month_filter_arr.push(month);
            }
            if (self.year_filter_arr.indexOf(year) === -1) {
                self.year_filter_arr.push(year);
            }
        }

        //for sorting month array
        var months = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];
        self.month_filter_arr.sort(function(a, b){
            return months.indexOf(a)- months.indexOf(b);
        });


        //if monthFilterValue or yearFilterValue selecting year or month that does not exist, set default to Any year or Any month
        if (self.month_filter_arr.indexOf(self.monthFilterValue()) === -1) {
            self.monthFilterValue("Any month");
        }

        if (self.year_filter_arr.indexOf(self.yearFilterValue()) === -1) {
            self.yearFilterValue("Any year");
        }

    }

    //selecting the specific row for each flight using flight id
    self.selectedRow = function (rowID) {
        if (self.selectedRowID() === rowID) {
            self.selectedRowID("");
        }
        else {
            self.selectedRowID(rowID);
        }
    };

    //deleting the data using specific flight id
    self.deleteData = function () {
        var obj = {};
        obj['id'] = self.selectedRowID();
        var deleteDataObj = JSON.stringify(obj);

        var deleteConfirmation = confirm("Are you sure you want to delete?");
        if (deleteConfirmation === false) {
            return;
        }

        var request;
        request = $.ajax({
            url: "php/flight_table.php",
            type: "POST",
            data: {'deleteData':deleteDataObj}
        });

        // Callback handler that will be called on success
        request.done(function (response, textStatus, jqXHR){
            console.log(response);
            //location.reload();
            self.isDeleted(true);
            self.onChangeOptions();
        });

        // Callback handler that will be called on failure
        request.fail(function (jqXHR, textStatus, errorThrown){
            // Log the error to the console
            console.error(
                "The following error occurred: "+
                textStatus, errorThrown
            );
        });
    };

    //for editing data using selected flight id
    self.editData = function () {
        var obj = {};
        obj['id'] = self.selectedRowID();
        var editDataObj = JSON.stringify(obj);

        var request;
        request = $.ajax({
            url: "php/flight_table.php",
            type: "POST",
            data: {'editData':editDataObj}
        });

        // Callback handler that will be called on success
        request.done(function (response, textStatus, jqXHR){
            console.log(response);
            window.location.href = "form.html";
            
        });

        // Callback handler that will be called on failure
        request.fail(function (jqXHR, textStatus, errorThrown){
            // Log the error to the console
            console.error(
                "The following error occurred: "+
                textStatus, errorThrown
            );
        });
       
    };


     //user logged out
     self.logout = function () {
        var loggedInUserObj = {};
        loggedInUserObj['username'] = self.loggedInUsername();
        loggedInUserObj = JSON.stringify(loggedInUserObj);

        var request;
        request = $.ajax({
            url: "php/index.php",
            type: "POST",
            data: {'logout':loggedInUserObj}
        });
        
    
        // Callback handler that will be called on success
        request.done(function (response, textStatus, jqXHR){
            // Log a message to the console
            if (response === "success") {
                window.location.href = "index.html";
            }
            console.log(response);
        });
    
        // Callback handler that will be called on failure
        request.fail(function (jqXHR, textStatus, errorThrown){
            // Log the error to the console
            console.error(
                "The following error occurred: "+
                textStatus, errorThrown
            );
        });
    };
}


// functions
//function for adding up hours for specific column field
function sum_up_hours(flights_arr,total_field) {
    var flight_hour_arr = [];

    for (var i=0; i < flights_arr.length; i++) {
        var each_flight_obj = flights_arr[i];
        var each_flight_journey_arr = each_flight_obj['journey'];
        for (var j=0; j < each_flight_journey_arr.length; j++) {
            var each_journey_obj = each_flight_journey_arr[j];
            flight_hour_arr.push(each_journey_obj[total_field]);
        }
    }

    var totalHrAndMin = hours_sum(flight_hour_arr);

    return totalHrAndMin;
}

//sum up the actual time
function hours_sum(flight_hour_arr) {
    var totalMinutes = 0;
    var carryOn = 0;
    var totalHr = 0;
    var totalHrAndMin;

    var hr1;
    var hrArray = [];

    for (var i=0; i < flight_hour_arr.length; i++) {
        var each_flight_hour = flight_hour_arr[i];

        if (each_flight_hour === "" || each_flight_hour === "0:0") {
            each_flight_hour = "0:00";
        }

        var time_array = each_flight_hour.split(":");
        var hr = time_array[0];
        if (hr === "") {
            hr = "0";
        }
        
        var min = time_array[1];

        totalMinutes += parseInt(min);

        hrArray.push(hr);
    }
    
    while (totalMinutes >= 60) {
        totalMinutes = totalMinutes - 60;
        carryOn ++;
    }
    
    hr1 = parseInt(hrArray[0]) + carryOn;

    totalHr = parseInt(hr1);
    for (var i=1; i < hrArray.length; i++) {
        totalHr += parseInt(hrArray[i]);
    }

    if (totalMinutes === 0) {
        totalMinutes += "0";
    }
    else if (totalMinutes < 10) {
        totalMinutes = "0" + totalMinutes;
    }

    totalHrAndMin = totalHr + ":" + totalMinutes;

    return totalHrAndMin;
}

//change the number string to month string(eg. from "01" to "January")
function change_month_format(month) {
    var monthString;
    switch (month) {
        case "01":
            monthString = "January";
            break;
        case "02":
            monthString = "February";
            break;
        case "03":
            monthString = "March";
            break;
        case "04":
            monthString = "April";
            break;
        case "05":
            monthString = "May";
            break;
        case "06":
            monthString = "June";
            break;
        case "07":
            monthString = "July";
            break;
        case "08":
            monthString = "August";
            break;
        case "09":
            monthString = "September";
            break;
        case "10":
            monthString = "October";
            break;
        case "11":
            monthString = "November";
            break;
        case "12":
            monthString = "December";
            break;
    }
    return monthString;
}


//change the month string to number string(eg. from "January" to "01")
function change_month_string_to_number (monthString) {
    var month;
    switch (monthString) {
        case "January":
            month = "01";
            break;
        case "February":
            month = "02";
            break;
        case "March":
            month = "03";
            break;
        case "April":
            month = "04";
            break;
        case "May":
            month = "05";
            break;
        case "June":
            month = "06";
            break;
        case "July":
            month = "07";
            break;
        case "August":
            month = "08";
            break;
        case "September":
            month = "09";
            break;
        case "October":
            month = "10";
            break;
        case "November":
            month = "11";
            break;
        case "December":
            month = "12";
            break;                                       
    }
    return month;
}


var viewModel = new TableModel();
viewModel.init();

ko.applyBindings(viewModel);