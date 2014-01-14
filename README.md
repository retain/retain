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

// Get the data locally (saved in memory)
Model.all()

// Get the data remotelly (returns a promise)
Model.p.all()

// Set locally
record.set("description", "Ola")

// Set remotelly, returns a promise
record.p.set("description", "Ola")

// Get locally
record.get("description") // Ola

// Get remotelly, returns a promise
record.p.get("description") // Ola
```
