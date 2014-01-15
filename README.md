Retain
====

Javascript Model based on promises with plugins support

[![Build Status](https://travis-ci.org/giuliandrimba/retain.png?branch=master)](https://travis-ci.org/giuliandrimba/retain) [![Coverage Status](https://coveralls.io/repos/giuliandrimba/retain/badge.png?branch=master)](https://coveralls.io/r/giuliandrimba/retain?branch=master)

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

// Get the data remotelly (returns a promise)
Model.all()

//Create a local instance
Model.new()

//Create a local instance, and save it remotelly (returns a promise)
Model.create()

// Set locally
record.set("description", "Ola")

// Set remotelly (returns a promise)
record.update("description", "Ola")

```
