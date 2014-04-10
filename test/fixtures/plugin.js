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
        record.id = 10000;
        deferred.resolve(record);
      }
      return deferred.promise;
    },
    set:function(record)
    {
      return Q(record);
    },
    remove:function(record)
    {
      return Q(record);
    },
    find:function(record)
    {
      return Q(record);
    },
    config:{}
  };

  return plugin;
}