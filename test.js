var Retain = require("./index")

// var Model = Retain.extend();

// Model.attrs({
//   name:String,
//   active:false,
//   id:Number
// })

// Model.new()

var ActiveRecord = Retain.extend();

ActiveRecord.attrs({
  description:String
})

var record = ActiveRecord.new({description:"teste"})

console.log(record.get("description"));

record.set("description", "Ola")

console.log(record.get("description"));

// console.log("record", record);