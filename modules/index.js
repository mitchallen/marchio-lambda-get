/**
    Module: marchio-lambda-get
    Author: Mitch Allen
*/

/*jshint node: true */
/*jshint esversion: 6 */

"use strict";

/**
 * Module
 * @module marchio-lambda-get
 */

/**
 * 
 * Factory module
 * @module marchio-lambda-get-factory
 */

 /** 
 * Factory method 
 * It takes one spec parameter that must be an object with named parameters
 * @param {Object} spec Named parameters object
 * @returns {Promise} that resolves to {module:marchio-lambda-get}
 * @example <caption>Usage example</caption>
    var factory = require("marchio-lambda-get");
 
    factory.create({})
    .then(function(obj) {
        return obj.health();
    })
    .catch( function(err) { 
        console.error(err); 
    });
 */
module.exports.create = (spec) => {

    return new Promise((resolve, reject) => {

        spec = spec || {};

        // reject("reason");

        // private 
        let _package = "marchio-lambda-get";

        resolve({
            // public
            /** Returns the package name
              * @function
              * @instance
              * @memberof module:marchio-lambda-get
            */
            package: () => _package,
            /** Health check
              * @function
              * @instance
              * @memberof module:marchio-lambda-get
              * @example <caption>Usage Example</caption>
                var factory = require("marchio-lambda-get");
             
                factory.create({})
                .then(function(obj) {
                    return obj.health();
                })
                .then(function(result) {
                    console.log("HEALTH: ", result);
                })
                .catch( function(err) { 
                    console.error(err); 
                });
            */
            health: function() {
                return new Promise((resolve,reject) => {
                    resolve("OK");
                });
            }
        });
    });
};
