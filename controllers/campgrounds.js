const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary') 
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1,
    }).send()
    console.log('geoData: ', geoData)
    if(!geoData.body.features.length){
        req.flash('error', 'Invalid Localtion. Please try again!')
        res.redirect(`/campgrounds/new`)
    }
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry
    campground.images = req.files.map(f => ({
        url: f.path,
        filename: f.filename
    }))
    console.log(campground.images)
    campground.author = req.user._id //author is the logged in user
    await campground.save();
    console.log("CAMPGROUND CREATED: " + campground)
    req.flash('success', 'Successfully made campground') //flash pop-up
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req, res,) => {
    const campground = await Campground.findById(req.params.id)
        .populate({
            path: 'reviews',
            populate: 'author'
        }) //NESTING POPULATE! populate authors from reviews
        .populate('author');
    if (!campground) {
        req.flash('error', 'Campground not found.')
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    campground.images.push(...(req.files.map(f => ({
        url: f.path,
        filename: f.filename
    }))))

    if (req.body.deleteImages) { //if images to delete
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename) //delete images from cloudinary
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } }) //delete images from DB that filenames in req.body.deleteImages

        console.log('campground.images.length: ', campground.images.length)
        console.log('req.body.deleteImages.length: ', req.body.deleteImages.length)

        if (campground.images.length - req.body.deleteImages.length === 0) {
            campground.images.push({
                url: 'https://res.cloudinary.com/dzmc7wwus/image/upload/v1726585016/360_F_460013622_6xF8uN6ubMvLx0tAJECBHfKPoNOR5cRa_wv5vtf.jpg',
                filename: 'DefaultIMG'
            })
        } 
    }

    if(campground.images.length > 1){
        await campground.updateOne({ $pull: { images: { filename: 'DefaultIMG' } } }) //delete defaultIMG from MongoDB campground data
    }

    await campground.save()
    req.flash('success', 'Successfully updated campground') //flash pop-up
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground') //flash pop-up
    res.redirect('/campgrounds');
}