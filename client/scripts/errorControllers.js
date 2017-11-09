angular.module('myApp.controllers')

  .controller('errorMgrCtrl', 

           ['$scope', '$stateParams', '$http', 'dialogs',  '$rootScope', 'AuthService', 'SseService', 'DatabaseService', '$state','ENV', '$log', 'usSpinnerService','Upload',
    function($scope,   $stateParams, $http,  dialogs,     $rootScope,   AuthService,   SseService,  DatabaseService,  $state,  ENV ,  $log,   usSpinnerService,  Upload ) {

    
    $log.info('errorMgrCtrl: startUp!');
    $log.info($stateParams);

    $scope.data = $stateParams.response;
    
    $scope.model = { progressValue : 22, name : 'oooook' };
    

   
    $scope.user = {};
    $scope.vm = {}; $scope.vm.model = {}; $scope.vm.userForm = {};

    
    $scope.vm.model.nomeRichiedente = '';
    $scope.vm.model.cognomeRichiedente = '';

    $scope.maxProgressBar = 1000;
    $scope.currentProgressBar = 0;


  }]);


 


