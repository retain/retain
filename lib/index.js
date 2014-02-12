"use strict"

var Q = require("q");
var happens = require("happens");

module.exports = function(){
  return Retain.extend();
};

module.exports.Retain = Retain;

function Retain()
{
  happens(this);
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
  }

  ctor.prototype = Retain.prototype;
  Child.prototype = new ctor();

  Child.__super__ = Retain.prototype;
  Child._init()

  return Child;
}


Retain._plugins = []
Retain._id_prop = "id";

Retain.use = function(proxy, config)
{
  var plugin = proxy();

  for (var prop in config) 
  {
    plugin.config[prop] = config[prop];
  }

  this._plugins.push(proxy());
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

Retain.find = function(id, callback)
{
  var found = null;
  var record = {id:id};

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

  if(found)
    record = found;

  this._run_plugins("find", record, callback);
  return found;
}

Retain.all = function(callback)
{
  this._run_plugins("all", this._records, callback);
  return this._records;
}

Retain.prototype.remove = function(callback)
{
  var cid = this._cid;
  var record = null;

  for(var i = 0, total = this.constructor._records.length -1; i < total; i++)
  {
    record = this.constructor._records[i];

    if(record._cid === cid)
    {
      this.constructor._records.splice(i,1);
    }
  }

  this.constructor._run_plugins("remove", this, callback);
}

// Private

Retain._run_plugins = function(method, initialValue, callback)
{
  if(callback)
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
        self.emit("error", res);
        callback(null,err)
      });
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
    if(this._plugins[i][method])
    {
      promises.push(this._plugins[i][method].bind(this._plugins[i]));
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
        return (typeof val === "string");
        break;
      case "Boolean":
        return (typeof val === "boolean");
        break;
      case "Number":
        return (typeof val === "number");
        break;
      case "Array":
      case "Object":
      case "Date":
        return (val instanceof attr);
        break;
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
