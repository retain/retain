"use strict"

var Q = require("q");
var happens = require("happens");

module.exports = function(){
  return Retain.extend();
};

module.exports.Retain = Retain;

/**
* Retain is a browser (CJS) and node Javascript model with plugins support.
*
* @class Retain
* @constructor
* @example
  ```
  var retain = require("retain");

  Movies = retain();

  //If you want to extend from Retain in Coffescript:
  
  class Movies extends retain.Retain

  ```
*/

function Retain()
{
  
}

happens(Retain);

Retain.extend = function()
{
  var __hasProp = {}.hasOwnProperty;
  var Child = function(){};

  for (var key in Retain)
  {
    if (__hasProp.call(Retain, key))
    {
      Child[key] = Retain[key];
    }
  }

  function ctor() {
    this.constructor = Child;
    happens(this);
  }

  ctor.prototype = Retain.prototype;
  Child.prototype = new ctor();

  Child.__super__ = Retain.prototype;
  Child._init()

  return Child;
}


Retain._plugins = []
Retain._REMOVED = 0

/**
* Changes the name of the 'ID' property.
*
* @attribute idProp 
* @example
  ```
    Movies.idProp = "_id"; // Useful when working with data coming from MongoDB (it uses '_id')
  ```
*/
Retain.idProp = "id";

/**
* Adds a plugin middleware to the Model
*
* @method use
* @static
* @param {Object} plugin Retain plugin middleware
* @param {Object} config Plugin's configuration object
* @example
  ```
    Movie.use(plugin_name, {
      url:"/movies"
    })
  ```
*/

Retain.use = function(plugin, config)
{
  var p = plugin();

  for (var prop in config) 
  {
    p.config[prop] = config[prop];
  }

  this._plugins.push(p);
}

/**
* Define the model attributes and the attributes type.
*
* @method attrs
* @static
* @param {Object} props Object containing the attributes and types as key:values.
* @example
  ```
    Movie.attrs({
      name:String,
      watched:Boolean,
      duration: Number,
      categories: Array,
      info: Object,
      year: Date
    })
  ```
*/
Retain.attrs = function(props)
{
  for(var key in props)
  {
    this._attrs[key] = props[key]
  }
}

/**
* Creates a new model instance locally.
* If a callback is suplied, and there is at least one plugin attached to the model, creates the record remotelly.
*
* @method new
* @static
* @param {Function} [callback] If suplied, it will be called when record was saved locally.
* @return {Object} Model instance.
* @example
  ```
    var godfather = Movies.new() //Creates the record locally
    var godfatherRemote = Movies.new(function(movie, err)
    {
      //Creates the record locally, and remotelly (if there is any plugin attached)
    })
  ```
*/
Retain.new = function (props, callback)
{
  var fn = callback;

  if(typeof props === "function")
    fn = props;

  var key, record, value;

  record = new this;
  record._keys = {};

  this._records.push(record);
  this._TOTAL = this._records.length
  record._cid = this._TOTAL + this._REMOVED;

  if(typeof props === "object")
    record.set(props);

  this._newRemotelly(record, fn);

  return record;
}

Retain._newRemotelly = function(record, callback)
{
  var self = this;
  if(callback)
  {
    var params;

    params = record._keys;
    params["id"] = record[this.constructor.idProp];
    params["_cid"] = record._cid;

    this._runPlugins("new", params, function(res, err)
      {
        var rec = res;

        if(rec)
        {
          rec = record.set(res);
        }
        self.emit("new", record);
        callback(rec, err)
      });
  }
  else
  {
    self.emit("new", record);
  }
}

/**
* Sets the model instance properties locally.
*
* If a callback is suplied, and there is at least one plugin attached to the model, updates the record remotelly.
*
* @method set
* @param {Object} props The properties to be setted/updated.
* @param {Function} [callback] If suplied, it will be called when the record was saved remotelly.
* @return {Object} Model instance updated.
* @example
  ```
    var factotum = Movies.new(function(movie, err)
    {
      //Creates the record locally and remotelly
    })

    factotum.set({name:"Factotum", watched: false}) // Updates the record locally
    factotum.set({name:"Factotum", watched: false}, function()
    {
      // Updates the record remotelly.
    });

  ```
*/
Retain.prototype.set = function(props, callback)
{
  var args = 1 <= props.length ? [].slice.call(props, 0) : [];

  for(var prop in props)
  {
    this._validateProp(prop, props[prop]);
  }

  this._setRemotelly(props, this, callback);

  return this;
}

Retain.prototype._setRemotelly = function(props, record, callback)
{
  var self = this;
  var params;

  params = props;
  params["id"] = record[this.constructor.idProp];

  if(callback)
  {
    this.constructor._runPlugins("set", params, function(res, err)
      {

        var rec = res;

        if(res)
        {
          rec = self.set(res);
        }
        
        self.emit("change", record);
        callback(rec, err)
      });
  }
  else
  {
    self.emit("change", record);
  }
}

/**
* Get the value of a property.
*
* @method get
* @param {String} prop The property to be retrieved.
* @return The property value.
* @example
  ```
    factotum.set({name:"Factotum", watched: false}) // Updates the record locally
    
    var name = factotum.get("name") //Returns 'Factotum'

  ```
*/
Retain.prototype.get = function(prop)
{
  return this._keys[prop];
}

/**
* Finds a model instance based on the CID or ID.
*
* If a callback is suplied, and there is at least one plugin attached to the model, finds the record remotelly.
* @method find
* @static
* @param {Number} id Instance CID or ID.
* @param {Function} [callback] If suplied, it will be called when the remote record was retrieved.
* @return {Object} Record found.
* @example
  ```
    var eyesWideShut = Movies.new();
    
    Movies.find(0) // Returns a model instance (eyesWideShut)

    // Searchs remotelly for a recod with the ID of 2
    Movies.find(2, function(movie, err)
    {
      
    });

  ```
*/
Retain.find = function(id, callback)
{
  var found = null;
  var self = this;

  var filter = {};
  filter[this.idProp] = id;

  // Search by YD
  found = this._findWhere(filter);

  // Search by CID
  if(!found.length)
  { 
    filter = {};
    filter["_cid"] = id
    found = this._findWhere(filter)
  }

  if(callback)
  {
    this._findRemotelly(id, callback);
  }

  return found[0];
}

Retain._findRemotelly = function(id, callback)
{
  var self = this;

  this._runPlugins("find", id, function(res, err)
  {

    var rec = res;

    if(res)
    {
      var record = self.find(res[self.idProp]);

      if(record)
      {
        record.set(res);
      }
      else
      {
        var newRecord = self.new()
        newRecord.set(res);
      }
    }
    
    callback(res, err)

  });
}

/**
* Searchs for model instances based on the specified properties.
*
* If a callback is suplied, and there is at least one plugin attached to the model, searchs the records remotelly.
* @method search
* @static
* @param {Object} Properties.
* @param {Function} [callback] If suplied, it will be called when the remote record was retrieved.
* @return {Array} Array containing the found records.
* @example
  ```
    var eyesWideShut = Movies.new();
    eyesWideShut.set({name:"Eyes Wide Shut"});
    
    var pulpFiction = Movies.new();
    pulpFiction.set({name:"Pulp Fiction"});

    Movies.search({name:"Pulp Fiction"}) // Returns an array '[<eyesWideShutInstance>]'

    // Searchs remotelly for records with the name 'Pulp Fiction'
    Movies.find({name:"Pulp Fiction"}, function(records, err)
    {
      
    });

  ```
*/
Retain.search = function(props, callback)
{
  var found = null;
  var filter = props;

  found = this._findWhere(filter);

  if(callback)
  {
    this._searchRemotelly(props, callback);
  }

  if(found.length === 1)
    return found[0];

  return found;
}

Retain._searchRemotelly = function(props, callback)
{
  var self = this;
  var recordExists;

  this._runPlugins("search", props, function(res, err)
  {
    var results = res;
    var filter = {};
    var record = null;
    var recordExists;

    for(var i = 0, total = results.length; i < total; i++)
    {
      filter[self.idProp] = results[i][self.idProp];

      recordExists = self._findWhere(filter);

      if(recordExists[0])
      {
        recordExists[0].set(results[i]);
      }
      else
      {
        record = this.new()
        record.set(results[i]);
      }
    }

    if(res.length === 1)
      callback(res[0], err)
    else
      callback(res, err)
  })
}

/**
* Get all the model instances
*
* If a callback is suplied, and there is at least one plugin attached to the model, fetch the records remotelly.
* @method all
* @static
* @param {Function} [callback] If suplied, it will be called when the remote records were fetched.
* @return {Array} Array of records.
* @example
  ```
    Movies.all() // Returns the locally records

    Movies.all(function(records, err)
    {
      // Returns the remote records
    })

  ```
*/
Retain.all = function(callback)
{
  this._allRemotelly(callback);

  return this._records;
}

Retain._allRemotelly = function(callback)
{
  var self = this;

  if(callback)
  {
    this._runPlugins("all", this._records, function(res, err)
      {
        if(res)
        {
          self._records = [];

          for(var i = 0, total = res.length; i < total; i++)
          {
            var record = self.new(res[i])
          }
          callback(self._records, err)
        }
        else
        {
          callback(res, err)
        }
        
      });
  }
}

/**
* Removes/deletes the record locally.
*
* If a callback is suplied, and there is at least one plugin attached to the model, removes the record remotelly.
* @method remove
* @param {Function} [callback] If suplied, it will be called when the record was removed/deleted remotelly.
* @example
  ```
    var eyesWideShut = Movies.new(function()
    {
      // Creates a new record remotelly
    });
    
    eyesWideShut.remove() // Removes/deletes the record locally

    eyesWideShut.remove(function(movie, err)
    {
      // Removes/deletes the record remotelly.
    })

  ```
*/
Retain.prototype.remove = function(callback)
{
  var cid = this._cid;
  var record = null;
  var self = this;

  var total = this.constructor._records.length;

  var i = 0;

  for (var i = this.constructor._records.length - 1; i >= 0; i--) 
  {
    record = this.constructor._records[i];

    if(parseInt(record._cid) === cid)
    {
      this.constructor._REMOVED++;
      this.constructor._records.splice(i,1);
    }
  };

  if(callback)
  {
    this.constructor._runPlugins("remove", this[this.constructor.idProp], function(res, err)
      {
        self.emit("remove", self);
        callback(res, err);
      });
  }
  else
  {
    self.emit("remove", self);
  }
}

/**
* Sync the local record with the remote storages.
*
* If a callback is suplied, and there is at least one plugin attached to the model, syncs the record remotelly.
* @method save
* @param {Function} [callback] If suplied, it will be called when the record was synchronized remotelly.
* @example
  ```
    var graveOfTheFireflies = Movie.new();
    
    graveOfTheFireflies.set({name:"Grave of the Fireflies"});

    graveOfTheFireflies.save(function()
    {
      done();
    });

  ```
*/
Retain.prototype.save = function(callback)
{
  var self = this;

  if(this._isNew() && !this._isRemoved())
  {
    self.constructor._runPlugins("new", self, function()
    {
      var keys = Object.keys(self._keys);

      if(keys.length)
      {
        self.constructor._runPlugins("set", self, function()
        {
          if(callback)
          {
            callback()
            return;
          }
        });
      }
      else
      {
        if(callback)
        {
          callback()
          return;
        }
      }

    });
  }
  else if(!this._isRemoved())
  {
    self.constructor._runPlugins("set", self, function()
    {
      if(callback)
        callback()
    });
  }
  else
  {
    if(callback)
      callback()
  }
}


// Private

Retain.prototype._isRemoved = function()
{
  var found = this.constructor.find(this._cid);

  if(found)
    return false;
  else
    return true;
}

Retain.prototype._isNew = function()
{
  if(this.id === undefined)
    return true;
  else
    return false;
}

Retain._runPlugins = function(method, initialValue, callback)
{
  // Reference https://github.com/kriskowal/q#sequences
  var plugins = this._getPlugins(method);
  var self = this;

  plugins.reduce(Q.when, Q(initialValue))
    .then(function(res)
    {
      callback(res,null);
    })
    .fail(function(err)
    {
      self.emit("error", err);
      callback(null,err)
    });
}

Retain._init = function()
{
  this._attrs = {}
  this._records = []
  this._TOTAL = this._records.length
}

Retain._getPlugins = function(method)
{
  var promises = [];

  for(var i = 0, total = this._plugins.length; i < total; i++)
  {
    if(this._plugins[i][method])
    {
      promises.push(this._plugins[i][method].bind(this._plugins[i]));
    }
  }

  return promises;
}

Retain.prototype._keys = {}

Retain.prototype._cid = {}

Retain.prototype._validateType = function(prop, val)
{
  var attr = this.constructor._attrs[prop];

  if(/native\scode/.test(attr))
  {
    switch(attr.toString().match(/function\s(\w+)/)[1])
    {
      case "String":
        return (typeof val === "string");
      case "Boolean":
        return (typeof val === "boolean");
      case "Number":
        return (typeof val === "number");
      case "Array":
        return (Array.isArray(val))
      case "Object":
      case "Date":
        return (val instanceof attr);
    }
  }
}

Retain.prototype._validateProp = function(prop, value)
{
  if(this.constructor._attrs[prop])
  {
    if(this._validateType(prop, value))
    {
      this._keys[prop] = value;
    }
    else
    {
      throw new Error("Invalid type for property " + prop + " = " + value);
    }
  }
  else
  {
    this[prop] = value;
  }
}

Retain._findWhere = function(params)
{
  var found = [];

  for(var i = 0; i < this._records.length; i++)
  {
    var record = this._records[i];

    if(this._hasProperties(record, params))
    {
      found.push(record);
    }
  }

  return found;
}

Retain._hasProperties = function(obj, props)
{
  if(!props["_cid"] && !props[this.idProp])
  {
    obj = obj._keys;
  }

  for (var prop in props) 
  {
    if(obj[prop] != props[prop])
    {
      return false;
    }
  }

  return true;
}