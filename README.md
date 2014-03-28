![Retain](assets/logo.jpg)

Retain is a __browser__ (CJS) and __node__ Javascript model with plugins support.

[![Build Status](https://travis-ci.org/retain/retain.png?branch=master)](https://travis-ci.org/giuliandrimba/retain) [![Coverage Status](https://coveralls.io/repos/retain/retain/badge.png?branch=master)](https://coveralls.io/r/giuliandrimba/retain?branch=master)

## Installation

```
$ npm install retain
```

## Motivation

There are many Javascripts models out there, but the majority of them are deeply coupled inside a framework, thus making it ~~impossible~~ hard to use them in another project/environment.

## Example

``` javascript
var retain = require("retain");
var Movies = retain();

Movie.attrs({
  name:String,
  watched:Boolean
})

var goodfellas = Movies.new() // Creates a Movie instance

```

### Initialize

Retain can be initialized in two ways:

* Creating a new __Retain__ instance
  ``` javascript
  var retain = require("retain");
  var Movies = retain();
  ```

* Extending the __Retain__ constructor function.

  ``` javascript
  var Retain = require("retain").Retain;
  var Movies = {};
  Movies.prototype = new Retain;
  ```

> For __Coffeescript__ lovers, you can extend __Retain__ like this:

  ``` coffeescript
  retain = require "retain"
  
  class Movies extends retain.Retain
  
  ```

## API

First, you will have to set the Model properties with its type (for validation purpose)

``` javascript
Movie.attrs({
  name:String,
  watched:Boolean
})
```
This way, each model instance will have these properties to be setted and validated.

#### CRUD methods

Each CRUD method have an option to update the data remotelly passing a callback as parameter.

> Creates a local record.

``` javascript
var fightClub = Movie.new();
```

> Creates a local and remote record.

``` javascript
var fightClub = Movie.new(function(record, err)
{
  // Record retrieved remotelly
});
```

#### NEW

The `new` method is responsible for creating new model instances:

> Creates a local record.

``` javascript
var fightClub = Movie.new();
```

> Creates a local and remote record.

``` javascript
var fightClub = Movie.new(function(record, err)
{
  // Record retrieved remotelly
});
```

#### SET

The `set` method is responsible for setting and updating the model properties.

> Sets the record properties locally.

``` javascript
fightClub.set({"name": "Fight Club", watched:true});
```

> SSets the record properties locally and remotelly.

``` javascript
fightClub.set({"name": "Fight Club", watched:true},function(record, err)
{
  if(record)
  {
    // Updated record retrieved remotelly
  }
})
```

#### GET

The `get` method is responsible for retrieving the property value (from the local record)

> Get a record property value.

``` javascript
fightClub.get("name") // Fight Club
```

#### ALL

The `all` method fetchs all the model collection locally or remotelly.

> Get all the records locally.

``` javascript
var movies = Movie.all() // [fightClub]
```

> Get all the records remotelly and updates/overwrites the local collection.

``` javascript
var movies = Movie.all(function(records, err)
{
  if(records)
  {
    // Records retrieved remotelly
  }
})
```

#### FIND

The `find` method is responsible for retrieving a record, searching by `id` or `cid`.
Search by `id` only if the data were retrieved from a remote location at least once, otherwise, search by `cid`, which is basically, the record `index` at the local array.

> Search for a record locally by ID or CID.

``` javascript
movie = Movie.find(0); // Returns fightClub reference.
```

> Search for a record remotelly by ID or CID

``` javascript
movie = Movie.find(0, function(record, err)
{
  if(record)
  {
    // Record retrieved remotelly
  }
});
```

#### Remove

The `remove` method will delete the instance, locally or/and remotelly.

> Deletes a record locally.

``` javascript
fightClub.remove();
```

> Deletes a record remotelly.

``` javascript
fightClub.remove(function(record, err)
{
  if(record)
  {
    // Record deleted remotelly.
  }
});
```

#### SAVE

The `save` method will sync the local record with the remote storages.

> Sync the local record with the remote storages.

``` javascript
var moon = Movie.new()
moon.set({name:"Moon"});
moon.save(function(record, err)
{
  if(record)
  {
    done();
  }
});
```

#### For more info, checkout the [__docs__](http://rawgithub.com/retain/retain/master/docs/classes/Retain.html).

## Plugins

By default, __Retain__ saves the data in memory (which gets removed after a browser refresh). In order to save the data in other locations such as `localStorage` or `database`, you should use one the avaliable plugins.

★ List of avaliable plugins:
* [retain-ajax](https://github.com/giuliandrimba/retain-ajax) [![Build Status](https://travis-ci.org/giuliandrimba/retain-ajax.png?branch=master)](https://travis-ci.org/giuliandrimba/retain-ajax) [![Coverage Status](http://coveralls.io/repos/giuliandrimba/retain-ajax/badge.png)](https://coveralls.io/r/giuliandrimba/retain-ajax)
* [retain-localstorage](https://github.com/giuliandrimba/retain-localstorage) [![Build Status](https://travis-ci.org/giuliandrimba/retain-localstorage.png?branch=master)](https://travis-ci.org/giuliandrimba/retain-localstorage) 

### Example

``` javascript
var retain = require("retain");
var retainAjax = require("retain-ajax");

var Movies = retain();

Movies.attrs({
  name:String.
  watched:Boolean
});

Movies.use(retainAjax, {url:"http://remoteserver/rest/url"});
```
Now, whenever the data is modified, it will be saved remotelly.

### Creating a plugin

__Retain__ use promises internally to transfer the data between the plugins.

To create a plugin, it is necessary to implement each of the following __Retain__ methods.

* __new__
* __all__
* __set__
* __find__
* __remove__

Each of theses methods must return a promise with the updated record.

__Example of a custom plugin:__

> This is just an example, saving the records locally.

``` javascript
var Q = require("q");

var records = [];

module.exports = function()
{
  return {
    new:function(record)
    {
      records.push(record);
      return Q(record);
    },
    all:function(records)
    {
      return Q(records);
    },
    set:function(record)
    {
      for(var i = 0, total = records.length; i < total; i++)
      {
        if(record.id === records[i].id)
        {
          records[i] = record;
        }
      }
      
      return Q(record);
    },
    find:(record)
    {
      var found = null;
      
      for(var i = 0, total = records.length; i < total; i++)
      {
        if(record.id === records[i].id)
        {
          found = records[i];
        }
      }
      
      return Q(found);
    },
    remove:function(record)
    {
      for(var i = 0, total = records.length; i < total; i++)
      {
        if(record.id === records[i].id)
        {
          records.splice(i,1);
        }
      }
      
      return Q(null);
    }
  }
}

```




