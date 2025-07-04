// controller logic for handling user-related operations
const User = require("../models/user")

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registerUser = await User.register(newUser, password);
        console.log(registerUser);
        req.login(registerUser, (err) => {
            if (err) return next(err);

            req.flash("success", "Welcome to wanderlust !!");
            res.redirect("/listings");

        });

    } catch (err) {
        req.flash("error", "Username already registered !!");
        return res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req, res) => {
    return res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
    req.flash("success", "Login successfully !!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl)
};

module.exports.logout=(req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);;

        req.flash("success", "You are logged out !");
        res.redirect("/listings");
    });

};