var Q = require("q");

module.exports = function()
{
  var plugin = {
    new:function(record)
    {
      var deferred = Q.defer();
      if(plugin.config.error) 
      {
        deferred.reject({error:"error"});
      } 
      else 
      {
        record.id = Math.random() * 1000;
        deferred.resolve(record);
      }
      return deferred.promise;
    },
    set:function(record)
    {
      var deferred = Q.defer();
      if(plugin.config.error) 
      {
        deferred.reject({error:"error"});
      } 
      else 
      {
        deferred.resolve(record);
      }
      return deferred.promise;
    },
    remove:function(record)
    {
      var deferred = Q.defer();
      if(plugin.config.error) 
      {
        deferred.reject({error:"error"});
      } 
      else 
      {
        deferred.resolve(record);
      }
      return deferred.promise;
    },
    find:function(ID)
    {
      var deferred = Q.defer();
      if(plugin.config.error) 
      {
        deferred.reject({error:"error"});
      } 
      else 
      {
        record = {};
        record.id = Math.random() * 1000;
        deferred.resolve(record);
      }
      return deferred.promise;
    },
    search:function(props)
    {
      var deferred = Q.defer();
      if(plugin.config.error) 
      {
        deferred.reject({error:"error"});
      } 
      else 
      {
        record.id = Math.random() * 1000;
        deferred.resolve([record]);
      }
      return deferred.promise;
    },
    config:{}
  };

  return plugin;
}