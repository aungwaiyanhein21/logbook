function FormModel() {
    var self = this;

    self.newIATACodeText = ko.observable();
    self.newAircraftTypeText = ko.observable();

    self.keys = ["selectedIATAValueFromID","selectedIATAValueToID","departure","arrival","dayInCharge","daySecond","nightInCharge","nightSecond","remarks"];
   
    self.flight;

    //for alert message
    self.successMessage = ko.observable(false);
    self.errorMessage = ko.observable(false);
    self.aircraftTypeErrorMessage = ko.observable(false);
    self.IATACodeErrorMessage = ko.observable(false);

    self.loggedInUsername = ko.observable();

    //initialization
    self.init = function () {
        //flight object
        self.flight = new FlightData();

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
                self.checkEdit();
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

    self.checkEdit = function () {
         
        var request;

        request = $.ajax({
            url: "php/form.php",
            type: "POST",
            data: {'edit':"testing"}
        });
    
        // Callback handler that will be called on success
        request.done(function (response, textStatus, jqXHR){
            // Log a message to the console
            getAirCraftTypeAndIATACodeData();
            if (response !== "new") {
                var flightID = response;
                getDataBasedOnFlightID(flightID);
            }
            else {
                assignRowsObservables();
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

    //function for getting aircraft type and IATA code
    function getAirCraftTypeAndIATACodeData() {
        var request;

        request = $.ajax({
            url: "php/form.php",
            type: "POST",
            data: {'load':"getNecessaryData"}
        });
    
        // Callback handler that will be called on success
        request.done(function (response, textStatus, jqXHR){
            // Log a message to the console
            var flightJSON = JSON.parse(response);
            //console.log(flightJSON);
            self.flight.aircraftTypeOptions(flightJSON['aircraftTypeOptions']);
            self.flight.aircraftTypeOptions.sort(sortFunc("title"));

            //console.log(self.flight.aircraftTypeOptions());
            self.flight.IATAOptions(flightJSON['IATAOptions']);
            self.flight.IATAOptions.sort(sortFunc("title"));
        });
    
        // Callback handler that will be called on failure
        request.fail(function (jqXHR, textStatus, errorThrown){
            // Log the error to the console
            console.error(
                "The following error occurred: "+
                textStatus, errorThrown
            );
        });
    }

    //sort Function using specific key to sort
    function sortFunc(key) {  
        return function(a, b) {  
            if (a[key] > b[key]) {  
                return 1;  
            } else if (a[key] < b[key]) {  
                return -1;  
            }  
            return 0;  
        }  
    }  

    // function for getting specific data using flight id for edit
    function getDataBasedOnFlightID(flightID) {
        var obj = {};
        obj['id'] = flightID;
        var dataObj = JSON.stringify(obj);

        var request;

        request = $.ajax({
            url: "php/form.php",
            type: "POST",
            data: {'loadSpecificData': dataObj}
        });
    
        // Callback handler that will be called on success
        request.done(function (response, textStatus, jqXHR){
            // Log a message to the console
            /*var flightJSON = JSON.parse(response);
            console.log(flightJSON);
            self.flight.aircraftTypeOptions(flightJSON['aircraftTypeOptions']);
            self.flight.IATAOptions(flightJSON['IATAOptions']);
            */
           var flightJSON = JSON.parse(response);
           console.log(flightJSON);

           //assign values from flightJSON obj to self.flight
           assignValuesToFlightObj(flightJSON);
        });
    
        // Callback handler that will be called on failure
        request.fail(function (jqXHR, textStatus, errorThrown){
            // Log the error to the console
            console.error(
                "The following error occurred: "+
                textStatus, errorThrown
            );
        });
    }

    //function for initializing flight information for editing specific flight
    function assignValuesToFlightObj(flightJSON) {
        self.flight.id(flightJSON['id']);
        self.flight.date(flightJSON['date'])
        self.flight.aircraftTypeID(flightJSON['aircraftTypeID']);
        self.flight.aircraftMarkings(flightJSON['aircraftMarkings']);
        self.flight.captainRank(flightJSON['captainRank']);
        self.flight.captainName(flightJSON['captainName']);
        self.flight.holdersOperatingCapacity(flightJSON['holdersOperatingCapacity']);
        self.flight.inputRowsArray(flightJSON['inputRowsArray']);
    }

    // for adding rows for journey
    self.addRows = function () {
        assignRowsObservables();
    };

    //for removing journey rows using specific index
    self.removeRows = function(rowID) {
        var rowID = rowID();
        self.flight.inputRowsArray.splice(rowID,1); 
    }

    //assigning each journey row observables
    function assignRowsObservables() {
        var newObj = {};
        for (var i=0; i < self.keys.length; i++) {
            var key = self.keys[i];
            if (key === "selectedIATAValueFromID" || key === "selectedIATAValueToID") {
                newObj[key] = ko.observable();
            }
            else {
                newObj[key] = ko.observable('');
            }
        }
        self.flight.inputRowsArray.push(newObj);
    }
    
    //add IATA code to select box
    self.addIATACode = function () {

        //checking if IATA code exists
        for (var i = 0; i < self.flight.IATAOptions().length; i++) {
            if (self.flight.IATAOptions()[i].title ===  self.newIATACodeText()) {
                self.IATACodeErrorMessage(true);
                return;
            }
        }

        self.IATAObj = {};
        if (self.newIATACodeText() === undefined || self.newIATACodeText().length === 0) {
            return;
        }

        if (self.flight.IATAOptions().length === 0) {
            self.IATAObj.id = 1;
        }
        else {
            self.flight.IATAOptions.sort(sortFunc("id"));
            self.IATAObj.id = self.flight.IATAOptions()[self.flight.IATAOptions().length - 1].id + 1;
        }
        self.IATAObj.title = self.newIATACodeText();

        self.flight.IATAOptions.push(self.IATAObj);

        self.flight.IATAOptions.sort(sortFunc("title"));
        self.newIATACodeText("");
        self.IATACodeErrorMessage(false);
    };

    //add aircraft type to select box
    self.addAircraftType = function () {

        //checking if aircraft type already exists
        for (var i = 0; i < self.flight.aircraftTypeOptions().length; i++) {
            if (self.flight.aircraftTypeOptions()[i].title ===  self.newAircraftTypeText()) {
                self.aircraftTypeErrorMessage(true);
                return;
            }
        }

        self.aircraftTypeObj = {};
        if (self.newAircraftTypeText() === undefined || self.newAircraftTypeText().length === 0) {
            return;
        }

        if (self.flight.aircraftTypeOptions().length === 0) {
            self.aircraftTypeObj.id = 1;
        }
        else {
            self.flight.aircraftTypeOptions.sort(sortFunc("id"));
            self.aircraftTypeObj.id = self.flight.aircraftTypeOptions()[self.flight.aircraftTypeOptions().length - 1].id + 1;
        }
        self.aircraftTypeObj.title = self.newAircraftTypeText();

        self.flight.aircraftTypeOptions.push(self.aircraftTypeObj);

        self.flight.aircraftTypeOptions.sort(sortFunc("title"));
        self.newAircraftTypeText("");
        self.aircraftTypeErrorMessage(false);
    }

    //submit the data to server
    self.submitData = function () {
        console.log("inside submit data");
        //console.log(ko.toJS(self.flight));
        //checking whether date or journey rows empty
        if (self.flight.date() === "" || self.flight.inputRowsArray().length === 0) {
            self.errorMessage(true);
            self.successMessage(false);

            return;
        }

        //sort IATA Options and aircraft type by id
        self.flight.IATAOptions.sort(sortFunc("id"));
        self.flight.aircraftTypeOptions.sort(sortFunc("id"));

        console.log(ko.toJS(self.flight));

        var flight = ko.toJS(self.flight);
        flight = JSON.stringify(flight);
        
        var request;
        request = $.ajax({
            url: "php/form.php",
            type: "POST",
            data: {'save':flight}
        });
        
    
        // Callback handler that will be called on success
        request.done(function (response, textStatus, jqXHR){
            // Log a message to the console
            console.log(response);
            self.errorMessage(false);
            self.successMessage(true);

            self.flight.aircraftTypeOptions.sort(sortFunc("title"));
            self.flight.IATAOptions.sort(sortFunc("title"));
        });
    
        // Callback handler that will be called on failure
        request.fail(function (jqXHR, textStatus, errorThrown){
            // Log the error to the console
            console.error(
                "The following error occurred: "+
                textStatus, errorThrown
            );
        });
                        
        resetAllFields();
    };

    //function for resetting all input fields after submitting the data
    function resetAllFields() {
        self.flight.date('');
        self.flight.aircraftTypeID(1);
        self.flight.aircraftMarkings('');
        self.flight.captainRank('F/O');
        self.flight.captainName('');
        self.flight.holdersOperatingCapacity('');

        self.flight.inputRowsArray([]);
        assignRowsObservables();

    }

    self.checkEnter = function () {
        if (event.keyCode == 13) {
            if (self.newAircraftTypeText() !== undefined) {
                self.addAircraftType();
            }
            
            if (self.newIATACodeText() !== undefined) {
                self.addIATACode();
            } 
        }
        
        return true;
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


//constructor function for initializing flight information
function FlightData() {
    var self = this;

    self.id = ko.observable(-1); //will be generated on backend
    self.date = ko.observable('');
    self.aircraftTypeID = ko.observable(1);
    self.aircraftMarkings = ko.observable('');
    self.captainRank = ko.observable('');
    self.captainName = ko.observable('');
    self.holdersOperatingCapacity = ko.observable('');

    self.inputRowsArray = ko.observableArray([]);

    self.IATAOptions = ko.observableArray([]);
    self.aircraftTypeOptions = ko.observableArray([]);

}


var viewModel = new FormModel();
viewModel.init();

ko.applyBindings(viewModel);