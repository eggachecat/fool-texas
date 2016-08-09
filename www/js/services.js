angular.module('texas.services', [])

.service('CommonService', ['$rootScope', function($rootScope){

  // database access poing
  var ref = new Wilddog("https://foolish-texas.wilddogio.com");

  var user = {}


  this.getRef = function(){return ref;};
  this.setUser = function(usr){
    user = usr;
  }
  this.getUser = function(){return user;}


 
}])

.service('AuthService', ['CommonService', function(CommonService){
 
  var ref = CommonService.getRef();

  var LOCAL_TOKEN_KEY = 'ft:foolish-texas-key';
  var isAuthenticated = false;
  var authToken = "undefined";
  var user = {};

  function decodeData(token) { 
    var tokenData = token.split('.')[1];
    //bass64 decode
    return JSON.parse(window.atob(tokenData));  
  }

  function useCredentials(token) {  
    isAuthenticated = true;
    authToken = token;
    tokenObj = decodeData(token)["d"]
     CommonService.setUser({
        "uid": tokenObj["uid"]
     });
    // console.log(tokenObj)
    // getUserByID(tokenObj["uid"]);
  }
 
  function loadUserCredentials() {
    var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
    console.log(token)
    if (token) {
      useCredentials(token);
    }
  }

  function storeUserCredentials(token) {
    window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
    useCredentials(token);
  }

  function destroyUserCredentials() {
    authToken = undefined;
    isAuthenticated = false;
    user = {};
    window.localStorage.removeItem(LOCAL_TOKEN_KEY);
  }

  function getUserByID(id){
    console.log(id)
    var userRef = ref.child("user").child(id);
    userRef.on("value", function(snapshot){
      user = snapshot.val();
      CommonService.setUser(user);
    })
  }

  loadUserCredentials();

  this.logout = function(callback) {
    destroyUserCredentials();
    callback();
  };
     
  this.isAuthenticated = function() {
    return isAuthenticated;
  }

  this.login = function(authObj, onSuccess){
     ref.authWithPassword({
        email    : authObj.email,
        password : authObj.password
    }, function(err, data){
      if (err == null) {
        console.log(data)
        storeUserCredentials(data.token)
        onSuccess();
      }
    });
  }

  this.register = function(authObj, user){
    ref.createUser({
      email: authObj.email,
      password: authObj.password
    }, function(err, data){
      if(err != null){}
      else{
        ref.child("User").child(data.id).set(user);
      }
    });
  }
}])

