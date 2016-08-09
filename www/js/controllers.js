angular.module('texas.controllers', [])


.controller('LoginCtrl', function($scope, AuthService, $state) {
  $scope.login = function(authObj){
    AuthService.login(authObj, function(){
      $state.go("tab.hall");
    });
  }
})
 

.controller('HallCtrl', function($scope, $wilddogObject, $state, CommonService, GLOBAL_MAP) {
  var clubRef =  CommonService.getRef().child("club");

  $scope.games = $wilddogObject(clubRef);
  $scope.tnMap = GLOBAL_MAP["type-name"];

  var self = this;
  self.user = CommonService.getUser();

  $scope.join = function(game){
 
    var gameRef = clubRef.child(game.id);

    clubRef.child("001").child("seq").transaction(function(oldSeq){


      gameRef.child("players").child(self.user.uid).set({
        uid: self.user.uid,
        stake: 100000,
        raise: 0,
        chip: 0,
        seq: oldSeq.num
      });

      return {num: parseInt(oldSeq.num) + 1}
    }, function(error){
      if(! error){
         $state.go("game-texas", {type: game.type})
      }
    })
  }
  

})

.controller('TexasCtrl', function($scope, CommonService, $wilddogObject, $wilddogArray, $timeout, $interval) {

  var WAIT_SECONDS = $scope.WAIT_SECONDS = 15;
  var TOTAL_TIME = $scope.TOTAL_TIME = WAIT_SECONDS * 1000 + 3000;

  var user = $scope.user = CommonService.getUser();


  var myTurn = $scope.myTurn = false;

  var self = this;

  self.timeouter = {};
  self.intervaler = {};

  $scope.timer = 0;

  var startTimer = function(){
    $scope.timer = 0;

    self.timeouter = $timeout(function(){
      // fold();
      next();
    }, TOTAL_TIME)

    self.intervaler = $interval(function(){
      $scope.timer ++;
      console.log($scope.timer);
    }, 1000, WAIT_SECONDS)
  }

  var cancelTimer = function(){
    $timeout.cancel(self.timeouter);
    $interval.cancel(self.intervaler);
  }


  var texasRef =  CommonService.getRef().child("club").child("001");


  var myRef = texasRef.child("players").child(user.uid);
  var me = $wilddogObject(myRef);
  me.$bindTo($scope, "me");
  var gamersArr  = $scope.gamersArr = $wilddogArray(texasRef.child("players"));

  $scope.player = {}

  $wilddogObject(texasRef.child("seq")).$bindTo($scope,"seq");
 

  // watch seq object
  texasRef.child("seq").on("value", function(turn){

    var seqNum = turn.val().num;

    me.$loaded().then(function(){
      $scope.myTurn = myTurn = me.seq == seqNum;

      // only my-turn to operator
      if(myTurn){
        // [ME] have folded
        if(me.fold){
          $scope.seq["num"] = ($scope.seq["num"] + 1) % gamersArr.length;
        }else{
          $scope.player = me;
          startTimer();
        }
      } else {
        // gamesArr loaded first
        gamersArr.$loaded().then(function(){
          console.log(gamersArr.length);
          // whos the player now
          for (var i = 0; i < gamersArr.length; i++) {
            console.log(gamersArr[i].seq, myTurn);
            if(gamersArr[i].seq == seqNum){
              $scope.player = gamersArr[i];
              console.log($scope.player)
              break;
            }
          }
        })
      }
    })
  })


  var potsObj = $scope.potsObj = $wilddogObject(texasRef.child("pots"));



  // hand-over
  var next = $scope.next = function(){
    cancelTimer();
    $scope.seq["num"] = ($scope.seq["num"] + 1) % gamersArr.length;
  }



  // only accessable when my turn
  $scope.fold = function(){
    var currUser = gamersArr[$scope.seq['num']];
    currUser["fold"] = true;
    gamersArr.$save(currUser);
    next();
  }

  // only accessable when my turn
  $scope.raise = function(){
    texasRef.child("pots").transaction(function(currentPots){
      return {jackpot: parseInt(currentPots.jackpot) + parseInt(me.raise)};
    }, function(error){
        $scope.me.chip = parseInt($scope.me.chip) + parseInt(me.raise);
        $scope.me.stake = parseInt($scope.me.stake) - parseInt(me.raise);
        $scope.me.raise = 0;
        if(! error){
          // next();
        }     
    }) 
  } 
})





.controller('AccountCtrl', function($scope, $state, AuthService) {
  $scope.logout = function(){
    AuthService.logout(function(){
      $state.go("login");
    })
  }
});
