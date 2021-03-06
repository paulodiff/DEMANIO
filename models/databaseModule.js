/* modulo che gestisce le interazioni con il database attraverso Sequelize */

var jwt = require('jsonwebtoken');
var moment = require('moment');
var ENV   = require('../config/config.js'); // load configuration data
var fs = require('fs');
var utilityModule  = require('../models/utilityModule.js'); // load configuration data
var request = require('request');
var qs = require('querystring');
var path = require('path');
var models = require("../modelsSequelize");
var log = require('../models/loggerModule.js');
var uuidV4 = require('uuid/v4');
var Sequelize = require("sequelize");

                          


module.exports = {


theSame : function(p) {
    console.log('databaseModule: theSame..............');
    console.log(p);
    return p;
},

theSamePromise : function(p) {
    console.log('theSamePromise');
    console.log(p);
    return new Promise(function(resolve, reject) {
        console.log('databaseModule:theSamePromise..............');
        resolve('promise:ok');
    });
},

getSID_F24_PAGAMENTIlist : function(){
    
    return new Promise(function(resolve, reject) {

        console.log('databaseModule:getSID_F24_PAGAMENTIlist');
        
        models.SID_F24_PAGAMENTI.findAll()
        .then(function(anotherTask) {
            resolve(anotherTask)
        }).catch(function(error) {
            reject(error);
        });
    })
},


bulkCreateSID_F24_PAGAMENTI : function(plist){
    
    return new Promise(function(resolve, reject) {
            
        console.log('databaseModule:bulkCreateSID_F24_PAGAMENTI ... list objects');
        console.log(plist);

        models.SID_F24_PAGAMENTI.bulkCreate(plist)
                .then(function(anotherTask) {
                    resolve(anotherTask)
                }).catch(function(error) {
                    reject(error);
        });
    });
},

findOrCreateSID_F24_PAGAMENTI : function(p) {

    return new Promise(function(resolve, reject) {
        
    console.log('databaseModule:findOrCreateSID_F24_PAGAMENTI ');
    console.log(p);

    models.SID_F24_PAGAMENTI.findOrCreate({ where : { HASH : p.HASH } , defaults : p })
            .then(function(anotherTask) {
                resolve(anotherTask)
            }).catch(function(error) {
                reject(error);
        });
    });
},


saveSID_F24_PAGAMENTI : function(p){

    return new Promise(function(resolve, reject) {
        
            console.log('databaseModule:saveSID_F24_PAGAMENTI');
            console.log(p);
            // models.SID_F24_PAGAMENTI.build(p
            models.SID_F24_PAGAMENTI.findOrCreate(p
              /*
              { 

                ID_AMMINISTRAZIONE: p[0],
                TIPO_AMMINISTRAZIONE: p[1],
                AMMINISTRAZIONE: p[2],
                ANNO_ATTO: p[3],
                NUMERO_ATTO: p[4],
                TIPO_ATTO: p[5],
                ID_CONCESSIONE: p[6],
                NUMERO_RATA: p[7],
                ANNO_RATA: p[8],
                IMPORTO_CANONE_RICHIESTO: p[9],
                IMPORTO_CANONE_VERSATO: p[10],
                IMPORTO_QUOTA_REG_RICHIESTA: p[11],
                IMPORTO_QUOTA_REG_VERSATA: p[12],
                IMPORTO_INDENNIZZI_RICHIESTI: p[13],
                IMPORTO_INDENNIZZI_VERSATI: p[14],
                DESCRIZIONE: p[15],
                HASH: hash,
                TS: reqId,
                FILE_NAME_IMPORT: fName,
              }

              */
            )
            .save()
            .then(function(anotherTask) {
                console.log('databaseModule:saveSID_F24_PAGAMENTI:OK');
                resolve(anotherTask)
            }).catch(function(error) {
                console.log('databaseModule:saveSID_F24_PAGAMENTI:ERROR');
                console.log(error);
                // reject(error);
                resolve({msg: 'databaseModule:SID_F24_PAGAMENTI save ERROR', err: error});
            });
          });
        

},

// rende persistente su database i dati della transazione di autenticazione
saveAuthTransaction: function(user){

  return new Promise(function(resolve, reject) {

    console.log('databaseModule:saveAuthTransaction');
    console.log(user);
    models.SpidLog.build(
      { 
          ts: new Date(),
          issuer: user.issuer,
          nameID: user.nameID,
          nameIDFormat: user.nameIDFormat,
          nameQualifier: user.nameQualifier,
          spNameQualifier: user.spNameQualifier,        
          authenticationMethod: user.authenticationMethod,
          dataNascita: user.dataNascita,
          userid: user.userid,
          statoNascita: user.statoNascita,
          policyLevel: user.policyLevel,
          nome: user.nome,
          CodiceFiscale: user.CodiceFiscale,
          trustLevel: user.trustLevel,
          luogoNascita: user.luogoNascita,
          authenticatingAuthority: user.authenticatingAuthority,
          cognome: user.cognome,
          getAssertionXml: user.getAssertionXml,
          uuidV4:  user.uuidV4,
      })
    .save()
    .then(function(anotherTask) {
      resolve(anotherTask)
    }).catch(function(error) {
       reject(error);
    });
  });

},

// memorizza i dati di una istanza per consultazioni
saveIstanza: function(data){

    return new Promise(function(resolve, reject) {
        console.log('databaseModule:saveIstanza');
        console.log(data);
        models.Istanze.build({
            ts: new Date(),
            tipoIstanza: data.tipoIstanza,
            userid: data.userid,
            AuthUuidV4 : data.AuthUuidV4,
            statoIter : data.statoIter,
            emailNotifiche: data.emailNotifiche,
            fileSystemId : data.fileSystemId,
            protocolloIdDocumento : data.protocolloIdDocumento,
            protocolloAnno : data.protocolloAnno,
            protocolloNumero : data.protocolloNumero
        })
        .save()
        .then(function(anotherTask) {
            resolve(anotherTask)
        }).catch(function(error) {
            reject(error);
        });
    })
},

getAuthList: function(userid){

    return new Promise(function(resolve, reject) {

        console.log('databaseModule:getAuthList');
        console.log(userid);

        models.SpidLog.findAll({
          where: {
            userid : userid
        } 
        }).then(function(anotherTask) {
            resolve(anotherTask)
        }).catch(function(error) {
            reject(error);
        });
    })
},


getIstanzeList: function(userid){

    return new Promise(function(resolve, reject) {

        console.log('databaseModule:getIstanzeList');
        console.log(userid);

        models.Istanze.findAll({
          where: {
            userid : userid
        } 
        }).then(function(anotherTask) {
            resolve(anotherTask)
        }).catch(function(error) {
            reject(error);
        });
    })
},

/* metodi per la posta */

getPostaList: function(opts){
    return new Promise(function(resolve, reject) {

        console.log('databaseModule:getPostaList');
        console.log(opts.userid);
        console.log(opts.today);
        console.log(opts);



        var parametriFiltro = {};

        if (opts.matricolaStampa) {
            parametriFiltro.userid = opts.matricolaStampa;
        }

        if (opts.tipo_spedizione && opts.tipo_spedizione != '') {
            parametriFiltro.tipo_spedizione = opts.tipo_spedizione;
        }

        if (opts.cdc && opts.cdc != '') {
            parametriFiltro.cdc = opts.cdc;
        }

        if (opts.dataStampaTxt != '') {
            parametriFiltro.posta_id = { $like: opts.dataStampaTxt + '%' };
        }

        console.log('---PAMETRI FILTRO FINALE-------------------------------------------------');
        console.log(parametriFiltro);
        console.log('---PAMETRI FILTRO FINALE-------------------------------------------------');


        
        models.Posta.findAll({
          where: parametriFiltro,
          order: ['cdc','userid','id']
        /*
        models.Posta.findAll({
          where: {
            userid : opts.userid,
            posta_id: {
                $like: opts.today + '%'
            }
        } 
        */
        }).then(function(anotherTask) {
            resolve(anotherTask)
        }).catch(function(error) {
            reject(error);
        });
    })
},

// memorizza i dati di una istanza per consultazioni
savePosta: function(data){

    return new Promise(function(resolve, reject) {
        console.log('databaseModule:savePosta');
        console.log(data);
        models.Posta.build({
            ts: new Date(),
            posta_id: data.posta_id,
            userid: data.userid,
            userEmail: data.userEmail,
            userDisplayName: data.userDisplayName,
            protocollo: data.protocollo,
            cdc: data.cdc,
            tipo_spedizione: data.tipo_spedizione,
            destinatario_denominazione : data.destinatario_denominazione,
            destinatario_citta : data.destinatario_citta,
            destinatario_via: data.destinatario_via,
            destinatario_cap: data.destinatario_cap,
            destinatario_provincia : data.destinatario_provincia,
            barCode: data.barCode,
            verbale: data.verbale,
            note : data.note
        })
        .save()
        .then(function(anotherTask) {
            resolve(anotherTask)
        }).catch(function(error) {
            reject(error);
        });
    })
},

// aggiorna i dati di una istanza per consultazioni
updatePosta: function(data){

    return new Promise(function(resolve, reject) {
        console.log('databaseModule:updatePosta');
        console.log('update:' + data.posta_id);

        models.Posta.findOne({ where: {posta_id: data.posta_id} }).then(item => {
            // project will be the first entry of the Projects table with the title 'aProject' || null
            item.update({
                protocollo: data.protocollo,
                tipo_spedizione: data.tipo_spedizione,
                destinatario_denominazione : data.destinatario_denominazione,
                destinatario_citta : data.destinatario_citta,
                destinatario_via: data.destinatario_via,
                destinatario_provincia : data.destinatario_provincia,
                destinatario_cap: data.destinatario_cap,
                barCode: data.barCode,
                verbale: data.verbale,
                note : data.note})
                .then(function(anotherTask) {resolve(anotherTask)})
                .catch(function(error) {reject(error)});
        });

    });
},

// elimina la riga selezionata
deletePosta: function(posta_id){

    return new Promise(function(resolve, reject) {
        console.log('databaseModule:deletePosta');
        console.log('deleteId:' + posta_id);

        models.Posta.findOne({ where: {posta_id: posta_id} }).then(item => {
            // project will be the first entry of the Projects table with the title 'aProject' || null
            item.destroy()
                .then(function(anotherTask) {resolve(anotherTask)})
                .catch(function(error) {reject(error)});
        });

    });
},

// get posta Item
getPostaById: function(posta_id){

    return new Promise(function(resolve, reject) {
        console.log('databaseModule:getPostaById');
        console.log('getd:' + posta_id);

        models.Posta.findOne({ where: {posta_id: posta_id} })
            .then(function(anotherTask) {resolve(anotherTask)})
            .catch(function(error) {reject(error)});
    });
},


getPostaCDC: function(){

    return new Promise(function(resolve, reject) {
        console.log('getPostaCDC');

        models.PostaCDC.findAll()
        .then(function(anotherTask) {
            resolve(anotherTask)
        }).catch(function(error) {
            reject(error);
        });
    })
},



getPostaStatsCountItem: function(obj){

    return new Promise(function(resolve, reject) {
        console.log('getPostaStats');

/*
        models.Posta.findAll({
            group: ['userid'],
            attributes: ['userid', [Sequelize.fn('COUNT', 'id'), 'Conteggio']],
        })
*/
       models.Posta.findAll({
            group: ['posta_id_cut','tipo_spedizione'],
            attributes: [   'posta_id', 'tipo_spedizione',
                            [Sequelize.fn('LEFT', Sequelize.col('posta_id'), 8), 'posta_id_cut'],
                            [Sequelize.fn('COUNT', 'posta_id_cut'), 'posta_id_count'],
                        ],
            where : { 
                ts : {
                        $between: [obj.daDataPosta, obj.aDataPosta]
                    }
            },
            order : [ [Sequelize.col('posta_id_cut'), 'ASC'], ['tipo_spedizione'] ]
        })



        .then(function(anotherTask) {
            resolve(anotherTask)
        }).catch(function(error) {
            reject(error);
        });
    })
},


getPostaStatsCountCdc: function(obj){

    return new Promise(function(resolve, reject) {
        console.log('getPostaStats');
       models.Posta.findAll({
            group: ['cdc'],
            attributes: [   'cdc', 
                            // [Sequelize.fn('LEFT', Sequelize.col('posta_id'), 8), 'posta_id_cut'],
                            [Sequelize.fn('COUNT', 'cdc'), 'cdc_count'],
                        ],
            where : { 
                ts : {
                        $between: [obj.daDataPosta, obj.aDataPosta]
                    }
            },                        
            order : ['cdc']
        })

        .then(function(anotherTask) {
            resolve(anotherTask)
        }).catch(function(error) {
            reject(error);
        });
    })
},


getPostaStatsCountMatricole: function(obj){

    return new Promise(function(resolve, reject) {
        console.log('getPostaStats');
       models.Posta.findAll({
            group: ['userid'],
            attributes: [   'userid', 
                            // [Sequelize.fn('LEFT', Sequelize.col('posta_id'), 8), 'posta_id_cut'],
                            [Sequelize.fn('COUNT', 'userid'), 'userid_count'],
                        ],
            where : { 
                ts : {
                        $between: [obj.daDataPosta, obj.aDataPosta]
                    }
            },                   
            order : [ [Sequelize.col('userid_count'), 'DESC'] ]
        })

        .then(function(anotherTask) {
            resolve(anotherTask)
        }).catch(function(error) {
            reject(error);
        });
    })
},

getPostaStatsCountTipi: function(obj){

    console.log('getPostaStatsCountTipi');

    return new Promise(function(resolve, reject) {
        
       models.Posta.findAll({
            group: ['tipo_spedizione'],
            attributes: [   'tipo_spedizione', 
                            // [Sequelize.fn('LEFT', Sequelize.col('posta_id'), 8), 'posta_id_cut'],
                            [Sequelize.fn('COUNT', 'tipo_spedizione'), 'tipo_spedizione_count'],
                        ],
            where : { 
                ts : {
                        $between: [obj.daDataPosta, obj.aDataPosta]
                    }
            }//, order : [ [Sequelize.col('userid_count'), 'DESC'] ]
        })

        .then(function(anotherTask) {
            resolve(anotherTask)
        }).catch(function(error) {
            reject(error);
        });
    })
}




/*
// search for attributes
Project.findOne({ where: {title: 'aProject'} }).then(project => {
  // project will be the first entry of the Projects table with the title 'aProject' || null
})
*/


    /*
        userid : {
        AuthUuidV4 : {
        statoIter : {
        emailNotifiche: {
        fileSystemId : {
        protocolloIdDocumento : {
        protocolloAnno : {
        protocolloNumero : {
    */


}
