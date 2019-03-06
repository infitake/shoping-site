const express = require('express');

const authController = require('../controllers/auth');


const router = express.Router();

router.get('/login', authController.getLogin);

router.post('/login', authController.postLogin);

router.get('/signup', authController.getSignup);

router.get('/resetPassword/:token', authController.getresetPassword);

router.post('/signup', authController.postSignup);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.post('/resetPassword', authController.postresetPassword);

router.post('/logout', authController.postLogout);


module.exports = router;