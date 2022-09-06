require('dotenv').config();
const {faker} = require('@faker-js/faker');
const { createPopper } = require('@popperjs/core');
const express = require('express');
const path = require('path');
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require('./models/users');
const Message = require('./models/messages');
const users_controller = require('./users_controller');
const { body, validationResult } = require("express-validator");
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
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')))

app.get("/", async (req, res) => {
  const messages = await Message.find({}).sort({_id: -1});
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
app.get('/profile', async (req, res) => {
  const user = await User.findOne({ username: req.user.username})
  const messages = await Message.find({ user: req.user._doc.username }).sort({ _id: -1 });
  res.render("myprofile", {user, messages});
});

app.get('/users/:id', async (req, res, next) => {
  const user = await User.findOne({ username: req.params.id });
  const messages = await Message.find({ user: req.params.id }).sort({ _id: -1 });
  if (err) { return next(err); }
    if (user==null) { // No results.
      var err = new Error('User not found');
      err.status = 404;
      return next(err);
    }
    //Successful, so render
    res.render('users', {  user: user, messages: messages });
  });

app.post("/sign-up", upload.single('profilePhoto'), (req, res, next) => {
    bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
        if (err) {
            return(err);
        }
        const user = new User({
            username: req.body.username,
            password: hashedPassword,
            profilePhoto: req.file.path,
            fullName: req.body.fullName,
        }).save(err => {
            if (err) {
                return next(err);
            }
            res.redirect('/');
        });
    });
});
app.post("/log-in", passport.authenticate('local', { failureRedirect: '/'}),
function(req, res) {
  res.redirect('/');
});

app.post('/new', upload.single('image'), function(req, res, next) {
  const message = new Message({
    image: req.file.path,
    caption: req.body.caption,
    user: req.body.user._id,
    added: new Date().toString()
  }).save(err => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  })
});

// app.post('/updatePhoto', upload.single('profilePhoto'), function(req, res, next) {
//   User.findByIdAndUpdate(req.params.id, {profilePhoto: req.file.path}, function () {
//     res.redirect('/profile');
//   })
// });

app.post('/follow/:id/:follower', async(req, res, next) => {
  const currentUser = req.user;
  const user = await User.findOne({username: req.params.id});
  currentUser.following.push(req.params.id);
  currentUser.save(err => {
    if(err) {
      return next(err);
    }});
  user.followers.push(req.params.follower);
  user.save(err => {
    if(err) {
    return next(err);
  }});
  console.log(currentUser, user);
  res.redirect(`/users/${req.params.id}`);
});

app.post('/unfollow/:id/:follower', async(req, res, next) => {
  const currentUser = req.user;
  const user = await User.findOne({username: req.params.id});
  const newFollowing = currentUser.following.filter(users => users !== req.params.id);
  const newFollowers = user.followers.filter(users => users !== req.params.follower);
  currentUser.following = newFollowing;
  currentUser.save(err => {
    if(err) {
      return next(err);
    }
  });
  user.followers = newFollowers;
  user.save(err => {
    if(err) {
      return next(err);
    }
  });
res.redirect(`/users/${req.params.id}`);
});

app.post('/like/:id/:liker', async(req, res, next) => {
  // const liked = await Message.findById({ _id : req.params.id });
  const liker = await User.findOne({ username: req.params.liker});
  Message.updateOne({_id : req.params.id }, { $inc: { likes : 1 }}).exec(err => {
    if(err) {
      return next(err);
    }
  });
  res.redirect('/');
});

app.post('/comment/:id/:commenter', async(req, res, next) => {
await Message.updateOne({_id : req.params.id}, {comments: {body: req.body.newComment, by: req.params.commenter.toString()} }).exec(err => {
  if(err){
    return next(err);
  }
});
res.redirect('/');
});

app.listen(3000, () => console.log("app listening on port 3000!"));