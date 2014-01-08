var aware = require("aware");

var Retain = (function()
{

  function Retain()
  {

  }

  Retain.extend = function()
  {
    var __hasProp = {}.hasOwnProperty;
    Child = function(){}

    for (var key in Retain)
    {
      if (__hasProp.call(Retain, key)) Child[key] = Retain[key];
    }

    function ctor() {
      this.constructor = Child;
    }
    ctor.prototype = Retain.prototype;
    Child.prototype = new ctor();
    Child.__super__ = Retain.prototype;
    Child.init()
    return Child;
  }

  // Static methods and properties
  Retain.init = function()
  {
    this.klass = this.toString().match(/function\s(.*)\(\)/)[1]
    this._attrs = {}
    this._records = []
  }

  Retain.attrs = function(props)
  {
    for(key in props)
    {
      this._attrs[key] = props[key]
    }
  }

  Retain.new = function(props)
  {
    var key, record, value;

    record = new this;
    record._cid = this._records.length;

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

    return record;
  }

  // Instance methods and properties
  Retain.prototype._keys = aware()

  Retain.prototype._cid = {}

  Retain.prototype._init = function()
  {
    this.cid = this.constructor._records.length;
    this.set(arguments);
  }

  Retain.prototype.set = function()
  {
    var args = 1 <= arguments.length ? [].slice.call(arguments, 0) : [];

    if(args.length === 1)
    {
      console.log("msg");
      for(var prop in args)
      {
        if(this.constructor._attrs[prop])
        {
          this._keys.set(prop, args[prop])
        }
      }
    }
    else
    {
      this._keys.set(args[0], args[1]);
    }
  }

  Retain.prototype.get = function(prop)
  {
    return this._keys.get(prop);
  }

  return Retain;

})()

module.exports = Retain