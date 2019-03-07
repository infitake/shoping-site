const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const { validationResult } = require('express-validator/check');

const crypto = require('crypto');
// const sendgridTransport = require('nodemailer-sendgrid-transport');
const User = require('../models/user');
var author;
const transporter = nodemailer.createTransport({
  service: 'gmail',
  secure: false,
  port: 25,
  auth: {
    user: 'infirao@gmail.com',
    pass: '748452@ry'
  },
  tls: {
    rejectUnauthorized: false
  }
  // sendgridTransport({
  //   auth: {
  //     api_key:
  //       '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'
  //   }
  // })
});

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message,
    userInput: {
      name: "",
      email: "",
      password: "",
      conform_password: ""
    },
    validError: []
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        console.log("email is wrong budy!");
        req.flash('error', 'Invalid email or password.');
        return res.redirect('/login');
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');
            });
          }
          console.log("password is wrong budy!");
          req.flash('error', 'Invalid email or password.');
          res.redirect('/login');
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const conform_password = req.body.conform_password;
  const error = validationResult(req);
  if(!error.isEmpty()){
    console.log(error.array())
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: error.array()[0].msg,
      userInput: {
        name: username,
        email: email,
        password: password,
        conform_password: conform_password
      },
      validError: error.array()
    });
  }
    return  bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
          const user = new User({
            name: username,
            email: email,
            password: hashedPassword,
            cart: { items: [] }
          });
          return user.save();
        })
        .then(result => {
          res.redirect('/login');
          return transporter.sendMail({
            from: 'infirao@gmail.com',
            to: email,
            subject: 'Signup succeeded!',
            html: '<h1>You successfully signed up!</h1>'
          }, (error, info) => {
            if(error) {
              return console.log(error);
            }
            console.log("the message was sent!");
            console.log(info);
          });
        })
        .catch(err => {
          console.log(err);})
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};
exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if(err) {
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({email: req.body.email})
    .then(user => {
      if(!user) {
        req.flash('error', 'Enter the Right Email Id');
        return res.redirect("/reset");
      }
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;
      return user.save();
    })
    .then(result => {
      res.redirect('/');
      return transporter.sendMail({
        from: 'infirao@gmail.com',
        to: req.body.email,
        subject: 'Reset Password',
        html: `
            <p>You requested a password reset</p>
            <p>Click this <a href="http://localhost:3000/resetPassword/${token}">link</a> to set a new password.</p>
          `
      }, (error, info) => {
        if(error) {
          return console.log(error);
        }
        author=token;
        console.log("the message was sent!");
        console.log(info);
      });
    })
  })
};

exports.getresetPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then(user => {
      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render('auth/resetPassword', {
        path: '/resetPassword',
        pageTitle: 'New Password',
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postresetPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId
  })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(result => {
      res.redirect('/login');
    })
    .catch(err => {
      console.log(err);
    });
};
