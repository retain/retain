Retain
====

Javascript Model based on promises with plugins support

###Usage Draft
``` javascript
var Retain = require("./index")

var Model = Retain.extend();

Model.attrs({
  description:String
})

var record = Model.new({description:"teste"})

record.set("description", "Ola")

record.get("description") // Ola

record.save().then(function(record)
{
  console.log("record succesfully saved", record)
})
```
