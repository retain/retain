var Retain = require("./index")

var Model = Retain.extend();

Model.attrs({
  description:String
})

var record = Model.new({description:"teste"})

record.set("description", "Ola")

record.get("description").then(function(data)
{
  console.log("description =", data);
})