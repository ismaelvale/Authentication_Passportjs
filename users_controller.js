const User = require('./models/users');
const Messages = require('./models/messages');
const async = require('async');

exports.user_profile = async(req, res, next) => {
    const user = await User.find({ user: req.params.id });
    const messages = await Messages.find({ user: req.params.id }).sort({ _id: -1 });
    if (err) { return next(err); }
      if (user==null) { // No results.
        var err = new Error('User not found');
        err.status = 404;
        return next(err);
      }
      //Successful, so render
      res.render('users', {  user: user[0]._doc, messages: messages });
    };