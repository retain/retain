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
Retain.new = function (callback)
{
  var key, record, value;

  record = new this;
  record._keys = {};

  this._records.push(record);
  this._TOTAL = this._records.length
  record._cid = this._TOTAL + this._REMOVED;

  this._newRemotelly(record, callback);

  return record;
}

Retain._newRemotelly = function(record, callback)
{
  var self = this;
  if(callback)
  {
    this._runPlugins("new", record, function(res, err)
      {
        var rec = res;

        if(rec)
        {
          rec = record.set(res);
        }

        callback(rec, err)
      });
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
  params.id = record[this.constructor.idProp];

  if(callback)
  {
    this.constructor._runPlugins("set", params, function(res, err)
      {
        var rec = res;

        if(res)
        {
          rec = self.set(res);
        }
        
        callback(rec, err)
      });
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
Retain.find = function(props, callback)
{
  var found = null;
  var filter = props;

  if (typeof props === "number" || typeof props === "string")
  {
    // Search by ID
    filter = {};
    filter[this.idProp] = props;
    found = this._findWhere(filter);

    // Search by CID
    if(!found.length)
    { 
      filter = {};
      filter["_cid"] = props
      found = this._findWhere(filter)
    }

  }
  else
  {
    found = this._findWhere(filter);
  }

  this._findRemotelly(filter, callback);

  if(found.length === 1)
    return found[0];

  return found;
}

Retain._findRemotelly = function(filter, callback)
{
  var self = this;
  var params;

  params = filter;

  if(callback)
  {
    this._runPlugins("find", filter, function(res, err)
      {
        var rec = res;

        if(res)
        {
          for(var i = 0, total = res.length; i < total; i++)
          {
            var record = self.find(res.id);

            if(record.length)
            {
              record[0].set(res);
            }
            else
            {
              var newRecord = this.new()
              newRecord.set(res);
            }
          }

        }
        
        callback(res, err)

      });
  }
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
          self._records = res;
        }
        
        callback(res, err)
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

  var total = this.constructor._records.length;

  var i = 0;

  for (var i = this.constructor._records.length - 1; i >= 0; i--) 
  {
    record = this.constructor._records[i];

    if(parseInt(record._cid) === cid)
    {
      // console.log("record._cid", record._cid, record);
      this.constructor._REMOVED++;
      this.constructor._records.splice(i,1);
    }
  };

  if(callback)
  {
    this.constructor._runPlugins("remove", this, callback);
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
  var that = this;

  if(this._isNew() && !this._isRemoved())
  {
    that.constructor._runPlugins("new", that, function()
    {
      var keys = Object.keys(that._keys);

      if(keys.length)
      {
        that.constructor._runPlugins("set", that, function()
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
    that.constructor._runPlugins("set", that, function()
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
  var plugins = this._get_plugins(method);
  var self = this;

  plugins.reduce(Q.when, Q(initialValue))
    .then(function(res)
    {
      self.emit("change", res);
      self.emit(method, res);
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

Retain._get_plugins = function(method)
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