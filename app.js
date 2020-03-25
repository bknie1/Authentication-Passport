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

// MongoDB
mongoose.connect('mongodb://localhost/Authentication', {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {console.log("Connected to database.");});

// Express Options: Passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//========================================================================
// ROUTES
//========================================================================
app.get("/", function(req, res){
    res.render("home");
});

// If the user is logged in, allow. Otherwise, redirect.
app.get("/secret", isLoggedIn, (req, res) => {
   res.render("secret"); 
});

app.get("/register", (req, res) => {
   res.render("register");
});

app.post("/register", (req, res) => {
	console.log("Registering.");
	User.register(new User({username: req.body.username}), req.body.password, (err, user) => {
		if(err) {
			console.log(err);
			res.render("register");
		} else {
			passport.authenticate("local")(req, res, () => {
				console.log("Registered. Redirecting.");
				res.redirect("/secret");
			});
		}
	});
});

app.get("/login", (req, res) => {
   res.render("login");
});

//
app.post("/login", passport.authenticate("local", {
	successRedirect: "/secret",
	failureRedirect: "/login"
}), (req, res) => {
	console.log("Signed in.");
});

app.get("/logout", (req, res) => {
	req.logout(); // Destroys all user data in the session.
    res.redirect("/");
});

app.get("*"), (req, res) => {
	res.redirect("/");
}
//========================================================================
// MIDDLEWARE
//========================================================================
function isLoggedIn(req, res, next) {
	// isAuthenticated comes with Passport.
	if(req.isAuthenticated()) {
		return next(); // Next isn't specified, so we just continue.
	} else {
		res.redirect("/login");
	}
}
//========================================================================
// LISTEN
//========================================================================

app.listen(port, () => {
    console.log(`Authentication Demo started on port ${port}.`);
})