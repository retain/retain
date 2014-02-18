var Q = require("q");

module.exports = function()
{
  return {
    new:function(record)
    {
      return Q(record);
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
}