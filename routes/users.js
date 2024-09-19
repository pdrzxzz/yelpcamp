const express = require('express')
const router = express.Router()
const passport = require('passport')
const catchAsync = require('../utils/catchAsync')
const { storeReturnTo } = require('../middleware'); //storeReturnTo retrieves info about where the guest tried to go before login, stores in res.locals.returnTo
const users = require('../controllers/users')

router.route('/register')
.get(users.renderRegister) //render register form
.post(catchAsync(users.register)) //register user

router.route('/login')
.get(users.renderLogin) //render login form
.post(storeReturnTo,  //login user
    passport.authenticate('local', { 
        failureFlash: true, 
        failureRedirect: '/login' }), 
        users.login)

router.get('/logout', users.logout);

module.exports = router