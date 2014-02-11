Retain
====

Javascript Model based on promises with plugins support

[![Build Status](https://travis-ci.org/giuliandrimba/retain.png?branch=master)](https://travis-ci.org/giuliandrimba/retain) [![Coverage Status](https://coveralls.io/repos/giuliandrimba/retain/badge.png?branch=master)](https://coveralls.io/r/giuliandrimba/retain?branch=master)

###Usage
``` javascript

var ajax_plugin = require("ajax-plugin")
var retain = require("./index")

// Create a new Retain model
var Movie = retain();

// Set the model attributes with its type (for validation purpose)
Movie.attrs({
  description:String
})

// Set the ajax_plugin to be used by the Model
// Each plugin might have its own configuration
Movie.use(ajax_plugin, {
  rest_url: "/record"
})

// Creates a local record
var fightClub = Movie.new();

// Creates a local and remote record
var fightClub = Movie.new(function(record)
{
  // Record retrieved remotelly
})

// Set a record property
fightClub.set({"name": "Fight Club"})

// Set a record property remotelly
fightClub.set({"name": "Fight Club"},function(record)
{
  // Updated record retrieved remotelly
})

// Get a record property
fightClub.get("name") // Fight Club

// Get all the records locally
var movies = Movie.all() // [fightClub]

// Get all the records locally and remotelly
var movies = Movie.all(function(records)
{
  // Records retrieved remotelly
})

// Search for a record locally by ID or CID
movie = Movie.find(0); // Returns fightClub reference

// Search for a record remotelly by ID or CID
movie = Movie.find(0, function(record)
{
  // The plugins needs to return a new record based on the ID
});

```
