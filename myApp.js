// web link: https://desolate-chamber-08576.herokuapp.com/

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
require('dotenv').config();

/**********************************************
* 3. FCC Mongo & Mongoose Challenges
* ==================================
***********************************************/

/** # MONGOOSE SETUP #
/*  ================== */

/** 1) Install & Set up mongoose */
// Add mongodb and mongoose to the project's package.json. Then require 
// mongoose. Store your Mongo Atlas database URI in the private .env file 
const mongoose = require('mongoose');
const mongoString = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_NAME}.rlmjk.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`

mongoose.connect(mongoString, { useUnifiedTopology: true, useNewUrlParser: true })

mongoose.connection.on("error", function (error) {
  console.log(error)
})
mongoose.connection.on("open", function () {
  console.log("Connected to MongoDB database.")
})

/** # SCHEMAS and MODELS #
/*  ====================== */

/** 2) Create a 'Person' Model */
// Each schema maps to a MongoDB collection and defines the shape of the documents within it.
// A model allows you to create instances of your objects, called **documents**.
// Use mongoose basic *schema types* & validators.(http://mongoosejs.com/docs/guide.html).
var schema = mongoose.Schema
var personSchema = new schema({
  name: { type: String, required: true }, //make it req
  age: Number,
  favoriteFoods: [String] //arr
})
var Person = mongoose.model('Person', personSchema)
let Person1 = Person({ name: "han", favoriteFoods: ["bruchetta", "carpeccio"] })

/** # [C]RUD part I - CREATE #
/*  ========================== */

/** 3) Create and Save a Person */
// Create a `document` instance using the `Person` constructor you build before.
// Pass to the constructor an object then call the method `document.save()` on the returned
// document instance, passing to it a callback using the Node convention.
// All the **CRUD** methods take a callback function like this as the last argument.

var createAndSavePerson = function (done) {
  var person1 = new Person({ name: "Janek", age: 64, favoriteFoods: ["egg", "bacon"] });

  person1.save(function (err, data) {
    if (err) return console.error(err);
    done(null, data)
  });
};

/** 4) Create many People with `Model.create()` */
// Sometimes you need to create many Instances of your Models,
// Here, create many people using Model.create() with the argument arrayOfPeople.
// Note: You can reuse the model you instantiated in the previous exercise.
var arrayOfPeople = [
  { name: "Fran", age: 7, favoriteFoods: ["Chocolate"] },
  { name: "Ren", age: 6 },
  { name: "Emmy", age: 8, favoriteFoods: ["Pizza"] }
];

var createManyPeople = function (arrayOfPeople, done) {
  Person.create(arrayOfPeople, function (err, people) {
    if (err) return console.log(err);
    done(null, people);
  });
};

/** # C[R]UD part II - READ #
/*  ========================= */

/** 5) Use `Model.find()` */

// Find all the people having a given name, using `Model.find() -> [Person]`
// In its simplest usage, `Model.find()` accepts a **query** document (a JSON
// object ) as the first argument, and returns an **array** of matches.
// It supports an extremely wide range of search options. Check it in the docs.
let personName = "Ren";
var findPeopleByName = function (personName, done) {
  Person.find({ name: personName }, function (err, personFound) {
    if (err) return console.log(err);
    done(null, personFound);
  });
};

/** 6) Use `Model.findOne()` */

// `Model.findOne()` behaves like `.find()`, but it returns **only one**
// document, even if there are more. It is especially useful
// when searching by properties that you have declared as unique.
var findOneByFood = function (food, done) {
  Person.findOne({ favoriteFoods: food }, function (err, data) {
    if (err) return console.log(err);
    done(null, data);
  });
};

/** 7) Use `Model.findById()` */

// When saving a document, mongodb automatically add the field `_id`,
// and set it to a unique alphanumeric key.`moongose` provides a dedicated
// method for it. Find the (only!!) person having a certain Id, using `Model.findById() -> Person`.
var findPersonById = function (personId, done) {
  Person.findById(personId, function (err, data) {
    if (err) return console.log(err);
    done(null, data);
  });
};

/** # CR[U]D part III - UPDATE # 
/*  ============================ */

/** 8) Classic Update : Find, Edit then Save */

// Mongoose has a dedicated updating method : `Model.update()`
// It can bulk edit many documents matching certain criteria, but it doesn't
// pass the edited document to its callback, only a 'status' message.

// [*] Hint: This may be tricky if in your `Schema` you declared
// `favoriteFoods` as an `Array` without specifying the type (i.e. `[String]`).
// In that case `favoriteFoods` defaults to `Mixed` type, and you have to
// manually mark it as edited using `document.markModified('edited-field')`
// (http://mongoosejs.com/docs/schematypes.html - #Mixed )
const findEditThenSave = (personId, done) => {
  const foodToAdd = 'hamburger';

  Person.findById(personId, (err, personFound) => {
    if (err) return console.log(err);

    personFound.favoriteFoods.push(foodToAdd);

    personFound.save((err, updatedPerson) => {
      if (err) return console.log(err);
      done(null, updatedPerson)
    })
  })
};

/** 9) New Update : Use `findOneAndUpdate()` */

// Recent versions of `mongoose` have methods to simplify documents updating.
// Some more advanced features (i.e. pre/post hooks, validation) beahve
// differently with this approach, so the 'Classic' method is still useful in
// many situations. `findByIdAndUpdate()` can be used when searching by Id.
/*
var findAndUpdate = function (personName, done) {
  var ageToSet = 20;
  Person.findOne({ name: personName }, function (err, personFound) {
    if (err) return console.log(err);
    personFound.age = ageToSet
    personFound.save((err, updatedPerson) => {
      if (err) return console.log(err);
      done(null, updatedPerson);
    })
  })
};*/
const findAndUpdate = (personName, done) => {
  const ageToSet = 20;
  Person.findOneAndUpdate({ name: personName }, { age: ageToSet }, { new: true }, (err, updatedDoc) => {
    if (err) return console.log(err);
    done(null, updatedDoc);
  })
};

/** # CRU[D] part IV - DELETE #
/*  =========================== */

/** 10) Delete one Person */

// Delete one person by her `_id`. You should use one of the methods
// `findByIdAndRemove()` or `findOneAndRemove()`. They are similar to the
// previous update methods. They pass the removed document to the cb.
// As usual, use the function argument `personId` as search key.

var removeById = function (personId, done) {

  done(null/*, data*/);

};

/** 11) Delete many People */

// `Model.remove()` is useful to delete all the documents matching given criteria.
// Delete all the people whose name is "Mary", using `Model.remove()`.
// Pass to it a query ducument with the "name" field set, and of course a callback.
//
// Note: `Model.remove()` doesn't return the removed document, but a document
// containing the outcome of the operation, and the number of items affected.
// Don't forget to pass it to the `done()` callback, since we use it in tests.

var removeManyPeople = function (done) {
  var nameToRemove = "Mary";

  done(null/*, data*/);
};

/** # C[R]UD part V -  More about Queries # 
/*  ======================================= */

/** 12) Chain Query helpers */

// If you don't pass the `callback` as the last argument to `Model.find()`
// (or to the other similar search methods introduced before), the query is
// not executed, and can even be stored in a variable for later use.
// This kind of object enables you to build up a query using chaining syntax.
// The actual db search is executed when you finally chain
// the method `.exec()`, passing your callback to it.
// There are many query helpers, here we'll use the most 'famous' ones.

// Find people who like "burrito". Sort them alphabetically by name,
// Limit the results to two documents, and hide their age.
// Chain `.find()`, `.sort()`, `.limit()`, `.select()`, and then `.exec()`,
// passing the `done(err, data)` callback to it.

var queryChain = function (done) {
  var foodToSearch = "burrito";

  done(null/*, data*/);
};

/** **Well Done !!**
/* You completed these challenges, let's go celebrate !
 */

/** # Further Readings... #
/*  ======================= */
// If you are eager to learn and want to go deeper, You may look at :
// * Indexes ( very important for query efficiency ),
// * Pre/Post hooks,
// * Validation,
// * Schema Virtuals and  Model, Static, and Instance methods,
// * and much more in the [mongoose docs](http://mongoosejs.com/docs/)


//----- **DO NOT EDIT BELOW THIS LINE** ----------------------------------

exports.PersonModel = Person;
exports.createAndSavePerson = createAndSavePerson;
exports.findPeopleByName = findPeopleByName;
exports.findOneByFood = findOneByFood;
exports.findPersonById = findPersonById;
exports.findEditThenSave = findEditThenSave;
exports.findAndUpdate = findAndUpdate;
exports.createManyPeople = createManyPeople;
exports.removeById = removeById;
exports.removeManyPeople = removeManyPeople;
exports.queryChain = queryChain;







/**********************************************
* 2. Basic Node and Express
* ==================================
***********************************************/
// --> 7)  Mount the Logger middleware here
app.use("/",
  function (req, res, next) {
    var string = req.method + " " + req.path + " - " + req.ip;
    console.log(string);
    next();
  });

// --> 11)  Mount the body-parser middleware  here
app.use(bodyParser.urlencoded({ extended: false })) // parse application/x-www-form-urlencoded
app.use(bodyParser.json()) // parse application/json
console.log(bodyParser);

/** 1) Meet the node console. */
console.log("Hello World")

/** 2) A first working Express Server 
app.get("/", function(req, res) {
  res.send("Hello Express");
});


/** 3) Serve an HTML file */
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

/** 4) Serve static assets  */
app.use(express.static(__dirname + "/public"));

/** 5) serve JSON on a specific route 
app.get("/json", (req, res) => {
  res.json({
    message: "Hello json"
  });
});

/** 6) Use the .env file to configure the app */
app.get("/json", (req, res) => {
  var response;

  if (process.env.MESSAGE_STYLE === 'uppercase') {
    response = "HELLO JSON";
  } else {
    response = "Hello json";
  }
  res.json({
    message: response
  });
});

/** 7) Root-level Middleware - A logger */
//  place it before all the routes !

/** 8) Chaining middleware. A Time server */
app.get("/now", function (req, res, next) {
  req.time = new Date().toString();
  next();
}, function (req, res) {
  res.json({ time: req.time });
})

/** 9)  Get input from client - Route parameters */
app.get("/:word/echo/:word2", (req, res) => {
  res.json({
    echo: req.params.word,
    echo2: req.params.word2
  });
});

/** 10) Get input from client - Query parameters */
// /name?first=<firstname>&last=<lastname>
app.get("/name", (req, res) => {
  let fullname = req.query.first + " " + req.query.last;
  res.json({
    name: fullname
  })
})

/** 11) Get ready for POST Requests - the `body-parser` */
// place it before all the routes !


/** 12) Get data form POST  */
app.post("/name", (req, res) => {
  res.json({ name: req.body.first + " " + req.body.last })
})


// This would be part of the basic setup of an Express app
// but to allow FCC to run tests, the server is already active
/** app.listen(process.env.PORT || 3000 ); */

//---------- DO NOT EDIT BELOW THIS LINE --------------------

module.exports = app;
