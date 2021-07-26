function UserProfileModel () {
    var self = this;

    self.loggedInUsername = ko.observable();

    self.user;


    self.init = function () {

        self.user = new User();

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
                self.getData();
            }
            else {
               window.location.href = "index.html";
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

    self.getData = function () {
        var request;
        request = $.ajax({
            url: "php/user_profile.php",
            type: "POST",
            data: {'get_user_data':"getting_user_data"}
        });
        
        // Callback handler that will be called on success
        request.done(function (response, textStatus, jqXHR){
            // Log a message to the console
            
            var JSONResponse = JSON.parse(response);
            self.assignValuesToUser(JSONResponse);
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

    self.assignValuesToUser = function (JSONObj) {
        self.user.id(JSONObj.id);
        self.user.username(JSONObj.username);
        self.user.email(JSONObj.email);
    };  

    //updating the user
    self.update = function () {

        var user = ko.toJS(self.user);
        user = JSON.stringify(user);

        var request;
        request = $.ajax({
            url: "php/user_profile.php",
            type: "POST",
            data: {'update':user}
        });
        
    
        // Callback handler that will be called on success
        request.done(function (response, textStatus, jqXHR){
            console.log(response);
            self.user.password('');
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

    //deleting user account
    self.deleteAccount = function () {

        var deleteConfirmation = confirm("Are you sure you want to delete all the user data?");
        if (deleteConfirmation === false) {
            return;
        }

        var userObj = {};
        userObj['id'] = self.user.id();
        userObj = JSON.stringify(userObj);


        var request;
        request = $.ajax({
            url: "php/user_profile.php",
            type: "POST",
            data: {'delete':userObj}
        });
        
    
        // Callback handler that will be called on success
        request.done(function (response, textStatus, jqXHR){
            console.log(response);
            location.reload();
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

function User() {
    var self = this;
    
    self.id = ko.observable(-1);
    self.username = ko.observable('');
    self.email = ko.observable('');
    self.password = ko.observable('');
}

var viewModel = new UserProfileModel();
viewModel.init();

ko.applyBindings(viewModel);