
"use strict"

var Q = require("q");

var Retain = (function()
{


  function Retain()
  {

  }


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
    }

    ctor.prototype = Retain.prototype;
    Child.prototype = new ctor();
    
    Child.__super__ = Retain.prototype;
    Child._init()

    return Child;
  }


  Retain._plugins = []
  Retain._id_prop = "id";

  Retain.use = function(proxy)
  {
    this._plugins.push(proxy);
  }


  Retain.attrs = function(props)
  {
    for(var key in props)
    {
      this._attrs[key] = props[key]
    }
  }

  Retain.new = function (callback)
  {
    var key, record, value;

    record = new this;
    record._cid = this._records.length;
    record._keys = {};

    this._records.push(record);

    this._run_plugins("new", record, callback);

    return record;
  }

  Retain.prototype.set = function(props, callback)
  {

    var args = 1 <= props.length ? [].slice.call(props, 0) : [];

    for(var prop in props)
    {
      this._validate_prop(prop, props[prop]);
    }

    this.constructor._run_plugins("set", this, callback);

    return this;
  }

  Retain.prototype.get = function(prop)
  {
    return this._keys[prop];
  }

  Retain.prototype.save = function()
  {
    return Q(this);
  }

  Retain.find = function(id, callback)
  {
    var found = null;

    // Search by ID
    for(var i = 0, total = this._records.length; i < total; i++)
    { 
      if(this._records[i][this._id_prop] === id)
      {
        found = this._records[i];
      }
    }

    // Search by CID
    for(i = 0; i < total; i++)
    { 
      if(this._records[i]["_cid"] === id && !found)
      {
        found = this._records[i];
      }
    }

    this._run_plugins("find", id, callback);
    return found;
  }

  Retain.all = function(callback)
  {
    this._run_plugins("all", this._records, callback);
    return this._records;
  }

  // Private

  Retain._run_plugins = function(method, initialValue, callback)
  {
    if(callback)
    {
      // Reference https://github.com/kriskowal/q#sequences
      this._get_plugins(method).reduce(Q.when, Q(initialValue)).then(callback).fail(callback);
    }
  }

  Retain._init = function()
  {
    this._attrs = {}
    this._records = []
  }

  Retain._get_plugins = function(method)
  {
    var promises = [];

    for(var i = 0, total = this._plugins.length; i < total; i++)
    {
      if(this._plugins[method])
      {
        promises.push(this._plugins[i][method]);
      }
    }

    return promises;
  }

  Retain.prototype._keys = {}

  Retain.prototype._cid = {}

  Retain.prototype._validate_type = function(prop, val)
  {
    var attr = this.constructor._attrs[prop];

    if(/native\scode/.test(attr))
    {
      switch(attr.toString().match(/function\s(\w+)/)[1])
      {
        case "String":
          return (typeof val === "string")
          break
        case "Boolean":
          return (typeof val === "boolean")
          break
        case "Number":
          return (typeof val === "number")
          break
        case "Array":
        case "Object":
        case "Date":
          return (val instanceof attr)
          break
      }
    }
  }

  Retain.prototype._validate_prop = function(prop, value)
  {
    if(this.constructor._attrs[prop])
    {
      if(this._validate_type(prop, value))
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

  return Retain;

})()

module.exports = Retain