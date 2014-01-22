var retain = require("../../lib/index");
var should = require("chai").should();
var assert = require("chai").assert;
var expect = require('chai').expect

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

    it("should set all the properties", function(done)
    {
      var goodFellas = Movie.new();
      goodFellas.set({
        "name": "Goodfellas",
        "watched": true,
        "duration": 146,
        "categories":["crime", "drama"],
        "info":{director:"Martin Scorsese", writers:["Nicholas Pileggi", "Martin Scorsese"]},
        "year": new Date("19 September 1990")
      })

      assert.equal(goodFellas.get("name"), "Goodfellas");

      done();
    });

    it("should set a property different than the attributes", function(done)
    {
      var goodFellas = Movie.new();
      goodFellas.set({"_id": "000"})

      assert.equal(goodFellas["_id"], "000");

      done();
    });

    it("should thrown an error if property is not valid", function(done)
    {
      var goodFellas = Movie.new();

      var fn = function()
      {
        goodFellas.set({"name": 0})
      }

      expect(fn).to.throw(Error);
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
      assert.equal(Movie.all().length, 7);
      done();
    });

    it("should return all the movies remotelly",function(done)
    {
      Movie.all(function(records)
      {
        assert.equal(records.length, 7);
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