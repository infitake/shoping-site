const express = require('express');

const authController = require('../controllers/auth');

const { check, body } = require('express-validator/check');

const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.post('/login', authController.postLogin);

router.get('/signup', authController.getSignup);

router.get('/resetPassword/:token', authController.getresetPassword);

router.post('/signup', [
    check('email')
    .isEmail()
    .withMessage("The Email Id is not Right")
    .custom((value, {req}) => {
    return User.findOne({ email: value })
        .then(userDoc => {
            if(userDoc){
          return Promise.reject(
              'Email is already exits'
          )
            }
    })
}),
    body('password',
    "Password must be of 6 length and having alpha numeric value")
    .isLength({min: 6})
    .isAlphanumeric(),
    body('conform_password')
    .custom((value,{req}) => {
        if( value !== req.body.password){
            throw new Error("Password not match");
        }
        return true;
    }),
    body('username')
    .custom((value, {req}) => {
        return User.findOne({name : value})
        .then(uname => {
            if(uname){
                return Promise.reject(
                    'This Username is already exits'
                )
            }
        }) 
    })
    ], 
    authController.postSignup);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.post('/resetPassword', authController.postresetPassword);

router.post('/logout', authController.postLogout);


module.exports = router;