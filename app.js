//========================================================================
// SETUP
//========================================================================

const express               = require("express"),
      mongoose              = require("mongoose"),
      passport              = require("passport"),
      bodyParser            = require("body-parser"),
      User                  = require("./models/user"),
      LocalStrategy         = require("passport-local"),
      passportLocalMongoose = require("passport-local-mongoose")

const app = express();
const port = 3000;

// Express Options: View and Parsing
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extend: true}));

// Express Options: Session
app.use(require("express-session")({
    secret: "Purple Kisses",
    resave: false,
    saveUninitialized: false
}));

// Express Options: Passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Mongoose
mongoose.connect('mongodb://localhost/Authentication', {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {console.log("Connected to database.");});

//========================================================================
// ROUTES
//========================================================================
app.get("/", function(req, res){
    res.render("home");
});

app.get("/secret", (req, res) => {
   res.render("secret"); 
});

app.get("/register", (req, res) => {
   res.render("register");
});

app.post("/register", (req, res) => {
	var username = req.body.usernameInput;
	var password = req.body.usernameInput;
	
	User.register(new User({username: username}), password, (err, user) => {
		if(err) {
			console.log(err);
			res.render("register");
		} else {
			passport.authenticate("local")(req, res, () => {
				res.redirect("/secret");
			});
		}
	});
});

app.get("/login", (req, res) => {
   res.render("login");
});

app.post("/login", (req, res) => {
	var username = req.body.usernameInput;
	var password = req.body.usernameInput;
	
	// Handled by middleware.
	res.render("login"); // TO BE MOVED
});

app.get("/logout", (req, res) => {
    res.redirect("/");
});

app.get("*"), (req, res) => {
	res.redirect("/");
}

//========================================================================
// LISTEN
//========================================================================

app.listen(port, () => {
    console.log(`Authentication Demo started on port ${port}.`);
})