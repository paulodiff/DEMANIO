angular.module('myApp.controllers')

  .controller('sid24pCtrl', 

           ['$scope', '$http', 'dialogs',  '$rootScope', 'AuthService', 'SseService', '$state','ENV', '$log', 'usSpinnerService','Upload',
    function($scope,   $http,  dialogs,     $rootScope,   AuthService,   SseService,   $state,  ENV ,  $log,   usSpinnerService,  Upload ) {

    
    $log.info('sid24pCtrl: startUp!');
    
    $scope.model = { progressValue : 22, name : 'oooook' };
    

    $scope.my_progressBarValue = 33;
    $scope.my_progressBarValue2 = 21;
    $scope.my_progressText = '';
    $scope.logOperazioni = 'nulla';

    $scope.my_progressBarFunction = function(){
        $log.info('sid24pCtrl: progressBarFunction',$scope.my_progressBarValue,$scope.my_progressBarValue2);
        $scope.my_progressBarValue = $scope.my_progressBarValue + 10;
        $scope.my_progressBarValue2 = $scope.my_progressBarValue2 + 10;
        $scope.my_progressText = $scope.my_progressBarValue2 + 10;
    }


    $scope.user = {};
    $scope.vm = {}; $scope.vm.model = {};
    $scope.vm.model.nomeRichiedente = 'Mario';
    $scope.vm.model.cognomeRichiedente = 'Rossi';

    $scope.maxProgressBar = 1000;
    $scope.currentProgressBar = 0;

    $scope.getProfile = function() {
        $log.info('sid24pCtrl: getProfile');
    };

    $scope.checkSse = function() {
        $log.info('sid24pCtrl: checkSse');
        $log.info(SseService.getChannelId());
    };

    $scope.testSse = function() {
        $scope.maxProgressBar = 1000;
        $scope.currentProgressBar = 0;
        $log.info('sid24pCtrl: uploadCsv');
        var fullApiEndpoint = $rootScope.base_url + '/' + ENV.apiDemanio + '/test/' + SseService.getChannelId(); 
        $log.info('sid24pCtrl: api : ' + fullApiEndpoint );

        return $http({ 
            url: fullApiEndpoint, 
            method: "GET"
          })
            .then(function (res) {
                $log.info('sid24pCtrl : setting data');
                $log.info(res.data);
                // $scope.user = res.data;
            })
            .catch(function(response) {
                console.log(response);
            });
    };

    $scope.uploadCsv = function () {

        var fullApiEndpoint = $rootScope.base_url + '/' + ENV.apiDemanio + '/updata/' + SseService.getChannelId(); 

        console.log('sid24pCtrl : uploadCsv POST');
        console.log(fullApiEndpoint);

       
        Upload.upload({
            url: fullApiEndpoint,
            method: 'POST',
            //files: vm.options.data.fileList
            //data: {files : upFiles, fields: vm.model  }
            data: {fields: $scope.vm.model  }
        }).then(function (resp) {
            console.log('Success ');
            console.log(resp);
            $scope.logOperazioni = resp.data.msg;

               //$rootScope.$broadcast('dialogs.wait.complete'); 
               // dialogs.notify('Richiesta correttamente pervenuta', resp.data);
               //vm.responseMessage = resp.data;
               //vm.bshowForm = false;
               // console.log(vm.responseMessage);
              //dialogs.error('500 - Errore server',response.data.message, response.status);
          
            //usSpinnerService.stop('spinner-1');
        }, function (resp) {
            $rootScope.$broadcast('dialogs.wait.complete');
            console.log('Error status: ' + resp.status);
            console.log(resp);


            /*
            if (resp.status == -1){
                vm.responseMessage.title = "Errore di connessione";
                vm.responseMessage.msg = "Verificare la connessione internet e riprovare la trasmissione";
                vm.responseMessage.code = 999;
            } else {
                vm.responseMessage = resp.data;
            }

            vm.bshowForm = false;
            // dialogs.error('Errore - ' + resp.status, resp.data.msg);
            console.log(vm.responseMessage);
            */
        }, function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            var _progress = progressPercentage;
            console.log('progress: ' + progressPercentage + '% ');
            if (progressPercentage < 100) {
              _progress = progressPercentage;
              // $scope.my_progressBarValue = _progress;
              $rootScope.$broadcast('dialogs.wait.progress',{'msg' : progressPercentage, 'progress' : _progress});
            }else{
              //$rootScope.$broadcast('dialogs.wait.complete');
              // $scope.my_progressBarValue = _progress;
              $rootScope.$broadcast('dialogs.wait.progress',{'msg' : 'Elaborazione in corso', 'progress' : _progress});
            }
        });


    };

    // aggancia il servizio dei messaggi per la chiamata

    $scope.tweets = SseService.getMessages(function(response) {
        $log.info('sid24pCtrl: tweets', response);
        var tweets = JSON.parse(response.data);
        // $log.info(tweets);
        $log.info('SSE log msg :',tweets.msg.itemN,tweets.msg.txt);
        
        //$scope.my_progressBarValue = tweets.msg.itemN;
        //if ( tweets.msg.txt ) $scope.my_progressText = tweets.msg.txt;

        $scope.$apply( function() {
            $scope.my_progressBarValue = tweets.msg.itemN;
            if ( tweets.msg.txt ) $scope.my_progressText = tweets.msg.txt;
    
        });
        // $scope.tweets = tweets;
    });



  }]);


 


