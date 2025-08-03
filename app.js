if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");

const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dbUrl = process.env.ATLASDB_URL;

// start the server
app.listen(8080, ()=> {
    console.log("server is listening to port 8080");
});


// connecting Express to MongoDB using Mongoose
async function main(){
    await mongoose.connect(dbUrl);
}

main()
    .then(() => {console.log("connected to DB");})
    .catch(err => console.log(err));

// testing the listing  
// app.get("/testListing", async (req, res) =>{
//     let sampleListing = new Listing({
//         title: "home",
//         description: "very good location",
//         price: 1200,
//         location: "Dhantoli, California",
//         country: "Gannu"
//     });
//     await sampleListing.save();
//     console.log("sampple was saved");
//     res.send("successful testing");
// });


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24*3600, //in sec
});

store.on("error", () => {
    console.log("ERROR in MONGO SESSION STORE", err);
});

// Using Sessions and flash and passport
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7,
        httpOnly: true,
    }
};



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// Demo-User
// app.get("/demouser", async(req, res) => {
//     let fakeUser = new User({
//         email: "abc@gmail.com",
//         username: "student",
//     });
//     let registerdUser = await User.register(fakeUser, "password123");
//     res.send(registerdUser);
// });



// router for listings route
app.use("/listings", listingRouter);

// router for reviews route
app.use("/listings/:id/reviews", reviewRouter);

// router for user
app.use("/", userRouter);


// handle error of undefined routes
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

// custom error
app.use((err, req, res, next) => {
    let {statusCode=500, message="something went wrong"} = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs", {err});
})