# Retain

Retain is a __browser__ (CJS) and __node__ Javascript model with plugins support.

[![Build Status](https://travis-ci.org/giuliandrimba/retain.png?branch=master)](https://travis-ci.org/giuliandrimba/retain) [![Coverage Status](https://coveralls.io/repos/giuliandrimba/retain/badge.png?branch=master)](https://coveralls.io/r/giuliandrimba/retain?branch=master)

## Installation

```
$ npm install retain
```

## Motivation

There are many Javascripts models out there, but the majority of them are deeply coupled inside a framework, thus making it ~~impossible~~ hard to use them in another project/environment.

###Example

Loads __retain__ and a __retain-ajax__ (plugin that saves the records in webservices).

``` javascript
var retain = require("retain")
var retainAjax = require("retain-ajax")
```

Creates a new Retain instance.
``` javascript
var Movies = retain();
```

Set the model attributes with its type (for validation purposes)
``` javascript
Movie.attrs({
  name:String,
  watched:Boolean
})
```

Inject __retainAjax__ plugin to be used by the Model.
Each plugin might have its own configuration.
``` javascript
Movie.use(retainAjax, {
  url: "/movies"
})
```

Creates a local record.
``` javascript
var fightClub = Movie.new();
```

Creates a local and remote record.
``` javascript
var fightClub = Movie.new(function(record, err)
{
  // Record retrieved remotelly
});
```
Sets a record property locally.
``` javascript
fightClub.set({"name": "Fight Club", watched:true});
```

Sets a record property remotelly.
``` javascript
fightClub.set({"name": "Fight Club", watched:true},function(record, err)
{
  if(record)
  {
    // Updated record retrieved remotelly
  }
})
```

Get a record property value.
``` javascript
fightClub.get("name") // Fight Club
```

Get all the records locally.
``` javascript
var movies = Movie.all() // [fightClub]
```

Get all the records locally and remotelly.
``` javascript
var movies = Movie.all(function(records, err)
{
  if(records)
  {
    // Records retrieved remotelly
  }
})
```

Search for a record locally by ID or CID
``` javascript
movie = Movie.find(0); // Returns fightClub reference.
```

Search for a record remotelly by ID or CID
``` javascript
movie = Movie.find(0, function(record, err)
{
  if(record)
  {
    // Record retrieved remotelly
  }
});
```

Deletes a record locally.
``` javascript
fightClub.remove();
```

Deletes a record remotelly.
``` javascript
fightClub.remove(function(record, err)
{
  if(record)
  {
    // Record deleted remotelly.
  }
});
```

For more info, checkout the [__docs__](http://rawgithub.com/giuliandrimba/retain/master/docs/classes/Retain.html)
