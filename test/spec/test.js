var retain = require("../../lib/index");
var should = require("chai").should();
var assert = require("chai").assert;

describe("Retain", function()
{
  var Movie = retain.extend();

  console.log(Movie.prototype);

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
  });

  describe("instance methods", function()
  {
    it("should create a new record", function(done)
    {
      var fightClub = Movie.new();
      fightClub.should.have.property("get")

      done();
    });

    it("should set and get a property", function(done)
    {
      var goodFellas = Movie.new();
      goodFellas.set("name", "Goodfellas")

      assert.equal(goodFellas.get("name"), "Goodfellas");

      done();
    });

    it("should validate the record attributes at creation", function(done)
    {
      var wakingLife = Movie.new({
        name:"Waking Life", 
        watched: true,
        duration: 99,
        categories: ["Animation", "Drama"], 
        info: {director:"Richard Linklater", writer:"Richard Linklater"},
        year: new Date(2001, 4, 12)
      });

      assert.equal(wakingLife.get("name"), "Waking Life");

      done();
    });

    it("should validate the record attributes after creation", function(done)
    {
      var pulpFiction = Movie.new()

      pulpFiction.set("name", "Pulp Fiction");

      assert.equal(pulpFiction.get("name"), "Pulp Fiction");

      pulpFiction.set({
        watched: true,
        duration: 154
      });

      assert.equal(pulpFiction.get("watched"), true);
      assert.equal(pulpFiction.get("duration"), 154);

      done();
    });

    it("should use the promise",function(done)
    {
      var v = Movie.new();
      v.set("name","V")

      console.log(Movie.all().length);
      Movie.p.all().then(function(data)
      {
        console.log(data.length);
      })

      console.log(v.save().get("name"));

      v.p.save().then(function(record)
      {
        console.log(record.get("name"));
      })

      done();
    });

  });

})