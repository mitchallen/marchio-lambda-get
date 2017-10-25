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
        fields: {
            eid:      { type: String },  // return eid / primary in GET results
            email:    { type: String, required: true },
            status:   { type: String, required: true, default: "NEW" },
            // Password will be (fake) hashed by filter before being saved
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
