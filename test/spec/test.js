var retain = require("../../lib/index");
var should = require("chai").should();

describe("Retain", function()
{
  describe("extend", function()
  {
    it("should create a new Retain instance without error", function(done)
    {
      var Model = retain.extend();
      Model.should.have.property('extend');
      done();
    });

    it("shoudl create 2 different instances of Retain",function(done)
    {
      var A = retain.extend();
      A.new()
      A._records.should.have.length(1);

      var B = retain.extend();
      B._records.should.have.length(0);

      done();
      
    });
  });
})