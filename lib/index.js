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
    var P = function(){};

    for (var key in Retain)
    {
      if (__hasProp.call(Retain, key)) 
      {
        Child[key] = Retain[key];
        P[key] = Retain[key];
      }
    }

    P._use_promises = true;

    function ctor() {
      this.constructor = Child;
    }

    ctor.prototype = Retain.prototype;
    Child.prototype = new ctor();

    P.prototype = Child;
    Child.p = P;

    Child.__super__ = Retain.prototype;
    Child._init()


    return Child;
  }

  Retain._use_promises = false;

  // Static methods and properties
  Retain._init = function()
  {
    this.klass = this.p.klass = this.toString().match(/function\s(.*)\(\)/)[1]
    this._attrs = this.p._attrs = {}
    this._records = this.p._records = []
  }

  Retain.attrs = function(props)
  {
    for(key in props)
    {
      this._attrs[key] = props[key]
    }
  }

  Retain.prototype._use_promises = false;

  Retain.new = function(props)
  {
    var key, record, value;

    var f = new this;
    record = new this;

    record.prototype = f;
    f._cid = this._records.length;
    f._keys = {};
    var p = new this;
    p._use_promises = true;
    record.p = p;

    for(key in props) 
    {
      value = props[key];

      if (this._attrs[key]) 
      {
        record.set(key, value);
      } 
      else
      {
        record[key] = value;
      }
    }
    this._records.push(record);
    return record;
  }

  // Instance methods and properties
  Retain.prototype._keys = {}

  Retain.prototype._cid = {}

  Retain.prototype._init = function()
  {
    this.cid = this.constructor._records.length;
    this.set(arguments);
  }

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


  Retain.prototype.set = function()
  {

    var args = 1 <= arguments.length ? [].slice.call(arguments, 0) : [];

    if(args.length === 1)
    {
      for(var prop in args[0])
      {
        this._validate_prop(prop, args[0][prop]);
      }
    }
    else
    {
      this._validate_prop(args[0], args[1]);
    }
  }

  Retain.prototype.get = function(prop)
  {
    return this._keys[prop]
  }

  Retain.all = function()
  {
    if(this._use_promises)
    {
      return Q(this._records);
    }
    else
    {
      return this._records;
    }
  }

  Retain.prototype.p = {};

  return Retain;

})()

module.exports = Retain