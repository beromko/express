var express = require('express'),
	mongoose = require('mongoose'),
	cookieParser = require("cookie-parser"),
	session = require("express-session"),
	bodyParser = require("body-parser"),
	methodOverride = require("method-override");

var app = express();

app.use(express.Router());
app.set("views", __dirname + "/views");
app.set("view engine", "jade");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({"extended": true}));

app.use(methodOverride(function(req, res){
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}));

app.use(cookieParser());
app.use(session({
	secret: "ollla",
	resave: true,
	saveUninitialized: true
}));



/* DB CONNECT */
mongoose.connect("mongodb://localhost/express");
var UserSchema = new mongoose.Schema ({
	name: String,
	email: String,
	age: Number
});
Users = mongoose.model("Users", UserSchema);

/* LIST  */
app.get("/dbusers", function (req, res){
	Users.find({}, function (err, docs) {
		res.render("users/index", {users: docs});
	});
});

/* ADD */
app.get("/dbusers/new", function (req, res){
	res.render("users/new");
});

/*	SAVE  */
app.post("/dbusers", function (req, res){
	var b = req.body;
	new Users({
		name: b.name,
		email: b.email,
		age: b.age
	}).save(function (err, user) {
		if (err) res.json(err);
		res.redirect("/dbusers/" + user.name);
	});
});

/* VIEW */ 
app.param("name", function(req, res, next, name) {
	Users.find({name: name}, function(err,docs) {
		req.user = docs[0];
		next();
	});
});

app.get("/dbusers/:name", function (req,res) {
	res.render("users/show", {user: req.user});
});

/* EDIT */
app.get("/dbusers/:name/edit", function(req, res) {
	res.render("users/edit", {user: req.user});
});

/* UPDATE */
app.put("/dbusers/:name", function (req, res) {
	var b = req.body;
	Users.update(
		{name: req.params.name},
		{name: b.name, email: b.email, age: b.age},
		function (err) {
			if (err) res.json(err);
			res.redirect("/dbusers/" + b.name);
		}
	);
});

/* DLETE */
app.delete("/dbusers/:name", function(req, res) {
	Users.remove(
		{name: req.params.name}, 
		function(err) {
			res.redirect("/dbusers")
		}
	);
});

/* NEXT implementation with counter */
app.get("/src/bootstrap.min.css", function (req, res, next) {
	counter++;
	next();
});
app.use(express.static(__dirname + "/public"));

var counter = 0;

app.get('/', function (req,res) {
	res.render("home", {"title": "Express learning"});
});

app.get("/name/:name", function (req, res) {
	res.cookie('name', req.params.name + "_cookie");
	req.session.sesname = req.params.name;
	res.send("SESSING");
});

app.get("/name", function (req, res) {
	res.send("SESSION: " + req.session.sesname + "<hr>" + "COOKIE: " + req.cookies.name);
})

app.get(/\/users\/(\d*)\/?(edit)?/, function (req,res) {
	var message = "user # " + req.params[0] + " profile";
	if (req.params[1] === "edit") {
		message = "EDITING " + message;
	} else {
		message = "VIEWING " + message;
	}
	res.render("home", {"title": message});
});

var users = ["user1","user2","user3","user4","user5","user6","user7","user8","user9","user10"];

app.get("/counter", function (req, res) {
	res.send("" + counter + " requests");
});

app.get('/fromto/:from-:to', function (req,res) {
	var from = parseInt(req.params.from, 10),
		to = parseInt(req.params.to, 10);
	res.json(users.slice(from, to + 1));
});

app.post('/users', function (req,res) {
	res.send("Creating user with the name " + req.body.username + " ...");
	console.log(req.body);
});

app.use(function (req, res) {
	res.status(404).send("Oops!");
});

app.listen (3001, function() {
	console.log("express listeing on 3001");
});