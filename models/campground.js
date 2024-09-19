const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema; //require mongoose.Schema, different than JOI Schema
const { cloudinary } = require('../cloudinary')

const ImageSchema = new Schema({
    _id: false,
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
})

const opts = { toJSON: { virtuals: true } } //include virtuals when converting to json

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ["Point"], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [ //array of ids referent to objects of the review model
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
}, opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<img class=img-popup src=${this.images[0].url}></img><strong><a class=popup-anchor href=/campgrounds/${this._id}>${this.title}</a></strong>`
})

//delete middleware
//if a campground is removed, all reviews associated are removed too:
CampgroundSchema.post('findOneAndDelete', async function (camp) {
    for (let image of camp.images) {
        await cloudinary.uploader.destroy(image.filename) //delete images from cloudinary
    }
    if (camp) {
        await Review.deleteMany({
            _id: {
                $in: camp.reviews //remove all reviews that have an id that is on camp.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);