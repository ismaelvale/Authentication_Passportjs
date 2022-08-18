require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads');

  },
  filename: function(req, file, cb) {
cb(null, Date.now() + file.originalname)
  }
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  }
  cb(null, false);
};
const upload = multer({
  storage: storage, 
  limits: {
  fileSize: 1024 * 1024 *5
},
fileFilter: fileFilter
});


require('./mongoConfig');

// Models

const User = mongoose.model(
    'User',
    new Schema({
        username: { type: String, required: true },
        password: { type: String, required: true }
    })
);

const Message = mongoose.model(
  'Messages',
  new Schema ({
    caption: { type: String, required: true },
    user: { type: String, required: true },
    added: { type: Date, default: Date.now },
    image: { type: String, required: true }
  }));

const app = express();
app.set("views", __dirname);
app.set("view engine", "ejs");

passport.use(
    new LocalStrategy((username, password, done) => {
      User.findOne({ username: username }, (err, user) => {
        if (err) { 
          return done(err);
        }
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        bcrypt.compare(password, user.password, (err, res) => {
            if (res) {
                return done(null, user)
            } else {
                return done(null, false, { message: "Incorrect password" })
            }
        })
    });
})
);
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

app.use(session({secret: 'cats', resave: false, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));
app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    next();
});
app.use('/uploads', express.static('uploads'));

app.get("/", async (req, res) => {
    const messages = await Message.find({});
    res.render("index", { user: req.user, messages });
});
app.get("/sign-up", (req, res) => res.render("sign-up-form"));
app.get('/log-out', (req, res) => {
    req.logout(function(err) {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

app.post("/sign-up", (req, res, next) => {
    bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
        if (err) {
            return(err);
        }
        const user = new User({
            username: req.body.username,
            password: hashedPassword
        }).save(err => {
            if (err) {
                return next(err);
            }
            res.redirect('/');
        });
    });
});
app.post("/log-in", passport.authenticate("local", {
    successRedirect: '/',
    failureRedirect: '/'
})
);

app.post('/new', upload.single('image'), function(req, res, next) {
  const message = new Message({
    image: req.file.path,
    caption: req.body.caption,
    user: req.body.user,
    added: new Date().toString()
  }).save(err => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  })
});

// app.post('/new', upload.single('image'), function(req, res, next) {
//   console.log(req.file);
//     const message = {
//         image: req.file.path,
//         caption: req.body.caption,
//         user: req.body.user,
//         added: new Date().toString()
//     };
//     messages.unshift({image: message.image, caption: message.caption, user: message.user, added: message.added});
//     res.redirect('/');
//   });

app.listen(3000, () => console.log("app listening on port 3000!"));