/* modulo per l'invio di una mail */

var jwt = require('jsonwebtoken');
var moment = require('moment');
var ENV   = require('../tmp/config.js'); // load configuration data
var fs = require('fs');
var utilityModule  = require('../models/utilityModule.js'); // load configuration data
var request = require('request');
var qs = require('querystring');
var path = require('path');
var models = require("../modelsSequelize");
var log = require('../models/loggerModule.js');
var uuidV4 = require('uuid/v4');


module.exports = {

// rende persistente su database i dati della transazione di autenticazione
saveAuthTransaction: function(user){

  return new Promise(function(resolve, reject) {

    console.log('saveAuthTransaction');
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
        console.log('saveIstanza');
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

        console.log('getAuthList');
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

        console.log('getIstanzeList');
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
}



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