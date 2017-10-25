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
    crFactory = require('marchio-core-record');

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

    const partition = model.partition || null,
          sort = model.sort || null,
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

    // TODO - check partition against DynamoDB reserved words
    if(!partition) {
        throw new Error('dp-get: model.partition not defined.');
    }

    return crFactory.create( { model: model } )
    .then( o => {
        if(model.primary) {
            throw new Error( "ERROR: marchio-lambda-get: model.primary should now be model.partition" );
        }
        if(!partition) {
            throw new Error( "ERROR: marchio-lambda-get: model.partition not defined" );
        }
        recMgr = o;  
        return recMgr.selectedFields();  
    })
    .then( sfList => {
        if( ! sfList ) {    // something went terribly wrong
            return Promise.reject(404);
        }
        var _key = {};

        const dbId = params.partition;
        if(!dbId) {
            return Promise.reject(404);
        }
        _key[ partition ] = dbId; 

        if( sort && params.sort ) {
            _key[sort] = params.sort;
        }

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
            "ProjectionExpression": _pExp,              // comma sep list of field expresion attributes "#email,#status"
            "ExpressionAttributeNames": _expAttrNames   // object { '#email': "email" }
        };
        return Promise.all([
                docClient.getItem( getObject ).promise(),
                Promise.resolve( dbId )
            ]);
    })
    .then( (o) => {
        var record = o[0],
            dbId = o[1];
        if( record && record.Item ) {
            var resObject = {
                statusCode: 200,  
                headers: {
                    "Content-Type" : "application/json",
                    "Location": "/" + [ model.name, dbId ].join('/')
                },
                body: record.Item
            };
            res
                .json(resObject);
        } else {
            return Promise.reject(404);
        }
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