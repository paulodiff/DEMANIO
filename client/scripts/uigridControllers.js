'use strict';

/* Controllers */

//angular.module('myApp.controllers', [])
angular.module('myApp.controllers')

.controller('UiGridCtrl', 
            ['$rootScope','$scope', '$http', '$state', '$location','uiGridConstants', '$filter', 'Session', '$log', '$timeout','ENV','$q', '$interval','UtilsService','ProfileService','PostaService','AlertService','dialogs',
     function($rootScope,  $scope,   $http,  $state,   $location,  uiGridConstants ,  $filter,   Session,   $log,   $timeout,   ENV,  $q,   $interval,  UtilsService,  ProfileService,  PostaService , AlertService, dialogs ) {
    
  $log.info('UiGridCtrl ... loading ... ');                                 
  
  
  $scope.totalPages = 0;
  $scope.itemsCount = 0;
  $scope.currentPage = 1; 
  $scope.currentItemDetail = null;
  $scope.totalItems = 0;
  $scope.pageSize = 100; // impostato al massimo numero di elementi
  $scope.startPage = 0;         
  $scope.openedPopupDate = false;    
  $scope.utentiList = [];
  $scope.id_utenti_selezione = 0;        
  $scope.items = [];
  $scope.loadMoreDataCanBeLoaded = true;
  $scope.msg = {};

  $scope.cdc= [];
  $scope.cdcStampe = [];

  //console.log($scope.cdcStampe);
  //console.log($scope.cdc);

  $scope.model = {};
  $scope.model.selectedCdc = {};
  $scope.model.mostraTutto = false;
  
  var  MyeditDropdownOptionsArray = [
            { id: 'P01 - POSTA ORDINARIA', name: 'P01 - POSTA ORDINARIA' },
            { id: 'P02 - PIEGHI DI LIBRI', name: 'P02 - PIEGHI DI LIBRI' },
            { id: 'P03 - POSTA INTERNAZIONALE', name: 'P03 - POSTA INTERNAZIONALE' },
            { id: 'P04 - POSTA TARGHET (ex STAMPE)', name: 'P04 - POSTA TARGHET (ex STAMPE)' },
            { id: 'R01 - RACCOMANDATA A/R', name: 'R01 - RACCOMANDATA A/R' },
            { id: 'R02 - RACCOMANDATA ORDINARIA', name: 'R02 - RACCOMANDATA ORDINARIA' },
            { id: 'R03 - ACC. INTERNAZIONALI', name: 'R03 - RACC. INTERNAZIONALI' },
            { id: 'AG1 - ATTI GIUDIZIARI', name: 'AG1 - ATTI GIUDIZIARI' }
        ];

  var elencoTipiSpedizione = MyeditDropdownOptionsArray;
  
  $scope.elencoTipoPosta = [];

  angular.copy(MyeditDropdownOptionsArray,$scope.elencoTipoPosta);

  $scope.elencoTipoPosta.unshift({ id: 'P00 - TUTTI TIPI POSTA', name: 'P00 - TUTTI TIPI POSTA' });

  $scope.model.dataStampa = new Date();
  $scope.model.tipoPostaStampa = { id: 'P00 - TUTTI TIPI POSTA', name: 'P00 - TUTTI TIPI POSTA' };
  $scope.model.cdcStampa = {   codice: "0000",    cdc: "0000 - TUTTI i centri di costo"  };
  // $scope.model.matricolaStampa = 'DEMO';



  $scope.today = moment().format('DD/MM/YYYY');
  $scope.model.dataStampaPrincipale = new Date();
  $scope.todayYYYMMDD = moment().format('YYYYMMDD');

  var nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
 
  $scope.gridOptions = {};
  $scope.gridOptions = {
    enableSorting: true,
    enableFiltering: true,
    enableGridMenu: true,
    enableRowSelection: true,
    enableSelectAll: true,
    showGridFooter:true,
    columnDefs: [
      { name: 'posta_id', visible: false, enableCellEdit: false },
      { name: 'cdc', visible: true, enableCellEdit: false,  width: '5%', enableFiltering: false },
      { name: 'Tipo', 
        field:  'tipo_spedizione',
        displayName: 'Tipo', 
        editableCellTemplate: 'ui-grid/dropdownEditor', 
        width: '20%',
        // cellFilter: 'mapTipoSpedizione', 
        editDropdownValueLabel: 'name', 
        editDropdownOptionsArray: MyeditDropdownOptionsArray,
        enableFiltering: false
    },
      { name: 'Protocollo', field: 'protocollo', enableFiltering: true },
      { name: 'Destinatario',  width: '20%', field: 'destinatario_denominazione', enableFiltering: true },
      { name: 'Città', field: 'destinatario_citta', enableFiltering: true },
      { name: 'Via', field: 'destinatario_via', enableFiltering: true },
      { name: 'CAP',  width: '8%', field: 'destinatario_cap', enableFiltering: false },
      { name: 'Prov',  width: '5%', field: 'destinatario_provincia', enableFiltering: false},
      { name: 'BarCode', field: 'barCode', enableSorting: true, enableCellEdit: true, visible: false },
      { name: 'Verbale', field: 'verbale', enableSorting: true, enableCellEdit: true, visible: false },
      { name: 'Note', field: 'note', enableSorting: true, enableCellEdit: true, visible: false }
    ],
    exporterPdfDefaultStyle: {fontSize: 9},
    exporterPdfTableStyle: {margin: [5, 5, 5, 5]},
    exporterPdfTableHeaderStyle: {fontSize: 8, bold: true, italics: true, color: 'black'},
    exporterPdfHeader: function ( currentPage, pageCount ) {
      return { text: 'Stampa elenco ...' + $scope.user.userid, style: 'headerStyle' };
    },
    exporterPdfFooter: function ( currentPage, pageCount ) {
      return { text: currentPage.toString() + ' of ' + pageCount.toString() + $scope.user.userid, style: 'footerStyle' };
    },
    exporterPdfCustomFormatter: function ( docDefinition ) {
      docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
      docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
      return docDefinition;
    }
    //,onRegisterApi: function( gridApi ) {
    //  $scope.grid1Api = gridApi;
    //}
  };

  $scope.gridOptions.multiSelect = true;
 

  // gridCDC
  $scope.gridOptionsCDC = {
    enableSorting: true,
    enableFiltering: true,
    enableGridMenu: true,
    enableRowSelection: true,
    enableSelectAll: true,
    showGridFooter:true,
    columnDefs: [
      { name: 'id', visible: false, enableCellEdit: false },
      { name: 'codice', visible: true, enableCellEdit: true, width: '20%'  },
      { name: 'cdc', visible: true, enableCellEdit: true, width: '80%'   }
    ],
    //,onRegisterApi: function( gridApi ) {
    //  $scope.grid1Api = gridApi;
    //}
  };


  // inizializzazione dati controller

  var sourceData =  [
    {
      'posta_id':UtilsService.getTimestampPlusRandom(),
      'tipo_spedizione': 'P01 - POSTA ORDINARIA',
      'destinatario_denominazione':'da compilare',
      'destinatario_citta':'da compilare',
      'destinatario_via':'da compilare',
      'destinatario_cap':'da compilare',
      'destinatario_provincia':'da compilare',
      'note':'da compilare'
    }
  ];

  console.log('uiGrid: loading data ....');

   ProfileService.getProfile()
    .then(function (res) {
      $log.info('#get profile data');
      $log.info(res.data);
      $scope.user = res.data;

      $scope.model.matricolaStampa = $scope.user.name;

      var options = {
        dataStampaTxt: $scope.todayYYYMMDD,
        matricolaStampa: $scope.user.userid
      };

      return PostaService.getPosta(options);
    })
    .then(function (res) {
        $log.info('#get Posta data');
        $scope.gridOptions.data = res.data;
        $log.info(res);

        return PostaService.getCDC();
    })
    .then(function (res) {
        $log.info('#get CDC data');
        $log.info(res);
        $scope.cdc = res.data;
        $scope.gridOptionsCDC.data = res.data;
        angular.copy($scope.cdc,$scope.cdcStampe);

        $scope.cdcStampe.unshift({
          "id":"0000",
          "codice": "0000",
          "cdc": "0000 - TUTTI i centri di costo"
        });

    })
    .catch(function(response) {
            $log.error(response);
            AlertService.displayError(response);
            $state.go('login');
    });

   
  // saveRow ------------------------------------------------------------------------------------

  $scope.saveRow = function( rowEntity ) {
     console.log('saveRow....');
    // create a fake promise - normally you'd use the promise returned by $http or $resource
    var promise = $q.defer();
    $scope.gridApi.rowEdit.setSavePromise( rowEntity, promise.promise );
 
    PostaService.updatePosta(rowEntity)
    .then(function (res) {
        $log.debug(res);
        promise.resolve();
    })
    .catch(function(response) {
        promise.reject();
        $log.debug(response);
        AlertService.displayError(response);
    });

  };
 
  $scope.gridOptions.onRegisterApi = function(gridApi){
    //set gridApi on scope
    $scope.gridApi = gridApi;
    gridApi.rowEdit.on.saveRow($scope, $scope.saveRow);
    gridApi.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
            $scope.msg.lastCellEdited = 'edited row id:' + rowEntity.id + ' Column:' + colDef.name + ' newValue:' + newValue + ' oldValue:' + oldValue ;
            $scope.$apply();
    });
    gridApi.selection.on.rowSelectionChanged($scope,function(row){
        var msg = 'row selected ' + row.isSelected;
        $log.log(row);
        $log.log(msg);
      });

  };

// changeUserType ---------------------------------------------------------------------------------

$scope.changeUserView = function(){
  console.log('changeUserView .....');
  //$scope.model.mostraTutto = !$scope.model.mostraTutto;
  console.log($scope.model.mostraTutto);
  console.log($scope.user);

  $scope.ricaricaDati();

};


// ricaricaDati ------------------------------------------------------------------------------------

  $scope.ricaricaDati = function() {
    console.log('#ricaricaDati#');

    console.log($scope.model.dataStampaPrincipale);

    if ($scope.model.dataStampaPrincipale) {
      $scope.todayYYYMMDD = moment($scope.model.dataStampaPrincipale).format('YYYYMMDD');
    } else {
      $scope.todayYYYMMDD = '%';
    }
  
    var options = {
      dataStampaTxt: $scope.todayYYYMMDD,
      //matricolaStampa: $scope.user.userid
    };

    // se non è abilitato il mostraTutto filtro per matricola
    if(!$scope.model.mostraTutto){
      options.matricolaStampa = $scope.user.userid
    }

    $scope.model.matricolaStampa = $scope.user.userid;

   console.log(options);

    PostaService.getPosta(options)
      .then(function (res) {
        $scope.gridOptions.data = res.data;
        $log.info(res);
        // $scope.user = res.data.user;
      })
      .catch(function(response) {
        $log.error(response);
        AlertService.displayError(response);
    });

  };

// addData ------------------------------------------------------------------------------------


  $scope.addData = function(){
    console.log('Add2------------Data');

    if (angular.equals($scope.model.selectedCdc,{})){
      AlertService.displayError({
        data: {
          title: 'Manca il centro di costo di riferimento',
          message:'Selezionare un Centro di Costo dalla lista'
        },
        status : 498
      });
      return;
    }

    AlertService.createDialog('templates/postaDialogForm.html','customDialogCtrl',MyeditDropdownOptionsArray)
    .then(function(dialogData){
      console.log(dialogData);
      console.log('Adding data ....');

      var n = $scope.gridOptions.data.length + 1;

      var newItem  = {
        'posta_id': UtilsService.getTimestampPlusRandom(),
        'cdc': $scope.model.selectedCdc.codice,
        'protocollo':dialogData.Protocollo,
        'tipo_spedizione':dialogData.tipoPostaStampa.id,
        'destinatario_denominazione':dialogData.Destinatario,
        'destinatario_citta':dialogData.Citta,
        'destinatario_via':dialogData.Via,
        'destinatario_cap':dialogData.Cap,
        'destinatario_provincia':dialogData.Provincia,
        'barCode' : dialogData.BarCode ? dialogData.BarCode : '',
        'verbale' : dialogData.Verbale ? dialogData.Verbale : '',
        'note': dialogData.Note ? dialogData.Note : ''
      };

      console.log(dialogData);
      console.log('Saving ..... ');

      PostaService.addPosta(newItem)
      .then(function (res) {
        $scope.gridOptions.data.push(newItem);
        $log.debug(res);
        // $scope.user = res.data.user;
      })
      .catch(function(response) {
        $log.error(response);
        AlertService.displayError(response);
      });


    },function(btn){
      console.log('Operazione annullata.');
    });
  

/*
    var dlg = dialogs.create('templates/postaDialogForm.html','customDialogCtrl',MyeditDropdownOptionsArray);

		dlg.result.then(function(name){
		  console.log('2');
		},function(){
			if(angular.equals($scope.name,''))
				//$scope.name = 'You did not enter in your name!';
        console.log('1');
      });

*/

	}; // end addData

  

  $scope.addData_OLD = function() {
    console.log('Add------------Data');
    console.log($scope.model.selectedCdc);

    if (angular.equals($scope.model.selectedCdc,{})){
      AlertService.displayError({
        data: {
          title: 'Selezionare una ed una sola riga per la cancellazione!',
          message:'Selezionare una ed una sola riga per la cancellazione!'
        },
        status : 499
      });
      return;
    }

    var n = $scope.gridOptions.data.length + 1;

    var newItem  = {
      'posta_id': UtilsService.getTimestampPlusRandom(),
      'cdc': $scope.model.selectedCdc.codice,
      'protocollo':'0000/000000',
      'tipo_spedizione':'P01 - POSTA ORDINARIA',
      'destinatario_denominazione':'DESTINATARIO',
      'destinatario_citta':'CITTA',
      'destinatario_via':'VIA XX',
      'destinatario_cap':'00000',
      'destinatario_provincia':'XX',
      'note':''
    };

    PostaService.addPosta(newItem)
      .then(function (res) {
        $scope.gridOptions.data.push(newItem);
        $log.debug(res);
        // $scope.user = res.data.user;
      })
      .catch(function(response) {
        $log.error(response);
        AlertService.displayError(response.data.title, response.data.message);
      });
  };

// removeRow ------------------------------------------------------------------------------------

  $scope.removeRow = function() {
    console.log('Remove Row....');
    //if($scope.gridOpts.data.length > 0){
       // $scope.gridOptions.data.splice(0,1);
    // console.log($scope.gridApi.selection.getSelectedCount());
    // console.log($scope.gridApi.selection.getSelectedRows());

    var arrayCalls = [];

    if ( $scope.gridApi.selection.getSelectedCount() > 0 ) {
      $log.log('.... .... '); 
      var selectedRows = $scope.gridApi.selection.getSelectedRows()

      // console.log(selectedRows);

      selectedRows.forEach(function(obj){
        console.log(obj.posta_id);

        
        $scope.gridOptions.data.forEach(function(gridItem, index){
          console.log(gridItem.posta_id, obj.posta_id);
          if (gridItem.posta_id === obj.posta_id) {
        
            console.log(gridItem.posta_id + 'REMOVE!' + index);

            var url2post = $rootScope.base_url +  '/postamgr/posta/' + obj.posta_id;
            console.log(url2post);

            arrayCalls.push(PostaService.deletePosta(obj.posta_id));
            
          };
        });
      });

      $q.all(arrayCalls)
        .then(function(values) {
          console.log('Eliminati....');
          console.log(values);

          var options = {
              dataStampaTxt: $scope.todayYYYMMDD,
              matricolaStampa: $scope.user.userid
          };

          PostaService.getPosta(options)
          .then(function (res) {
            $scope.gridOptions.data = res.data;
            $log.info(res);
            // $scope.user = res.data.user;
          })
          .catch(function(response) {
            $log.error(response);
            AlertService.displayError(response);
          });
        })
        .catch(function(response) {
              $log.error(response);
              AlertService.displayError(response);
				});
     
    } else {
      AlertService.displayError({
        data: {
          title: 'Eliminazione dato non possibile',
          message:'Selezionare almeno una riga per la cancellazione!'
        },
        status : 499
      });
      $log.log('No rows selected!:' + $scope.gridApi.selection.getSelectedCount());
    }

    //}
  };

//   addDataCDC

$scope.addDataCDC = function(){
  console.log('addDataCDC');
  console.log($scope.model);


  if($scope.model.CodiceCDC && $scope.model.DescrizioneCDC) {

    AlertService.displayConfirm('Confermi inserimento', 'Vuoi procedere?')
    .then(function(btn){
      console.log('YES');

      var newItem = {
        codice: $scope.model.CodiceCDC,
        cdc: $scope.model.DescrizioneCDC
      };

      PostaService.addCDC(newItem)
      .then(function (res) {
        $scope.gridOptionsCDC.data.push(newItem);
        $log.debug(res);
        // $scope.user = res.data.user;
      })
      .catch(function(response) {
        $log.error(response);
        AlertService.displayError(response);
      });


    },function(btn){
      console.log('NO');
    });

  } else {
    AlertService.displayInfo('Valori non validi', 'CDC e Descrizione devono avere un valore');
  }

  // addPostaCDC

  // ricarica PostaCDC (anche in alto)

};

// EXPORT PDF  ------------------------------------------------------------------------------------

  $scope.exportPdf = function(){

    console.log('Export PDF ------------------------  ');
    console.log($scope.model);

    // get dati dal form

    $scope.model.cdcStampaTxt = $scope.model.cdcStampa.id;
    $scope.model.tipoPostaStampaTxt = $scope.model.tipoPostaStampa.id;
    $scope.model.dataStampaTxt = moment($scope.model.dataStampa).format('YYYYMMDD');

    // console.log(moment($scope.model.dataStampa).format('YYYYMMDD'));
    
    var contenutoStampa = [];

    console.log('getPosta ... recupero i dati');

    PostaService.getPosta($scope.model)
      .then(function (res) {
        console.log('dati assegnati alla griglia ....');
        $scope.gridOptions.data = res.data;
        $log.info(res);

        // selezione dei dati
        var arraySelezione = [];
        var arraySelezioneTipi = [];

        elencoTipiSpedizione.forEach(function(obj){ 
          console.log('controllo tipo posta : ' + obj.id);
          var elenco = $filter('filter')(res.data, {tipo_spedizione: obj.id }); 
          console.log(elenco.length);
          if(elenco.length > 0){
            console.log('carico arraySelezione e Tipi');
            arraySelezione.push(elenco);
            arraySelezioneTipi.push(obj.id);
          }
        })

        console.log(arraySelezioneTipi);

        var maxPagina = arraySelezione.length;
        console.log(maxPagina);

        // per ogni tipologia di atto preparo la tabella della stampa

        var numeroPagina = 1;
        arraySelezione.forEach(function(item){ 
         
          var elencoTabellare = [];
          var progressivo = 1;
          var tableWidhts = [];
          
          // se il tipo posta è AG1 - ATTI GIUDIZIARI allora la costruzione della tabella è diversa

          console.log(arraySelezioneTipi[numeroPagina-1]);

          if ( arraySelezioneTipi[numeroPagina-1] == 'AG1 - ATTI GIUDIZIARI') {
            elencoTabellare.push([ 'Prog.','Codice a Barre','Verbale','Note' , 'Protocollo', 'Destinatario', 'Destinazione', 'Cdc' ]);  
            tableWidhts = [ 'auto', 'auto', 'auto', 'auto','auto','*','*','auto' ];

            item.forEach(function(obj){
              elencoTabellare.push([
                    {text:progressivo++, fontSize:10}, 
                    {text:obj.barCode, fontSize:10}, 
                    {text:obj.verbale, fontSize:10}, 
                    {text:obj.note, fontSize:10}, 
                    {text:obj.protocollo, fontSize:10},
                    {text:obj.destinatario_denominazione, fontSize:10},
                    {text:obj.destinatario_via + ' - ' + obj.destinatario_cap + ' - ' +  obj.destinatario_citta + ' - ' + obj.destinatario_provincia, fontSize:10},
                    {text:obj.cdc, fontSize:10}
              ]);
            });

          } else {
            elencoTabellare.push([ 'Prog.', 'Protocollo', 'Destinatario', 'Destinazione', 'Cdc' ]);
            tableWidhts = [ 'auto', 'auto', '*', '*','auto' ];
            
            item.forEach(function(obj){
              elencoTabellare.push([
                    {text:progressivo++, fontSize:10}, 
                    {text:obj.protocollo, fontSize:10},
                    {text:obj.destinatario_denominazione, fontSize:10},
                    {text:obj.destinatario_via + ' - ' + obj.destinatario_cap + ' - ' +  obj.destinatario_citta + ' - ' + obj.destinatario_provincia, fontSize:10},
                    {text:obj.cdc, fontSize:10}
              ]);
            });
          }

          
          

          var tabellaStampa =
          {
            table: {
              // headers are automatically repeated if the table spans over multiple pages
              // you can declare how many rows should be treated as headers
              headerRows: 1,
              widths: tableWidhts,
              body: elencoTabellare
            }
          };

            contenutoStampa.push( { text: 'Comune di Rimini ' + $scope.model.matricolaStampa, fontSize: 15 } );
            contenutoStampa.push( { text: 'Matricola: ' + $scope.model.matricolaStampa, fontSize: 12 } );
            // contenutoStampa.push( { text: $scope.model.matricolaStampa, fontSize: 12, bold: true, margin: [0, 0, 0, 8] });
            contenutoStampa.push( { text: 'Gestione Posta del ' + moment($scope.model.dataStampa).format('DD/MM/YYYY'), fontSize: 12 } );
            contenutoStampa.push( { text: 'Tipo Posta : ' + arraySelezioneTipi[numeroPagina-1], fontSize: 12 } );
            contenutoStampa.push(tabellaStampa);
            contenutoStampa.push({ text: 'Totale: ' + item.length, fontSize: 12, bold: true, margin: [0, 0, 0, 8] });

            if(numeroPagina == maxPagina){
              contenutoStampa.push({ text: '  ', fontSize: 12, bold: true, margin: [0, 0, 0, 8] });
            }else{
              contenutoStampa.push({ text: ' ', fontSize: 12, bold: true, pageBreak: 'after', margin: [0, 0, 0, 8] });
            }

  
            console.log(numeroPagina,maxPagina);
         
            numeroPagina++;
       });


       var docDefinition = { 
       pageSize: 'A4',
       pageOrientation: 'landscape',
       pageMargins: [ 30, 30, 30, 30 ],
       footer: function(currentPage, pageCount) {  
         return    { text: 'pagina ' + currentPage.toString() + ' di ' + pageCount, alignment: (currentPage % 2) ? 'left' : 'right', margin: [8, 8, 8, 8] }
        },
       header: function(currentPage, pageCount) {
          // you can apply any logic and return any valid pdfmake element

          return { text: 'Elenco posta stampato il: ' + $scope.today, fontSize: 8, alignment: (currentPage % 2) ? 'left' : 'right', margin: [8, 8, 8, 8] };
       },
       content: [contenutoStampa]
      };


      console.log(docDefinition);

      pdfMake.createPdf(docDefinition).open();


        // $scope.user = res.data.user;
      })
        .catch(function(response) {
        $log.error(response);

        /*
        AlertService.displayError({
        data: {
          title: 'Stampa bloccata da POPUP - operazione da eseguire una sola volta',
          message:'Seguire le indicazioni per sbloccare i popup come indicato nella pagina di accesso della intranet http://intranet.comune.rimini.it/gestione-posta/'
        },
        status : 499
      });*/




 AlertService.createDialog('templates/popupDialogForm.html','customDialogCtrl',MyeditDropdownOptionsArray)
    .then(function(dialogData){
      console.log(dialogData);
      console.log('Adding data ....');

      console.log(dialogData);
      console.log('Saving ..... ');


    },function(btn){
      console.log('Operazione annullata.');
    });
























      });
    

    // dati per la stampa

     var docDefinition = { 
       pageSize: 'A4',
       pageMargins: [ 10, 10, 10, 10 ],
       footer: function(currentPage, pageCount) { 
              return currentPage.toString() + ' of ' + pageCount; },
       header: function(currentPage, pageCount) {
          // you can apply any logic and return any valid pdfmake element

          return { text: 'simple text', alignment: (currentPage % 2) ? 'left' : 'right' };
       },
       content: [
	        { text: 'Comune di Rimini', fontSize: 15 },
          { text: 'Gestione Posta del 00/00/0000 - M99999', fontSize: 12 },
          { text: 'Tipo Posta : TIPO', fontSize: 12 },
          {
            table: {
              // headers are automatically repeated if the table spans over multiple pages
              // you can declare how many rows should be treated as headers
              headerRows: 1,
              widths: [ 'auto', 'auto', 'auto', 'auto','auto' ],
              body: [
                [ 'Prog.', 'Protocollo', 'Destinatario', 'Destinazione', 'Cdc' ],
                [ '1', 'Value 2', 'Value 3', 'Value 4' ],
                [ '2', 'Val 2', 'Val 3', 'Val 4' ]
              ]
            }
          },
          { text: 'Totale: XX', fontSize: 14, bold: true, margin: [0, 0, 0, 8] },
          { text: 'Pagina: 1 di NN', fontSize: 12, bold: true, pageBreak: 'after', margin: [0, 0, 0, 8] },
          
          /*pag 2*/


	        { text: 'Comune di Rimini (pag 2 di NN) - M99999', fontSize: 15 },
          { text: 'Posta del       : 00/00/0000', fontSize: 12 },
          { text: 'Centro di costo : CCCCCCC', fontSize: 12 },
          { text: 'Tipo            : P01-SDSSSSSS', fontSize: 12 },

     

          {
            table: {
              // headers are automatically repeated if the table spans over multiple pages
              // you can declare how many rows should be treated as headers
              headerRows: 1,
              widths: [ 'auto', 'auto', 100, '*' ],
              body: [
                [ 'N.', 'Destinatario', 'Third', 'The last one' ],
                [ '1', 'Value 2', 'Value 3', 'Value 4' ],
                [ '2', 'Val 2', 'Val 3', 'Val 4' ]
              ]
            }
          },
          { text: 'Totale: XX', fontSize: 14, bold: true, margin: [0, 0, 0, 8] },
          { text: 'Pagina: 2 di NN', fontSize: 12, bold: true, pageBreak: 'after', margin: [0, 0, 0, 8] },

	]
      };

  }

  // EXPORT EXCEL --------------------------------------------------------------------------------------------------

  $scope.exportExcel = function(){

    console.log('exportExcel PDF ------------------------  ');
    
    // imposta i dati

    $scope.model.tipoPostaStampaTxt = $scope.model.tipoPostaStampa.id;
    $scope.model.dataStampaTxt = moment($scope.model.dataStampa).format('YYYYMMDD');

    console.log($scope.model);

    var options = {
        dataStampaTxt: $scope.todayYYYMMDD,
        tipoPostaStampaTxt: $scope.model.tipoPostaStampa.id
    };

    console.log(options);

    PostaService.getPosta(options)
    .then(function (res) {
        $log.info(res);

        // selezione dei dati
        var arraySelezione = [];
        var arraySelezioneTipi = [];

        elencoTipiSpedizione.forEach(function(obj){ 
          console.log(obj.id);
          var elenco = $filter('filter')(res.data, {tipo_spedizione: obj.id }); 
          console.log(elenco);
          if(elenco.length > 0){
            arraySelezione.push(elenco);
            arraySelezioneTipi.push(obj.id);
          }
    });
        
    console.log(arraySelezioneTipi);
    console.log(arraySelezione);
        
    var ws_name = "DISTINTA RACCOMANDATE AR";

    /* make worksheet 
      var ws_data = [
	      [ "S", "h", "e", "e", "t", "J", "S" ],
	      [  1 ,  2 ,  3 ,  4 ,  5 ]
      ];
      var ws = XLSX.utils.aoa_to_sheet(ws_data);
      wb.SheetNames.push(ws_name);
      wb.Sheets[ws_name] = ws;
      ws.A1 = 'SALUTI';
      var wopts = { bookType:'xlsx', bookSST:false, type:'binary' };
    */

    var workbook = { SheetNames:[], Sheets:{} };

    /* make worksheet */
    var ws_data = [
      [ "", "CODICE CLIENTE X01125", "", "", "DATA RITIRO:", "" ],
      [  "" ,  "" ,  "" ,  ""  ],
      [ "LASCIARE VUOTO","DESTINATARIO","INDIRIZZO","CAP","CITTA'","PROVINCIA","CDC"]
    ];

arraySelezione.forEach(function(item){
  item.forEach(function(obj){
    ws_data.push([
      "",
      obj.destinatario_denominazione,
      obj.destinatario_via,
      obj.destinatario_cap,
      obj.destinatario_citta,
      obj.destinatario_provincia,
      obj.cdc,
      obj.tipo_spedizione,
      obj.userid,
      obj.userDisplayName,
      obj.userEmail,
      obj.id,
      $scope.todayYYYMMDD
      //obj.posta_id
    ]);
  });
});


var ws = XLSX.utils.aoa_to_sheet(ws_data)

workbook.SheetNames.push(ws_name);
workbook.Sheets[ws_name] = ws;

/* bookType can be any supported output type */
var wopts = { bookType:'xlml', bookSST:false, type:'binary' };

var wbout = XLSX.write(workbook,wopts);

function s2ab(s) {
  var buf = new ArrayBuffer(s.length);
  var view = new Uint8Array(buf);
  for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
}

/* the saveAs call downloads a file on the local machine */
saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), $scope.todayYYYMMDD + "-estrazione-posta.xls");


    })
    .catch(function(response) {
          $log.error(response);
          AlertService.displayError(response);
        });
  }

 
// ############### ShowIntro

$scope.showHelp = function () {
  console.log('ShowHelp ....');

      var intro = introJs();
        intro.setOptions({
            nextLabel: 'Prossimo',
            prevLabel: 'Precedente',
            skipLabel: 'Salta',
            doneLabel: 'Fine',
            steps: [
              { 
                intro: "Guida rapida per l'inserimento di una riga"
              },
              {
                element: '#select1',
                intro: "Selezionare un centro di costo",
                position: 'bottom'
              },
              {
                element: '#addData',
                intro: "Aggiunge una riga.",
                position: 'bottom'
              },              
              {
                intro: 'Guida terminata.'
              }
            ]
          });

      
    intro.start();
}


$scope.showHelpRicerca = function () {
  console.log('ShowHelp ....');

      var intro = introJs();
        intro.setOptions({
            nextLabel: 'Prossimo',
            prevLabel: 'Precedente',
            skipLabel: 'Salta',
            doneLabel: 'Fine',
            steps: [
              { 
                intro: "Guida rapida per la ricerca"
              },
              {
                element: '#select1',
                intro: "Selezionare una data o cancellarla per ottenere tutti i record",
                position: 'bottom'
              },
              {
                element: '#addData',
                intro: "Aggiunge una riga.",
                position: 'bottom'
              },              
              {
                intro: 'Guida terminata.'
              }
            ]
          });

      
    intro.start();
}



// #########################################  DEBUG #############################################################

  $scope.showHideAtti = function () {
    console.log('showHideAtti------------------------------------');
    // console.log($scope.gridOptions.data);

    var pos = $scope.gridOptions.columnDefs.map(function (e) { return e.field; }).indexOf('verbale');
    if (pos) $scope.gridOptions.columnDefs[pos].visible = !$scope.gridOptions.columnDefs[pos].visible;

    var pos = $scope.gridOptions.columnDefs.map(function (e) { return e.field; }).indexOf('barCode');
    if (pos) $scope.gridOptions.columnDefs[pos].visible = !$scope.gridOptions.columnDefs[pos].visible;

    var pos = $scope.gridOptions.columnDefs.map(function (e) { return e.field; }).indexOf('note');
    if (pos) $scope.gridOptions.columnDefs[pos].visible = !$scope.gridOptions.columnDefs[pos].visible;
    
    //var pos = $scope.gridOptions.columnDefs.map(function (e) { return e.field; }).indexOf('protocollo');
    //if (pos) $scope.gridOptions.columnDefs[pos].enableFiltering = true;
    
/*
    for ( var i = 0, j = $scope.gridOptions[$index].columnDefs.length; i < j; i += 1 ) {
       $scope.gridOptions[$index].columnDefs[i].enableFiltering = true;
    }
*/
    //console.log($scope.gridOptions.enableFiltering);
    //$scope.gridOptions.enableFiltering = true;

    this.gridApi.grid.refresh();


    /*
    AlertService.displayConfirm('titolo','testo')
    .then(function(btn){
      console.log('YES');
    },function(btn){
      console.log('NO');
    });
    */


    

    /*
   
    ProfileService.getProfile()
    .then(function (res) {
      $log.info('#get profile data');
      $log.info(res.data);
      $scope.user = res.data;

      var options = {
        dataStampaTxt: $scope.todayYYYMMDD,
        matricolaStampa: $scope.user.userid
      };

      return PostaService.getPosta(options);
    })
    .then(function (res) {
        $log.info('#get Posta data');
        // dialogs.notify('ok','Profile has been updated');
        $scope.gridOptions.data = res.data;
        $log.info(res);

        return PostaService.getCDC();
    })
    .then(function (res) {
        $log.info('#get CDC data');
        // dialogs.notify('ok','Profile has been updated');
        $log.info(res);
    })
    .catch(function(response) {
            $log.error(response);
            // var dlg = dialogs.error(response.data.message, response.status);
            // $state.go('login');
    });

    */


    // data1 = angular.copy(origdata1);
    // data2 = angular.copy(origdata2);
 
    // $scope.gridOpts.data = data1;
    // $scope.gridOpts.columnDefs = columnDefs1;
  }

  // $scope.gridOptions.data = sourceData;

  /*
  $http.get(  $rootScope.base_url +  '/helpdesk/getList')
    .success(function(data) {
      console.log(data);
      $scope.gridOptions.data = data;
      //$scope.gridOptions2.data = data;
    });                  
  */                             
}])

// ######################################################################## DialogCtrl

.controller('customDialogCtrl',
           // ['$scope','$modalInstance', 'data',
    function($location, $rootScope, $scope , $uibModalInstance ,  data  ){
		  
      console.log('customDialogCtrl ....');
      console.log($location.absUrl());
      console.log($location.path());
      
      //-- Variables --//
      $scope.elencoTipoPosta = data;

      $scope.modal = {};
      $scope.modal.imgSource = $rootScope.base_url + 'images/popup-unlock.jpg';
      $scope.modal.tipoPostaStampa = data[0];
      $scope.modal.dataAttuale = moment().format('DD/MM/YYYY');;
      //-- Methods --//
      
      $scope.cancel = function(){
        $uibModalInstance.dismiss('Canceled');
      }; // end cancel
      
      $scope.save = function(){
        console.log($scope.modal);
        $uibModalInstance.close($scope.modal);
      }; // end save
      
      /*
      $scope.hitEnter = function(evt){
        if(angular.equals(evt.keyCode,13) && !(angular.equals($scope.user.name,null) || angular.equals($scope.user.name,'')))
          $scope.save();
      };
      */
    
}
//]
) // end controller(customDialogCtrl)


// ######################################################################## DialogCtrl

.controller('postaDashboardCtrl',
           // ['$scope','$modalInstance', 'data',
             ['$rootScope','$scope', '$http', '$state', '$location','uiGridConstants', '$filter', '$log', '$timeout','ENV','$q', '$interval','UtilsService','ProfileService','PostaService','AlertService',
     function($rootScope,  $scope,    $http,  $state,   $location,  uiGridConstants ,  $filter,     $log,     $timeout,   ENV,  $q,   $interval,  UtilsService,  ProfileService,  PostaService , AlertService ) {


      console.log('postaDashboardCtrl ....');
      
      //-- Variables --//
      

      $scope.model = {};
      $scope.model.daDataPosta = moment().set({
           'hour' : 0,
           'minute'  : 0, 
           'second' : 0
        }).subtract(1, 'month').toDate();
      $scope.model.aDataPosta = moment().set({
           'hour' : 23,
           'minute'  : 59, 
           'second' : 59
        }).toDate();
      //-- Methods --//
      
      $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
      $scope.series = ['Series A', 'Series B'];
      $scope.data = [
        [65, 59, 80, 81, 56, 55, 40],
        [28, 48, 40, 19, 86, 27, 90]
      ];
      $scope.onClickCdcCount = function (points, evt) {  console.log(points, evt);   };
      $scope.onClickItemCount = function (points, evt) {  console.log(points, evt);   };
  
      $scope.labelsItemCount = [];
      $scope.dataItemCount = [];
      $scope.seriesItemCount = [];

      $scope.labelsCdcCount = [];
      $scope.dataCdcCount = [];
      $scope.seriesCdcCount = ['CDC'];

      $scope.labelsMatricoleCount = [];
      $scope.dataMatricoleCount = [];
      $scope.seriesMatricoleCount = ['MATRICOLE'];


      $scope.tableCdc = [];
      $scope.tableItem = [];
      $scope.tableMatricole = [];


      
      $scope.AggiornaDati = function(){
        console.log('AggiornaDati');
        console.log($scope.model);
        //AlertService.displayConfirm('adad','adad');
        // $scope.model.daDataPostaTxt = new Date('01/01/2017');
        // $scope.model.aDataPosta = new Date();
        // $scope.model.daDataPostaT = $scope.model.daDataPosta.getTime();
        // $scope.model.aDataPostaT = $scope.model.aDataPosta.getTime();
        console.log($scope.model);
        var options = $scope.model;
        
        PostaService.getPostaStats(options)
        .then(function (res) {
          //$scope.gridOptionsCDC.data.push(newItem);
          $log.info(res);

          // preparazione grafico multi serie

          $scope.labelsItemCount = [];
          $scope.dataItemCount = [];
          $scope.seriesItemCount = [];
          $scope.optionsItemCount = {
            legend: {
              display: true,
              labels: {
                fontColor: 'rgb(0, 0, 0)'
              }
            },
            scales: {
              xAxes: [{
                stacked: true,
              }],
              yAxes: [{
                stacked: true
              }]
            }
          };
          // $log.info('recupero serie e labels');
          res.data.StatsCountItem.forEach(function (item) {
            // $log.info(item);
            // nella serie metto il tipo_spedizione
            if ($scope.seriesItemCount.indexOf(item.tipo_spedizione) === -1) $scope.seriesItemCount.push(item.tipo_spedizione);

            // nella label metto la data
            if ($scope.labelsItemCount.indexOf(item.posta_id_cut) === -1) $scope.labelsItemCount.push(item.posta_id_cut);

            var posSerie = $scope.seriesItemCount.indexOf(item.tipo_spedizione);
            var posLabel = $scope.labelsItemCount.indexOf(item.posta_id_cut);
            $log.info(posSerie, posLabel);

            // $log.info('recupero serie e labels', posSerie, posLabel);
            if(!$scope.dataItemCount[posSerie]) $scope.dataItemCount[posSerie] = [];
            $scope.dataItemCount[posSerie][posLabel] = item.posta_id_count;
          });

          $log.info($scope.seriesItemCount.length);
          $log.info($scope.labelsItemCount.length);
          $log.info($scope.seriesItemCount);
          $log.info($scope.labelsItemCount);

          // $log.info('--analisi--');

          // inizializzazione a 0
          for(var i = 0; i < $scope.seriesItemCount.length; i++) {
            if(!$scope.dataItemCount[i]){
              // $log.info('1 non esiste assegno--analisi--');
              $scope.dataItemCount[i] = [];
            } else {
              // $log.info('2 esiste stampo');
              // $log.info($scope.dataItemCount[i]);
            }
            for(var j = 0; j < $scope.labelsItemCount.length; j++) {
              // $log.info('i,j esiste stampo',i,j);
              if(!$scope.dataItemCount[i][j]){
                // $log.info('3 non esiste assegno');
                $scope.dataItemCount[i][j] = 0;                  
              } else {
                // $log.info('4 esiste stampo');
                // $log.info($scope.dataItemCount[i][j]);
              }
            }
          }

          
  
          $log.info($scope.dataItemCount);
          
          
          $scope.labelsCdcCount = [];
          $scope.dataCdcCount = [];
          $scope.tableCdc = res.data.StatsCountCdc;
          res.data.StatsCountCdc.forEach(function (item) {
            // $log.info(item);
            $scope.labelsCdcCount.push(item.cdc);
            $scope.dataCdcCount.push(item.cdc_count);
          });
         

          $scope.labelsMatricoleCount = [];
          $scope.dataMatricoleCount = [];
          $scope.tableMatricole = res.data.StatsCountItem;
          res.data.StatsCountMatricole.forEach(function (item) {
            // $log.info(item);
            $scope.labelsMatricoleCount.push(item.userid);
            $scope.dataMatricoleCount.push(item.userid_count);
          });

          $scope.labelsTipiCount = [];
          $scope.dataTipiCount = [];
          $scope.tableTipi = res.data.StatsCountTipi;
          res.data.StatsCountTipi.forEach(function (item) {
            // $log.info(item);
            $scope.labelsTipiCount.push(item.tipo_spedizione);
            $scope.dataTipiCount.push(item.tipo_spedizione_count);
          });

          // $scope.user = res.data.user;
        })
        .catch(function(response) {
          $log.error(response);
          AlertService.displayError(response);
        });

      }; // end save
      
      
     }]) // end controller(customDialogCtrl)


.filter('mapTipoSpedizione', function() {
  var genderHash = {
    'P01 - POSTA ORDINARIA': 'P01 - POSTA ORDINARIA',
    'P02 - PIEGHI DI LIBRI': 'P02 - PIEGHI DI LIBRI',
    'P03 - POSTA INTERNAZIONALE': 'P03 - POSTA INTERNAZIONALE',
    'P04 - POSTA TARGHET (ex STAMPE)': 'P04 - POSTA TARGHET (ex STAMPE)',
    'R01 - RACCOMANDATA A/R': 'R01 - RACCOMANDATA A/R',
    'R02 - RACCOMANDATA ORDINARIA': 'R02 - RACCOMANDATA ORDINARIA',
    'AG1 - RACC. INTERNAZIONALI': 'AG1 - RACC. INTERNAZIONALI',
    'AG2 - ATTI GIUDIZIARI': 'AG2 - ATTI GIUDIZIARI'
  };
 
  return function(input) {
    if (!input){
      return '';
    } else {
      return genderHash[input];
    }
  };
});