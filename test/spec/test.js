var retain = require("../../lib/index");
var should = require("chai").should();
var assert = require("chai").assert;

describe("Retain", function()
{
  var Movie = retain.extend();

  describe("static methods", function()
  {
    it("should create a new Retain instance without error", function(done)
    {
      Movie.should.have.property('extend');
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

    it("should create a Retain instance with attributes",function(done)
    {
      Movie.attrs({
        name:String,
        watched:Boolean,
        duration: Number,
        categories: Array,
        info: Object,
        year: Date
      })

      var attrs = Movie._attrs;

      attrs.should.have.property("name");
      attrs.should.have.property("watched");
      attrs.should.have.property("duration");
      attrs.should.have.property("categories");
      attrs.should.have.property("info");
      attrs.should.have.property("year");

      done();

    });

    it("should create a new record", function(done)
    {
      var fightClub = Movie.new();
      fightClub.should.have.property("get")

      done();
    });

    it("should create a new record remotelly", function(done)
    {
      var fightClub = Movie.new(function(record)
      {
        record.should.have.property("get")
        done();
      })

    });

    it("should set a property", function(done)
    {
      var goodFellas = Movie.new();
      goodFellas.set({"name": "Goodfellas"})

      assert.equal(goodFellas.get("name"), "Goodfellas");

      done();
    });

    it("should set a property remotelly", function(done)
    {
      var goodFellas = Movie.new();
      goodFellas.set({"name": "Goodfellas"}, function(record)
      {
        assert.equal(record.get("name"), "Goodfellas");
        done();
      })
    });

    it("should validate the record attributes after creation", function(done)
    {
      var pulpFiction = Movie.new()

      pulpFiction.set({"name":"Pulp Fiction"});

      assert.equal(pulpFiction.get("name"), "Pulp Fiction");

      pulpFiction.set({
        watched: true,
        duration: 154
      });

      assert.equal(pulpFiction.get("watched"), true);
      assert.equal(pulpFiction.get("duration"), 154);

      done();
    });

    it("should return all the movies",function(done)
    {
      assert.equal(Movie.all().length, 5);
      done();
    });

    it("should return all the movies remotelly",function(done)
    {
      Movie.all(function(records)
      {
        assert.equal(records.length, 5);
        done();
      })

    });

    it("should get movie by cid",function(done)
    {
      record = Movie.find(2);
      assert.equal(record.get("name"), "Goodfellas");
      done();
    });

    it("should get movie by id remotelly",function(done)
    {
      Movie.find(2, function(id)
      {
        record =  Movie.find(2);
        assert.equal(record.get("name"), "Goodfellas");
        done();
      });
    });

  });

})