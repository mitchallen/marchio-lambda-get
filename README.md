marchio-lambda-get
==
REST GET from DynamoDB via Lambda
--

<p align="left">
  <a href="https://travis-ci.org/mitchallen/marchio-lambda-get">
    <img src="https://img.shields.io/travis/mitchallen/marchio-lambda-get.svg?style=flat-square" alt="Continuous Integration">
  </a>
  <a href="https://codecov.io/gh/mitchallen/marchio-lambda-get">
    <img src="https://codecov.io/gh/mitchallen/marchio-lambda-get/branch/master/graph/badge.svg" alt="Coverage Status">
  </a>
  <a href="https://npmjs.org/package/marchio-lambda-get">
    <img src="http://img.shields.io/npm/dt/marchio-lambda-get.svg?style=flat-square" alt="Downloads">
  </a>
  <a href="https://npmjs.org/package/marchio-lambda-get">
    <img src="http://img.shields.io/npm/v/marchio-lambda-get.svg?style=flat-square" alt="Version">
  </a>
  <a href="https://npmjs.com/package/marchio-lambda-get">
    <img src="https://img.shields.io/github/license/mitchallen/marchio-lambda-get.svg" alt="License"></a>
  </a>
</p>

## Installation

    $ npm init
    $ npm install marchio-lambda-get --save
  
* * *

## Lambda Setup

### References

* __[marchio-lambda-post](https://www.npmjs.com/package/marchio-lambda-post)__

* __[Create an API with Lambda Proxy Integration through a Proxy Resource](http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-create-api-as-simple-proxy-for-lambda.html)__
* [A Lambda Function in Node.js for Proxy Integration](http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-create-api-as-simple-proxy-for-lambda.html#api-gateway-proxy-integration-lambda-function-nodejs)
* [Build an API Gateway API Using Proxy Integration and a Proxy Resource](http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-create-api-as-simple-proxy.html)
* [Create and Test an API with HTTP Proxy Integration through a Proxy Resource](http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-create-api-as-simple-proxy-for-http.html)

* * *

### Steps

#### Create Test Role

* Browse to: https://console.aws.amazon.com/iam/
* Click: __Roles__ (from the left column)
* Click: __Create new role__
* __Step 1: Select role type__
 * Expand Section: __AWS Service Role__
 * For __AWS Lambda__, click: __Select__
* __Step 2__ is automatically skipped
* __Step 3: Attach policy__
 * Select __AmazonDynamoDBReadOnlyAccess__ policiy
* Click: __Next Step__
* Create a name for the role (like __lambda-db-get-only__)
* Click: __Create role__

#### Create Lambda Function

* Browse to: https://console.aws.amazon.com/lambda
* Click: __Create a Lambda Function__
* Select: __Blank Function__
* Click: __Next__
* Name: __marchio-get__
* Description: __Marchio service__
* Runtime: __Node.js 4.3__
* Set the __Role__
 * Role: __Choose and existing role__
 * Existing role: __service-role/__(name of role you created earlier)
* Click: __Next__
* Click: __Create Function__

#### Setup API Gateway

* Browse to: https://console.aws.amazon.com/apigateway
* Click: __Create API__
* Select: __New API__
* API name: __marchio-get__
* Description: __Marchio service__
* Click: __Create API__
* Click on the slash (__/__)
* Drop down: __Actions__
* Select: __Create Resource__
* Check: __Configure as proxy resource__
* (Optionally enabled __CORS__)
* Click: __Create Resource__
* For __Integration type__ select: __Lambda Function Proxy__
* Lambda Region: For example: __us-east-1__
* Lambda Function: __marchio-get__
* Click: __Save__
* Add Permission to Lambda Function: __OK__
* Drop down: __Actions__
* Select: __Deploy API__
* Define a new stage (call it "test")
* Click: __Deploy__
* Save the __Invoke URL__

#### Create DynamoDB Table

If you've already setup a demo for __[marchio-lambda-post](https://www.npmjs.com/package/marchio-lambda-post)__ then you may have this table already.  If not, create it and load it with a few test records.

* Browse to: https://console.aws.amazon.com/dynamodb/
* Click: __Create Table__
* Table name: __mldb__
* Primary key: __eid__
* The type should be the default (string)
* Click: __Create__
* After some churning, click the __Capacity__ tab
* Set the __Read / Write capacity units__ to __1__ to save money while testing
* Click: __Save__

#### Example and Deploy

See the deployment example located in the repo under:

* examples/deploy

It contains a deployment script and an example lambda source file.

* Install the dependencies by running:
```
$ npm install
```

To run the script you must first make it runnable:
```
$ chmod +x deploy-lambda.sh
```

To test:

* Deploy the API via API Gateway
* Create an environment variable called __AWS\_HOST\_MARCHIO\_GET__ which is set to the invocation url
* Test the deployment using __curl__ (substitute a valid __eid__ value):

```
$ curl -i -X GET -H "Accept: applications/json" \
  $AWS_HOST_MARCHIO_GET/test/marchio-get/mldb/110ec58a-a0f2-4ac4-8393-c866d813b8d1
```
* The response should contain a 200 status code and a copy of the record.

* * *

## Modules

<dl>
<dt><a href="#module_marchio-lambda-get">marchio-lambda-get</a></dt>
<dd><p>Module</p>
</dd>
<dt><a href="#module_marchio-lambda-get-factory">marchio-lambda-get-factory</a></dt>
<dd><p>Factory module</p>
</dd>
</dl>

<a name="module_marchio-lambda-get"></a>

## marchio-lambda-get
Module

<a name="module_marchio-lambda-get-factory"></a>

## marchio-lambda-get-factory
Factory module

<a name="module_marchio-lambda-get-factory.create"></a>

### marchio-lambda-get-factory.create(spec) ⇒ <code>Promise</code>
Factory method 
It takes one spec parameter that must be an object with named parameters

**Kind**: static method of <code>[marchio-lambda-get-factory](#module_marchio-lambda-get-factory)</code>  
**Returns**: <code>Promise</code> - that resolves to {module:marchio-lambda-get}  

| Param | Type | Description |
| --- | --- | --- |
| spec | <code>Object</code> | Named parameters object |
| spec.event | <code>Object</code> | Lambda event |
| spec.context | <code>Object</code> | Lambda context |
| spec.callback | <code>function</code> | Lambda callback |
| spec.model | <code>Object</code> | Table model |

**Example** *(Usage example)*  
```js
// Lambda root file
"use strict";

var mlFactory = require('marcio-lambda-get'); 

exports.handler = function(event, context, callback) {

    var model = {
        name: 'mldb',   // must match DynamoDB table name
        partition: 'eid', // primary partition key - cannot be reserved word (like uuid)
        // sort: 'gid',
        fields: {
            eid:      { type: String },  // return eid / primary partition in GET results
            // gid:      { type: String },  // return gid / primary sort in GET results
            email:    { type: String, required: true },
            status:   { type: String, required: true, default: "NEW" },
            password: { type: String, select: false },  // select: false, exclude from query results
        }
    };

    mlFactory.create({ 
        event: event, 
        context: context,
        callback: callback,
        model: model
    })
    .catch(function(err) {
        callback(err);
    });
 };
```

* * *

## Testing

To test, go to the root folder and type (sans __$__):

    $ npm test
   
* * *
 
## Repo(s)

* [bitbucket.org/mitchallen/marchio-lambda-get.git](https://bitbucket.org/mitchallen/marchio-lambda-get.git)
* [github.com/mitchallen/marchio-lambda-get.git](https://github.com/mitchallen/marchio-lambda-get.git)

* * *

## Contributing

In lieu of a formal style guide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.

* * *

## Version History

#### Version 0.2.2

* removed comment from demo

#### Version 0.2.1

* Added support for primary sort key

#### Version 0.2.0

* Change model.primary to model.partition

#### Version 0.1.5

* Updated doc and demo deploy to show how to return primary key if required

#### Version 0.1.4

* Integrated module documentation into readme

#### Version 0.1.3

* Updated role documentation

#### Version 0.1.2

* Updated service to only return record and not Item wrapper.

#### Version 0.1.1

* Fixed issue with object passed to DynamoDB.getItem

#### Version 0.1.0 

* initial release

* * *
