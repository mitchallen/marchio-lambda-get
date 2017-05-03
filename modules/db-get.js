/**
    Module: db-get.js
    Author: Mitch Allen
*/

/*jshint node: true */
/*jshint esversion: 6 */

"use strict";

const doc = require('dynamodb-doc'),
    docClient = doc ? new doc.DynamoDB() : null,
    uuidFactory = require('marchio-id-uuid'),
    crFactory = require('marchio-core-record'),
    path = '/:model/:id?';  // id optional

module.exports.create = ( spec ) => {

    spec = spec || {};

    const adapter = spec.adapter,
          marchio = spec.marchio;

    const model = marchio.model;

    const query = adapter.query,
          params = adapter.params,
          method = adapter.method,
          body = adapter.body,
          res = adapter.response,
          env = adapter.env;

    const primaryKey = model.primary,
          jsonp = query.jsonp || false,
          cb = query.cb || 'callback';

    var recMgr = null,
        idMgr = null,
        eMsg = '';

    var req = {
        method: method,
        query: query,
        params: params,
        body: body
    };

    var _code = 200;
    var _headers = {
        "Content-Type" : "application/json"
    };

    if(method !== 'GET') {
        var resObject = {
            statusCode: 405,
            headers: {
                "Content-Type": "application/json",
                "x-marchio-http-method": method,
                "x-marchio-error": "HTTP Method not supported"
            },
            body: {} 
        };
        res.json(resObject);
        return;
    }

    // TODO - check primaryKey against DynamoDB reserved words
    if(!primaryKey) {
        throw new Error('dp-get: model.primary not defined.');
    }

    return crFactory.create( { model: model } )
    .then( o => {
        recMgr = o;  
        return recMgr.selectedFields();  
    })
    .then( sfList => {
        if( ! sfList ) {    // something went terribly wrong
            return Promise.reject(404);
        }
        var _key = {};
        const dbId = params.id;
        if(!dbId) {
            return Promise.reject(404);
        }
        _key[ primaryKey ] = dbId;  
        var _pExp = "";
        var _expAttrNames = {};
        for( var i = 0; i < sfList.length; i++ ) {
            _pExp += i > 0 ? "," : "";
            var _fldName = '#' + sfList[i];
            _pExp += _fldName;
            _expAttrNames[ _fldName ] = sfList[i];
        }
        var getObject = {
            "TableName": model.name,
            "Key": _key,
            "ProjectionExpression": '',   // comma sep list of field expresion attributes "#email,#status"
            "ExpressionAttributeNames": ''  // object { '#email': "email" }
        };
        return Promise.all([
                docClient.getItem( getObject ).promise(),
                Promise.resolve( dbId )
            ]);
    })
    .then( (o) => {
        var record = o[0],
            dbId = o[1];
        var resObject = {
            statusCode: 200,  
            headers: {
                "Content-Type" : "application/json",
                "Location": "/" + [ model.name, dbId ].join('/')
            },
            body: record
        };
        res
            .json(resObject);
    })
    .catch( (err) => {  
        if(err) {
            if( err === 404 ) {
                res.json({
                    statusCode: 404
                });
            } else {
                res.json({
                    statusCode: 500,
                    body: { 
                        message: err.message, 
                        err: err
                    }
                });
            }
        } 
    });
};