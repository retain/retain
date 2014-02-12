var Q = require("q");

module.exports = function()
{
  return {
    new:function(record)
    {
      return Q(record);
    }
  };
}