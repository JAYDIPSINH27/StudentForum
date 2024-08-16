const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const ejs = require("ejs");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const bcrypt = require("bcryptjs");
require('dotenv').config();

const app = express();

//passport config
require("./config/passport")(passport);

//DB config
const db = require("./config/keys").mongoURI;

//Connect to Mongo
mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(() => console.log("MongoDB connected.."))
  .catch((err) => console.log(err));

mongoose.set("useCreateIndex", true);

//User Model
const User = require("./models/User")
//EJS
app.use(express.static("public"));
// app.use(expressLayouts);
app.set("view engine", "ejs");

//BodyParser for partials
app.use(express.urlencoded({
  extended: false
}));

//Express session middleware
app.use(
  session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());


//connect flash
app.use(flash());

//global vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.admin_auth =req.flash("admin_auth")

  next();
})
//Routes


app.use("/", require("./routes/index"));

// app.use("/users", require("./routes/users"));

//Login Page
app.get("/login",(req,res)=>{
    res.render("login",{
      title: "Login",
      authFlag: false
    });
});

//Register Page
app.get("/register",(req,res)=>{
    res.render("register", {
      title: "Register",
      authFlag: false
    });
});

//Register Handle
app.post("/register",(req,res)=>{
    const {name,email,password,password2}=req.body;
    let errors=[];

    //check required fields
    if(!name || !email || !password || !password2){
        errors.push({msg:"Please fill in all fields"});
    }
    //Check passwords match
    if(password!==password2){
        errors.push({msg:"Passwords do not match"});
    }
    //Pass length
    if(password.length < 6){
        errors.push({msg:"Password should be at least 6 characters "});
    }
    if(errors.length >0){
        res.render("register",{
            errors,
            name,
            email,
            password,
            password2,
            title: "Register",
            authFlag: false
        });
    }else
    {
       //validation passed
       User.findOne({email: email})
       .then(user=>{
           if(user){
               //User exist
                errors.push({msg:"Email is already registered"})
               res.render("register",{
                errors,
                name,
                email,
                password,
                password2,
                title: "Register",
                authFlag: false
            });
           }else{
                const newUser=new User({
                    name,
                    email,
                    password
                });
                //Hash Password
                bcrypt.genSalt(10,(err,salt)=>
                bcrypt.hash(newUser.password,salt,(err,hash)=>{
                    if(err) throw err;
                    newUser.password=hash;
                    newUser.save()
                    .then(user=>{
                        req.flash("success_msg","You are now registered and can login");
                        res.redirect("/login");
                    })
                    .catch(err=>console.log(err));
                }));
           }
       })

    }
});

// Login Handle
app.post('/login', (req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/dashboard',
      failureRedirect: '/login',
      failureFlash: true
    })(req, res, next);
  });

// Logout
app.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/login');
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log(`Server has started on port ${PORT}`));
