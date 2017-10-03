/*

  Modulo gestione delle attività della gestione Demanio

*/ 

var express = require('express');
var moment = require('moment');
var router = express.Router();
var jwt = require('jwt-simple');
var fs = require('fs');
var fsExtra = require('fs-extra');
var spark = require('spark-md5');
var md5File = require('md5-file');
var ENV   = require('../config/config.js'); // load configuration data
var ENV_PROT   = require('../config/configPROTOCOLLO.js'); // load user configuration data
// var User  = require('../models/user.js'); // load configuration data
var utilityModule  = require('../models/utilityModule.js'); // load configuration data
var log = require('../models/loggerModule.js');
var async = require('async');
var databaseModule = require("../models/databaseModule.js");
var emitterBus = require("../models/emitterModule.js");
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var multiparty = require('multiparty');


module.exports = function(){

/* SAVING FILES  --------------------------------------------------------------------------------------------------------- */
function savingFiles(fileList, fieldsObj, reqId) {
    log.log2console('savingFiles');
    log.log2console(ENV_PROT.storageFolder);
    // var transactionId = req.body.fields.transactionId;
    var DW_PATH = ENV_PROT.storageFolder;
    var dir = DW_PATH + "/" + reqId;

    fieldsObj.files = [];

    try{
        // throw "TEST - File NOT FOUND Exception";

        if (!fs.existsSync(dir)){fs.mkdirSync(dir);}
        log.log2console(dir);
        Object.keys(fileList).forEach(function(name) {
            log.log2console('SAVING FILE:save: ' + name);

            var originalFilename = fileList[name][0].originalFilename;
            var destFile = dir + "/" + fileList[name][0].originalFilename;
            var sourceFile = fileList[name][0].path;
            log.log2console(sourceFile);
            log.log2console(destFile);
            //fs.renameSync(sourceFile, destFile);
            // fs.createReadStream(sourceFile).pipe(fs.createWriteStream(destFile));
            //fs.copySync(path.resolve(__dirname,'./init/xxx.json'), 'xxx.json');
            fsExtra.copySync(sourceFile, destFile);
            var hash2 = md5File.sync(destFile);
            log.log2console(destFile);
            log.log2console(hash2);

            fieldsObj.files.push({ 'name' : originalFilename , 'sourceFile' : sourceFile, 'destFile' : destFile});
        });

        // save metadata metadati
        // fieldsObj.userObj = userObj;
        var jsonFile = dir + "/" + reqId + ".txt";
        log.log2console(jsonFile);
        fs.writeFileSync(jsonFile, JSON.stringify(fieldsObj));
        
        log.log2console(fieldsObj);

        return true;

    } catch (e){
        log.log2console('#ERROR# savingFiles: ');
        log.log2console(e);
        log.log2console(reqId);
        // log2file.error('savingFiles:');
        // log2file.error(userObj.reqId);
        // log2file.error(e);
        return false;
    }
}

/* SANITIZE --------------------------------------------------------------------------------------------------------- */

function sanitizeInput(fieldList, fieldsObj,  reqId) {
    log.log2console('sanitizeInput');
    // var transactionId = req.body.fields.transactionId;
    var DW_PATH = ENV_PROT.storageFolder;
    // var dir = DW_PATH + "/" +  transactionId;
    var dir = DW_PATH + "/" + reqId;
    // var fieldsObj = {};

    fieldsObj.reqId = reqId;

    log.log2console(fieldList);

    Object.keys(fieldList).forEach(function(name) {
        log.log2console('got field named ' + name);

        switch(name) {
            case 'fields[nomeRichiedente]':
                fieldsObj.nomeRichiedente = fieldList[name][0];
                break;
            case 'fields[cognomeRichiedente]':
                fieldsObj.cognomeRichiedente = fieldList[name][0];
                break;
            case 'fields[emailRichiedente]':
                fieldsObj.emailRichiedente = fieldList[name][0];
                break;
            case 'fields[codiceFiscaleRichiedente]':
                fieldsObj.codiceFiscaleRichiedente = fieldList[name][0];
                break;
            case 'fields[cellulareRichiedente]':
                fieldsObj.cellulareRichiedente = fieldList[name][0];
                break;
            case 'fields[dataNascitaRichiedente]':
                fieldsObj.dataNascitaRichiedente = fieldList[name][0];
                break;                
            case 'fields[indirizzoRichiedente]':
                fieldsObj.indirizzoRichiedente = fieldList[name][0];
                break;
            case 'fields[cittaRichiedente]':
                fieldsObj.cittaRichiedente = fieldList[name][0];
                break;
            case 'fields[capRichiedente]':
                fieldsObj.capRichiedente = fieldList[name][0];
                break;
            case 'fields[oggettoRichiedente]':
                fieldsObj.oggettoRichiedente = fieldList[name][0];
                break;
            default:
                break;
        }

    });
    log.log2console(fieldsObj);
    return true;
}

router.get('/test/:sseId',  function(req, res) {
    log.log2console('DemanioMgr get /test : ', req.params.sseId);
    log.log2console('DemanioMgr emit beep:'+ req.params.sseId);
    
    emitterBus.eventBus.sendEvent('logMessage', { sseId: req.params.sseId, msg: 'ooook'});

    for(i = 0; i < 1000 ; i ++ ){
        emitterBus.eventBus.sendEvent('logMessage', { sseId: req.params.sseId, msg: { action: 'insert', itemN: i} });
    }

    return res.status(200).send(' OK '+ i);
});        

router.post('/updata/:sseId',  function(req, res) {
    log.log2console('DemanioMgr POST /updata : ', req.params.sseId);
    
    // richiesta di identificatore unico di transazione
    var reqId = utilityModule.getTimestampPlusRandom();
    var supportMsg = 'Support id:' + reqId + '';
    if(!req.params.sseId) {
        log.log2console('#ERROR# DemanioMgr:sseId NOT defined!');
        console.log(req.params);
    }

    emitterBus.eventBus.sendEvent('logMessage', { sseId: req.params.sseId, msg: { action: 'insert', itemN: 100, txt: 'Start operations'} });
    
    // emitterBus.eventBus.sendEvent('logMessage', { sseId: req.params.sseId, msg: 'ooook'});

    /*
    for(i = 0; i < 1000 ; i ++ ){
        emitterBus.eventBus.sendEvent('logMessage', { sseId: req.params.sseId, msg: { action: 'insert', itemN: i} });
    }
    */

    var objFilesList = {};
    var objFieldList = {};
    var objFieldSanitized = {};

    async.series([       
                    function(callback){
                        log.log2console('STEP-START:');
                        // emitterBus.eventBus.sendEvent('logMessage', { sseId: req.params.sseId, msg: 'ASYNC1'});
                        callback(null, 'STEP-START ok');
                    },
                    
                    function(callback) {
                        log.log2console('STEP-FORM-PARSING: form parsing');
                        emitterBus.eventBus.sendEvent('logMessage', { sseId: req.params.sseId, msg: { action: 'parsing', itemN: 200, txt: 'Form parsing'}});
                        var options = {  maxFilesSize: ENV_PROT.upload_size  };
                        var form = new multiparty.Form(options);
                        form.parse(req, 
                            function(err, fields, files) {
                                if(err){
                                    ErrorMsg = {
                                                    title: 'Check input error',
                                                    msg: 'Errore nella decodifica dei dati ricevuti. (MAXSIZE)' + supportMsg,
                                                    code : 455
                                                }
                                    log.log2console(err);
                                    callback(ErrorMsg, null);
                                } else {
                                    objFieldList = fields;
                                    objFilesList = files;
                                    log.log2console(objFieldList);
                                    callback(null, 'STEP-FORM-PARSING ... ok');
                                }
                        });
                    },
        
                    // ##### Input sanitizer & validator------------------------------------------------------------------------
                    function(callback){
                        log.log2console('STEP-SANYTIZE-INPUT:');
                        emitterBus.eventBus.sendEvent('logMessage', { sseId: req.params.sseId, msg: { action: 'parsing', itemN: 300, txt: 'Form sanit '}});
            
                        if (sanitizeInput(objFieldList, objFieldSanitized, reqId)){
                            log.log2console('sanitizeInput: ok');
                            log.log2console(objFieldSanitized);
                            callback(null, 'sanitizeInput ... ok');
                        } else {
                            ErrorMsg = {
                                title: 'Check input error',
                                msg: 'Errore nei dati di input. ' + supportMsg,
                                code : 456
                            }
                            log.log2console(reqId);
                            log.log2console(ErrorMsg);
                            // logConsole.error(ErrorMsg);
                            callback(ErrorMsg, null);
                        }

                    },
        
                    function(callback){
                        log.log2console('STEP-SAVE-FILE:');
                        emitterBus.eventBus.sendEvent('logMessage', { sseId: req.params.sseId, msg: { action: 'parsing', itemN: 500, txt: 'Form save'}});
                        
                        if (savingFiles(objFilesList, objFieldSanitized, reqId )){
                            log.log2console('savingFiles: ok');
                            log.log2console(objFieldSanitized);
                            callback(null, 'savingFiles ... ok');
                        } else {
                            ErrorMsg = {
                                title: 'saving file error',
                                msg: 'Errore nella memorizzazione remota dei files. Riprovare più tardi o inviare una mail di segnalazione a ruggero.ruggeri@comune.rimini.it utilizzando il seguente identificativo di richiesta:<br><b>' + reqId + '</b><br>Grazie.',
                                code : 457
                            }
                            log.log2console(reqId);
                            log.log2console(ErrorMsg);
                            // logConsole.error(ErrorMsg);
                            callback(ErrorMsg, null);
                        }
                        
                    },

                    function(callback){
                        log.log2console('LOAD CSV e TO JSON + HASH:');
                        emitterBus.eventBus.sendEvent('logMessage', { sseId: req.params.sseId, msg: { action: 'parsing', itemN: 700, txt: 'Inserimmetni'}});

                       
                        var csv  = require('node-csvjsonlite');
                        var csvFilePath = objFieldSanitized.files[0].destFile;

                        log.log2console(csvFilePath);         
                        
                        // var content = fs.readFileSync(csvFilePath);

                        var lines = require('fs').readFileSync(csvFilePath, 'utf-8')
                        .split('\n')
                        .filter(Boolean);

                        console.log(lines.length);

                        for (i = 0; i < 10; i++){
                            var line = lines[i];
                            line = line.replace(/(\r\n|\n|\r)/gm,"");
                            line = line.toUpperCase();
                            
                            var aLine  = line.split(';');

                            for ( j = 0; j < aLine.length; j ++ ){
                                aLine[j] = aLine[j].trim();
                                aLine[j] = aLine[j].replace(/ /g,"_");

                            }

                            console.log(aLine);
                           


                        }

                        /*
                        csv
                        .convert(csvFilePath)
                        .then(function(successData){
                            console.log('This shouldn\'t show');
                            log.log2console('CSV OK'); 
                            log.log2console(successData); 
                            callback(null, 'CSV OK salvataggio dati protocollo nella cartella ... ok');
                        }, function(errorReason){
                            console.log('CSV ERROR')
                            console.log(errorReason);
                            callback(null, 'ERROR CSV salvataggio dati protocollo nella cartella ... ok');
                            // Error Reason is either a string ("File does not exist") 
                            // or an error object returned from require('fs').readFile 
                        });
                        */




                        
                    },
       
                    function(callback){
                        log.log2console('STEP-ESECUZIONE INSERIMENTI:-ASYNC null salvataggio dati protocollo nella cartella:');
                        emitterBus.eventBus.sendEvent('logMessage', { sseId: req.params.sseId, msg: { action: 'parsing', itemN: 700, txt: 'Inserimmetni'}});
                        callback(null, 'salvataggio dati protocollo nella cartella ... ok');
                    },
        
                    function(callback){
                        log.log2console('STEP-SAVE-FILE ASYNC preparazione messaggio risposta:');
        
                        callback(null, 'Messaggio di risposta preparato ok');
                    }        
        
            ],function(err, results) {
                // results is now equal to: {one: 1, two: 2}
                log.log2console('ASYNC FINAL!:');
                if(err){
                    log.log2console(err);
                    // logConsole.error(err);
                    res.status(ErrorMsg.code).send(ErrorMsg);
                } else {
                    log.log2console('ALL OK!!!!');
                    // results.msg = htmlResponseMsg;
                    // log.log2console(htmlResponseMsg);
                    var Msg = {
                                   title: 'Istanza ricevuta con successo!',
                                    msg: objFieldSanitized,
                                    reqId: reqId,
                                    code : 200
                                }
                    res.status(200).send(Msg);
                }
            });

}); 


router.get('/cdc', utilityModule.ensureAuthenticated, function(req, res) {
    log.log2console('DemanioMgr get /cdc : ');

    console.log(req.query);

    databaseModule.getPostaCDC()
    .then( function (result) {
      // log.log2console(result);
      return res.status(200).send(result);
    })
    .catch(function (err) {
      log.log2console(err);
      return res.status(200).send(err);
    });
});


// GET recupera i dati inseriti della posta
//  Necessita di alcuni filtri da sistemare
// 
router.get('/posta', utilityModule.ensureAuthenticated, function(req, res) {
    log.log2console('DemanioMgr get /posta : ');
    log.log2console(req.user);

    var key = req.user;  

    var options = {
      userid: req.user.userid,
      dataStampaTxt : req.query.dataStampaTxt ? req.query.dataStampaTxt : '',
      matricolaStampa : req.query.matricolaStampa ? req.query.matricolaStampa : '' ,
      tipo_spedizione : req.query.tipoPostaStampaTxt == 'P00 - TUTTI TIPI POSTA' ? '' : req.query.tipoPostaStampaTxt,
      dataStampaTxt:  req.query.dataStampaTxt,
      cdc: req.query.cdcStampaTxt == '0000' ? '' : req.query.cdcStampaTxt,
    };


    console.log(req.query);

    databaseModule.getPostaList(options)
         .then( function (result) {
                  // log.log2console(result);
                  return res.status(200).send(result);
               })
         .catch(function (err) {
                  log.log2console(err);
                  return res.status(200).send(err);
                });


    /*
    async.series([
      function(callback) { 
          databaseModule.getAuthList(req.user.userid)
         .then( function (result) {
                  // log.log2console(result);
                  key.AuthEvents = result;
                  callback(null, result);
               })
         .catch(function (err) {
                  log.log2console(err);
                  callback(err, null);
                });
      },
      function(callback) { 
          databaseModule.getIstanzeList(req.user.userid)
         .then( function (result) {
                  // log.log2console(result);
                  key.Istanze = result;
                  callback(null, result);
               })
         .catch(function (err) {
                  log.log2console(err);
                  callback(err, null);
                });
      },
    ],function(err, results) {
        // results is now equal to: {one: 1, two: 2}
        log.log2console('ASYNC -- FINAL!:');
        if(err){
            log.log2console(err);
            res.status(500).send(err);
        } else {
            //log.log2console(results);
            return res.status(200).send(key);
        }
    });
    */
     
});

// PUT aggiorna una riga già inserita

router.put('/posta', 
            utilityModule.ensureAuthenticated, 
            function(req, res) {

  log.log2console('DemanioMgr PUT /posta UPDATE data');
  log.log2console(req.user);
  log.log2console(req.body);

  // verifica se il dato è storico 
  var d1 = (req.body.posta_id).split("@")[0];
  //console.log(d1);
  if (d1 == moment().format('YYYYMMDD') ){
    databaseModule.updatePosta(req.body).then(function (response) {
      console.log('DemanioMgr posta saved!');
      return res.status(200).send('ok');
    }).catch(function (err) {
      console.log(err)
      return res.status(500).send(err);
    });
  } else {
    console.log('errore autorizzazione aggiornamento dati...');
    return res.status(420)
      .send({
              success: false,
              title: 'Azione non possibile',
              message: 'Non è possibile aggiornare i dati storici.',
      });
  }

});

// POST inserisce una nuova riga
router.post('/posta', 
            utilityModule.ensureAuthenticated, 
            function(req, res) {
              
  log.log2console('DemanioMgr POST /posta');
  log.log2console(req.user);
  log.log2console(req.body);

  // assegna il campo id utente da autenticazione
  req.body.userid = req.user.userid;
  req.body.userEmail = req.user.userEmail;
  req.body.userDisplayName = req.user.displayName;

  log.log2console(moment().format('YYYYMMDD'));
  var d1 = (req.body.posta_id).split("@")[0];
  console.log(d1);

  if (d1 == moment().format('YYYYMMDD') ){
    
    console.log('root post /login/callback');

    //req.user.uuidV4 = uuidV4();
    databaseModule.savePosta(req.body).then(function (response) {
      console.log('DemanioMgr posta saved!');
      return res.status(200).send('ok');
    }).catch(function (err) {
      console.log(err)
      return res.status(500).send(err);
    });
  } else {

    console.log('errore...');
    return res.status(420).send({
                          success: false,
                          title: 'Azione non possibile',
                          message: 'Non è possibile aggiungere elementi con data diversa da quella odierna.',
                      });
  }

});


// DELETE elimina righe inserite
router.delete(  '/posta/:posta_id', 
                utilityModule.ensureAuthenticated, 
                utilityModule.checkAppVersion,
                function(req, res) {
  log.log2console('DemanioMgr DELETE !');
  log.log2console(req.user);
  log.log2console(req.params.posta_id);

  // cancellazione di un record solo del giorno corrente
  // log.log2console(moment().format('YYYYMMDD'));

  var d1 = (req.params.posta_id).split("@")[0];
  console.log(d1);

  var check1 = d1 == moment().format('YYYYMMDD');
  var check2 = req.user.isAdmin;

  if (check1 || check2) {
    console.log('procedo alla cancellazione');
    databaseModule.deletePosta(req.params.posta_id).then(function (response) {
      console.log('DemanioMgr posta saved!');
      return res.status(200).send({
          success: true,
          id: req.params.posta_id,
          check1: check1,
          check2: check2
      });
    }).catch(function (err) {
      console.log(err)
      return res.status(500).send(err);
    });
  } else {
    console.log('cancellazione non consentita');
    return res.status(420)
      .send({
          success: false,
          title: 'Azione non possibile',
          message: 'Non è possibile eliminare i dati storici.',
      });
  }


});

// ritorna le statistiche
router.get('/stats', utilityModule.ensureAuthenticated, function(req, res) {
    log.log2console('DemanioMgr get /stats : ');

    console.log(req.query);

    console.log(req.query.aDataPosta);
    console.log(moment(req.query.aDataPosta).format());
    console.log(moment(req.query.aDataPosta).utc().format());


    console.log(req.query.daDataPosta);
    console.log(moment(req.query.daDataPosta).format());
    console.log(moment(req.query.daDataPosta).utc().format());
    
    var options = {};
    options.aDataPosta = moment(req.query.aDataPosta).format();
    options.daDataPosta = moment(req.query.daDataPosta).format();

    console.log(options); 

    var key = {};
    async.series([
      function(callback) { 
          databaseModule.getPostaStatsCountItem(options)
         .then( function (result) {
                  // log.log2console(result);
                  key.StatsCountItem = result;
                  callback(null, result);
               })
         .catch(function (err) {
                  log.log2console(err);
                  callback(err, null);
                });
      },
      function(callback) { 
          databaseModule.getPostaStatsCountCdc(options)
         .then( function (result) {
                  // log.log2console(result);
                  key.StatsCountCdc = result;
                  callback(null, result);
               })
         .catch(function (err) {
                  log.log2console(err);
                  callback(err, null);
                });
      },
      function(callback) { 
          databaseModule.getPostaStatsCountMatricole(options)
         .then( function (result) {
                  // log.log2console(result);
                  key.StatsCountMatricole = result;
                  callback(null, result);
               })
         .catch(function (err) {
                  log.log2console(err);
                  callback(err, null);
                });
      }, //getPostaStatsCountTipi
      function(callback) { 
          databaseModule.getPostaStatsCountTipi(options)
         .then( function (result) {
                  // log.log2console(result);
                  key.StatsCountTipi = result;
                  callback(null, result);
               })
         .catch(function (err) {
                  log.log2console(err);
                  callback(err, null);
                });
      }
    ],function(err, results) {
        // results is now equal to: {one: 1, two: 2}
        log.log2console('Stats async -- FINAL!:');
        if(err){
            log.log2console(err);
            res.status(500).send(err);
        } else {
            //log.log2console(results);

            return res.status(200).send(key);
        }
    });

});



	return router;
}