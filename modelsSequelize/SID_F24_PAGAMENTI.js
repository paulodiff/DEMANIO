"use strict"

module.exports = function(sequelize, DataTypes) {

var SID_F24_PAGAMENTI = sequelize.define('SID_F24_PAGAMENTI', {
 // instantiating will automatically set the flag to true if not set

 /*
 email: { type: DataTypes.STRING, allowNull: false},
 
 name: { type: DataTypes.STRING, allowNull: true},
 surname: { type: DataTypes.STRING, allowNull: true},
 flag: { type: DataTypes.BOOLEAN, allowNull: true},

 // default values for dates => current time
 myDate: { type: DataTypes.DATE, defaultValue: sequelize.NOW },

 // setting allowNull to false will add NOT NULL to the column, which means an error will be
 // thrown from the DB when the query is executed if the column is null. If you want to check that a value
 // is not null before querying the DB, look at the validations section below.
 title: { type: DataTypes.STRING, allowNull: false},

 // Creating two objects with the same value will throw an error. The unique property can be either a
 // boolean, or a string. If you provide the same string for multiple columns, they will form a
 // composite unique key.
 someUnique: {type: DataTypes.STRING},
 
 // The unique property is simply a shorthand to create a unique index.
 someUnique: {type: DataTypes.STRING}
 
 // autoIncrement can be used to create auto_incrementing integer columns
 //incrementMe: { type: DataTypes.INTEGER, autoIncrement: true },
*/

 ID_AMMINISTRAZIONE: {type: DataTypes.STRING},
 TIPO_AMMINISTRAZIONE: {type: DataTypes.STRING},
 AMMINISTRAZIONE: {type: DataTypes.STRING},
 ANNO_ATTO: {type: DataTypes.STRING},
 NUMERO_ATTO: {type: DataTypes.STRING},
 TIPO_ATTO: {type: DataTypes.STRING},
 ID_CONCESSIONE: {type: DataTypes.STRING},
 NUMERO_RATA: {type: DataTypes.STRING},
 ANNO_RATA: {type: DataTypes.STRING},
 IMPORTO_CANONE_RICHIESTO: {type: DataTypes.STRING},
 IMPORTO_CANONE_VERSATO: {type: DataTypes.STRING},
 IMPORTO_QUOTA_REG_RICHIESTA: {type: DataTypes.STRING},
 IMPORTO_QUOTA_REG_VERSATA: {type: DataTypes.STRING},
 IMPORTO_INDENNIZZI_RICHIESTI: {type: DataTypes.STRING},
 IMPORTO_INDENNIZZI_VERSATI: {type: DataTypes.STRING},
 DESCRIZIONE: {type: DataTypes.STRING},
 HASH: {type: DataTypes.STRING},
 TS: {type: DataTypes.STRING},
 FILE_NAME_IMPORT: {type: DataTypes.STRING}
 
 
},
	{
		tableName: 'SID_F24_PAGAMENTI'
	}
);

return SID_F24_PAGAMENTI;

};