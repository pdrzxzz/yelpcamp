const mongoose = require('mongoose');
const cities = require('./cities');
const campImages = require('./campImages');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

//pick up rnadom element of an array
const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 200; i++) {
    const price = Math.floor(Math.random() * 20) + 10;
    const place = sample(cities)
    const imgNum = Math.floor(Math.random() * 15) + 1
    const camp = new Campground({
      geometry: {
        type: 'Point',
        coordinates: [place.longitude, place.latitude]
      },
      author: '66e769fd8c90172630bbfbf9',
      location: `${place.city}, ${place.state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      images: [],
      description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
      price
    })
    
    for(let i=0; i<imgNum; i++){
      camp.images.push(sample(campImages))
    }
    await camp.save();
  }
}

seedDB().then(() => {
  mongoose.connection.close();
})