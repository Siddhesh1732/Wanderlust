const User = require("../models/user.js");


// render signup callback
module.exports.renderSignup = (req, res) => {
    res.render("users/signup.ejs");
}

// signup callback
module.exports.signup = async(req, res) => {
    try{
        let {username, email, password} = req.body;
        const newUser = new User({email, username});
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if(err) {
                return next(err);
            }
            req.flash("success", "user got registered successfully");
            res.redirect("/listings");
        })
    } catch(e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}

// render login callback
module.exports.renderLogin = (req, res) => {
    res.render("users/login.ejs");
}

// login callback
module.exports.login = async (req, res) => {
        req.flash("success", "Successfully logged in!!");
        let redirectUrl = res.locals.redirectUrl || "listings";
        res.redirect(redirectUrl);
}

// logout callback
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if(err) {
            return next(err);
        }
        req.flash("success", "you have successfully logged out!");
        res.redirect("/listings");
    })
}