Retain
====

Javascript Model based on promises with plugins support

###Usage Draft
``` javascript
var ajax_middleware = require("ajax-middleware")
var Retain = require("./index")

var Model = Retain.extend();

Model.attrs({
  description:String
})

Model.use(ajax_middleware, { 
  rest_url: "/record"
})

var record = Model.new({description:"teste"})

record.set("description", "Ola")

record.get("description") // Ola

// Save the data locally, then save the data in a database using the 'ajax_middleware', and then resolve the promise.
record.save().then(function(record)
{
  console.log("record succesfully saved", record)
})
```
