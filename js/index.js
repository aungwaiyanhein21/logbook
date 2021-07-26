function IndexModel() {
    var self = this;

    self.isRegistrationForm = ko.observable(true);
    self.isLoginForm = ko.observable(false);

    self.isLoggedIn = ko.observable(false);
    self.loggedInUsername = ko.observable();

    //alert messages
    self.loggedInErrorMessage = ko.observable(false);
    self.loggedInErrorText = ko.observable('');

    self.registerErrorMessage = ko.observable(false);
    self.registerSuccessMessage = ko.observable(false);
    self.registerText = ko.observable('');

    //init function
    self.init = function () {
        self.newUser = new User();
        self.existingUser = new ExistingUser();
        
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
                self.isLoggedIn(true);
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

    //for registration
    self.register = function () {
        console.log(ko.toJS(self.newUser));
        if (self.newUser.new_username() === "" || self.newUser.new_email() === "" || self.newUser.new_password() === "") {
            return;
        }
        var isValidated = emailValidation(self.newUser.new_email());
        if (!isValidated) { //if email is not in valid format
            return;
        }

        var new_user = ko.toJS(self.newUser);
        new_user = JSON.stringify(new_user);

        var request;
        request = $.ajax({
            url: "php/index.php",
            type: "POST",
            data: {'register':new_user}
        });
        
    
        // Callback handler that will be called on success
        request.done(function (response, textStatus, jqXHR){
            // Log a message to the console
            //var user = JSON.parse(response);
            console.log(response);
            if (response !== "success") {
                self.registerErrorMessage(true);
                self.registerText(response);
            }
            else {
                self.registerSuccessMessage(true);
                self.registerText("Successfully created the account!");
                resetNewUserField();
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

    //for login
    self.login = function () {
        console.log(ko.toJS(self.existingUser));
        if (self.existingUser.username() === "" || self.existingUser.password() === "") {
            return;
        }

        var user = ko.toJS(self.existingUser);
        user = JSON.stringify(user);

        var request;
        request = $.ajax({
            url: "php/index.php",
            type: "POST",
            data: {'login':user}
        });
        
    
        // Callback handler that will be called on success
        request.done(function (response, textStatus, jqXHR){
            // Log a message to the console
            //var user = JSON.parse(response);
            var JSONResponse = JSON.parse(response);
            if (JSONResponse['message'] === "success") {
                self.loggedInUsername(JSONResponse['username']);
                self.isLoggedIn(true);
                location.reload();
            }
            else {
                self.loggedInErrorMessage(true);
                self.loggedInErrorText(JSONResponse['message']);
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

        resetExistingUserField();
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
                self.loggedInUsername('');
                self.isLoggedIn(false);
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


    //function for resetting new user field
    function resetNewUserField() {
        self.newUser.new_username('');
        self.newUser.new_email('');
        self.newUser.new_password('');
    }

     //function for resetting new user field
     function resetExistingUserField() {
        self.existingUser.username('');
        self.existingUser.password('');
    }

    //pressing enter
    self.registerCheckEnter = function () {
        if (event.keyCode == 13) {
           self.register();
        }
        return true;
    };
    self.loginCheckEnter = function () {
        if (event.keyCode == 13) {
           self.login();
        }
        return true;
    };
}

//constructor function for new user
function User() {
    var self = this;

    self.id = ko.observable(-1); //will be generated on backend
    self.new_username = ko.observable('');
    self.new_email = ko.observable('');
    self.new_password = ko.observable('');
}


//constructor function for user to be logged in
function ExistingUser() {
    var self = this;

    self.username = ko.observable('');
    self.password = ko.observable('');
} 

//function for simple validating email
function emailValidation(email) 
{
    var stringToBeSearched = /\S+@\S+/;
    return stringToBeSearched.test(email);
}


var viewModel = new IndexModel();
viewModel.init();

ko.applyBindings(viewModel);