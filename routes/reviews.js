const express = require('express') //express
const router = express.Router({ mergeParams: true }) //{mergeParams: true} to have acess to req.params.id, which is stored on app.js on app.config

const reviews = require('../controllers/reviews') //reviews controller

const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')

//utils
const catchAsync = require('../utils/catchAsync');

//add review
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

//delete review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;