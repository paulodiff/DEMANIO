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
var async2 = require('async');
var databaseModule = require("../models/databaseModule.js");
var emitterBus = require("../models/emitterModule.js");
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var multiparty = require('multiparty');
var crypto = require('crypto');



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

/*

    route per il caricamento del F24


*/
router.post('/updata/:sseId',  function(req, res) {
    log.log2console('DemanioMgr POST /updata : ', req.params.sseId);
    
    // richiesta di identificatore unico di transazione
    var reqId = utilityModule.getTimestampPlusRandom();
    var supportMsg = 'Support id:' + reqId + '';
    if(!req.params.sseId) {
        log.log2console('#ERROR# DemanioMgr:sseId NOT defined!');
        console.log(req.params);
    }

    emitterBus.eventBus.sendEvent('logMessage', { sseId: req.params.sseId, msg: { action: 'insert', itemN: 100, txt: 'Start operations ..'} });
    
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
                    // avvio della procedura ... dummy     
                    function(callback){
                        log.log2console('STEP-START:');
                        emitterBus.eventBus.sendEvent('logMessage', { sseId: req.params.sseId, msg: { action: 'insert', itemN: 102, txt: 'Avvio operazioni ...'} });
                        // callback(null, 'STEP-START ok');
                        setTimeout( function () {callback(null, 'STEP-START:ok')},1000);
                    },
                    
                    // parsing del form dati e file in upload
                    function(callback) {
                        log.log2console('STEP-FORM-PARSING: form parsing');
                        emitterBus.eventBus.sendEvent('logMessage', { sseId: req.params.sseId, msg: { action: 'parsing', itemN: 200, txt: 'Ricevimento dati inviati ...'}});
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
                                    callback(null, 'STEP-FORM-PARSING:ok');
                                }
                        });
                    },
        
                    //Input sanitizer & validator------------------------------------------------------------------------
                    function(callback){
                        log.log2console('STEP-SANITIZE-INPUT:');
                        emitterBus.eventBus.sendEvent('logMessage', { sseId: req.params.sseId, msg: { action: 'parsing', itemN: 300, txt: 'Controllo dati ...'}});
            
                        if (sanitizeInput(objFieldList, objFieldSanitized, reqId)){
                            log.log2console('sanitizeInput: ok');
                            log.log2console(objFieldSanitized);
                            callback(null, 'STEP-SANITIZE-INPUT:ok');
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
        
                    // salvataggio del file upload
                    function(callback){
                        log.log2console('STEP-SAVE-FILE:');
                        emitterBus.eventBus.sendEvent('logMessage', { sseId: req.params.sseId, msg: { action: 'parsing', itemN: 500, txt: 'Salvataggio dati'}});
                        
                        if (savingFiles(objFilesList, objFieldSanitized, reqId )){
                            log.log2console('savingFiles: ok');
                            log.log2console(objFieldSanitized);
                            callback(null, 'STEP-SAVE-FILE:ok');
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

                    // dummy actions ...  TIMEOUT
                    function(callback){
                        log.log2console('STEP-TIMEOUT:');
                        emitterBus.eventBus.sendEvent('logMessage', { sseId: req.params.sseId, msg: { action: 'parsing', itemN: 600, txt: 'Timeout'}});
                        // callback(null, 'STEP-START ok');
                        setTimeout( function () {callback(null, 'STEP-TIMEOUT:ok')},1000);
                    },

                    // lavorazione del file csv
                    function(callback){
                        log.log2console('STEP-LOAD-FILE-DB-INSERT:');
                        emitterBus.eventBus.sendEvent('logMessage', { sseId: req.params.sseId, msg: { action: 'parsing', itemN: 700, txt: 'Caricamento dati da file e database ...'}});
                       
                        var csv  = require('node-csvjsonlite');

                        if (!objFieldSanitized.files[0]) {
                            ErrorMsg = {
                                title: 'FILE NOT UPLOADED!',
                                msg: 'FILE NOT UPLOADED!',
                                code : 457
                            }
                            log.log2console(reqId);
                            log.log2console(ErrorMsg);
                            // logConsole.error(ErrorMsg);
                            callback(ErrorMsg, null);
                            return;
                        }

                        var csvFilePath = objFieldSanitized.files[0].destFile;

                        // var hmac = crypto.createHmac('sha256', 'DEMANIO');

                        log.log2console(csvFilePath);         
                        
                        // var content = fs.readFileSync(csvFilePath);

                        var lines = require('fs').readFileSync(csvFilePath, 'utf-8')
                        .split('\n')
                        .filter(Boolean);

                        console.log('N.LINEE DEL FILE DA ELABORARE:',lines.length);

                        var headerLine = [];
                        var bulkObjArray = []
                        var bulkObj = {};

                        for (i = 0; i < lines.length; i++){
                            var line = lines[i];
                            line = line.replace(/(\r\n|\n|\r)/gm,"");
                            line = line.toUpperCase();
                            
                            var aLine  = line.split(';');

                            for ( j = 0; j < aLine.length; j ++ ){
                                aLine[j] = aLine[j].trim();
                                aLine[j] = aLine[j].replace(/ /g,"_");
                            }

                            if ( i === 0 ) {
                                headerLine = aLine;
                                console.log('Header line:', headerLine);
                            }

                            bulkObj = {};
                            if ( i > 0) {
                                for ( j = 0; j < aLine.length; j ++ ){
                                    bulkObj[headerLine[j]] = aLine[j];
                                }
                                
                                // hmac.update(aLine.join());
                                // bulkObj.HASH = hmac.digest('hex');
                                bulkObj.HASH = crypto.createHash('sha256').update(aLine.join()).digest('hex');
                                bulkObj.TS = reqId;
                                bulkObj.FILE_NAME_IMPORT = csvFilePath;
                                
                                console.log(bulkObj);

                                bulkObjArray.push(bulkObj);
                            }
                        }

                        // controllo sul numero degli elementi delle linee 
                        console.log('Numero di campi test:', headerLine.length);
                        bulkObjArray.forEach(function(item){
                            console.log(item);
                        });

                        ErrorMsg = {
                            title: 'Errore nel  file caricato ',
                            msg: ['Non il numero di campi di righe ecc..'],
                            code : 457
                        }
                        log.log2console(reqId);
                        log.log2console(ErrorMsg);
                        // logConsole.error(ErrorMsg);
                        callback(ErrorMsg, null);
                        return;


                        // console.log('ELENCO OGGETTI DA INSERIRE -------------------------------------------------------------------------');
                        // console.log(bulkObjArray);
                        // console.log('START ELENCO CHIAMATE .------------------------------------------------------------------------------');

                        // setTimeout( function () {callback(null, 'STEP-START LOAD CSV e TO JSON + HASH + DB')},1000);

                        var cntIterator = 0, cntTimes = 1;
                        Promise.all(bulkObjArray.map(function(item) { 
                            
                            return databaseModule.findOrCreateSID_F24_PAGAMENTI(item).then(function(result) { 
                                // console.log('<<<PROMISE-RISULTATO chiamata singola -----------------------------------');
                                cntIterator++;
                                if (cntIterator > 100){
                                    emitterBus.eventBus.sendEvent('logMessage', { sseId: req.params.sseId, msg: { action: 'parsing', itemN: 700, txt: 'Inseriti ' + (cntIterator * cntTimes)}});
                                    cntIterator = 0; cntTimes++;
                                }
                                // console.log(result);
                                // console.log(result[0]);
                                // console.log(result[0].dataValues);
                                // console.log(result[1]);
                                // console.log('>>>PROMISE-RISULTATO chiamata singola -----------------------------------');
                                return {dataValues : result[0].dataValues, isInserted : result[1] };
                            });
                        })).then(function(results) {
                            console.log('PROMISE-RISULTATO FINALE  =========================================== ');
                            console.log(results);

                            var cntInsert = 0;
                            var cntTotal = results.length;
                            results.forEach(function (item) {
                                if (item.isInserted) cntInsert ++;
                            })

                            var msgEnd = 'STEP-LOAD-FILE-DB-INSERT: totali: ' + cntTotal + ' inserite ' + cntInsert;

                            // conteggio elementi iseriti rispetto a quelli inviati...
                            callback(null, msgEnd );
                            // results is an array of names
                        });

                                           
                    },
       

                    function(callback){
                        log.log2console('STEP-FINE-OPERAZIONI-TIMEOUT:');
                        emitterBus.eventBus.sendEvent('logMessage', { sseId: req.params.sseId, msg: { action: 'parsing', itemN: 800, txt: 'Timeout'}});
                        // callback(null, 'STEP-START ok');
                        setTimeout( function () {callback(null, 'STEP-FINE-OPERAZIONI-TIMEOUT:ok')},1000);
                    }

        
            ],function(err, results) {
                // results is now equal to: {one: 1, two: 2}
                log.log2console('ASYNC FINAL!:');
                if(err){
                    log.log2console(err);
                    // logConsole.error(err);
                    res.status(481).send(err);
                    // res.status(ErrorMsg.code).send(ErrorMsg);
                } else {
                    log.log2console('ALL OK!!!!');
                    // results.msg = htmlResponseMsg;
                    // log.log2console(htmlResponseMsg);
                    console.log(results);
                    emitterBus.eventBus.sendEvent('logMessage', { sseId: req.params.sseId, msg: { action: 'parsing', itemN: 1000, txt: 'Operazioni completate'}});
                    
                    var Msg = {
                                title: 'Operazione completata',
                                msg: results,
                                reqId: reqId,
                                code : 200
                            };
                    res.status(200).send(Msg);
                }
            });

}); 


router.get('/SID_F24', 
    // utilityModule.ensureAuthenticated, 
    function(req, res) {
    log.log2console('DemanioMgr get /SID_F24 : ');

    console.log(req.query);

    databaseModule.getSID_F24_PAGAMENTIlist()
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