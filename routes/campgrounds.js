const express = require('express') //express
const multer  = require('multer') //multer for parsing files from forms
const {storage} = require('../cloudinary') //node automattically looks for the index file
const upload = multer( {storage} ) //destination of files
const router = express.Router() //dont need mergeParams: true, because all id are on the routes at this file
const campgrounds = require('../controllers/campgrounds') //campground controller
//middlewares
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware')


//utils
const catchAsync = require('../utils/catchAsync');

router.route('/')
    //see all campgrounds page
    .get(
        catchAsync(campgrounds.index))
    //add campground
    .post(
        isLoggedIn, 
        upload.array('image'),
        validateCampground, 
        catchAsync(campgrounds.createCampground))

//see add campground page
router.get('/new', 
    isLoggedIn, 
    campgrounds.renderNewForm)

router.route('/:id')
    //show campground page
    .get(
        catchAsync(campgrounds.showCampground))
    //edit campground
    .put(
        isLoggedIn, 
        isAuthor, 
        upload.array('image'),
        validateCampground, 
        catchAsync(campgrounds.updateCampground))
    //delete campground
    .delete(
        isLoggedIn, 
        isAuthor, 
        catchAsync(campgrounds.deleteCampground))

//show edit campground page
router.get('/:id/edit', 
    isLoggedIn, 
    isAuthor, 
    catchAsync(campgrounds.renderEditForm))


module.exports = router