if (process.env.NODE_ENV !== 'production') { //if in development mode
    require('dotenv').config() //i want have accesss .env files
}

const express = require('express'); //express to put the server on and defining routes
const path = require('path'); //path to use __dirname and search views dir from app.js exec
const mongoose = require('mongoose'); //mongoose to interact w mongoDB
const ejsMate = require('ejs-mate'); //ejs-mate to display dynamic js in html
const ExpressError = require('./utils/ExpressError'); //custom express error made by me
const methodOverride = require('method-override'); //method-override to let we make other types of req by browser forms other than get and post
const session = require('express-session') //express-session to have session data stored server-side
const flash = require('connect-flash') //flash pop-us
const passport = require('passport')
const LocalStrategy = require('passport-local')
const mongoSanitize = require('express-mongo-sanitize'); //prevent $ and . characters security issues
const helmet = require('helmet') //helmet for security on http headers
const MongoStore = require('connect-mongo'); //store sessions on mongo

//require Routes
const campgroundsRoutes = require('./routes/campgrounds') //campgrounds routes
const userRoutes = require('./routes/users')
const reviewsRoutes = require('./routes/reviews') //review routes
const User = require('./models/user') //require user model

const dbUrl = process.env.DB_URL //Atlas cloud DB
// const dbUrl = 'mongodb://localhost:27017/yelp-camp' //local DB
//connect to database
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})
mongoose.connection.on("error", console.error.bind(console, "connection error:"));
mongoose.connection.once("open", () => {
    console.log("Database connected");
});

//start server
const app = express();

//configure server
app.config = function () {
    this.engine('ejs', ejsMate) //use ejsMate for all ejs templates
    this.set('views', path.join(__dirname, 'views')) //set views directory
    this.set('view engine', 'ejs'); //use ejs as view engine

    this.use(express.urlencoded({ extended: true })); //parse the data from http requests and turn into key-value pairs
    this.use(methodOverride('_method')); //use methodOverride if querystring '_method' is passed
    this.use(express.static(path.join(__dirname, 'public'))) //serve static assets from public directory
    app.use(mongoSanitize()); //security nosql injection issue

    const oneWeekInMilisec = 1000 * 60 * 60 * 24 * 7

    const store = MongoStore.create({
        mongoUrl: dbUrl,
        touchAfter: 24 * 60 * 60, // session be updated only one time in a period of 24 hours
        crypto: {
            secret: 'thisshouldbeabettersecret!'
        }
    });

    store.on('error', function (e) {
        console.log('session store error', e)
    })

    const sessionConfig = {
        store, //prevent default store which is memory store (not great)
        name: 'session',
        secret: 'thisshouldbeabettersecret!',
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 3 * oneWeekInMilisec, //expires in 3 days
            httpOnly: true, //the cookie cannot be accessed through client-side scripts
            // secure: true //the cookies can only be accesed through https
        }
    }
    this.use(session(sessionConfig)) //session config
    this.use(flash()) //flash pop-ups
    const scriptSrcUrls = [
        "https://stackpath.bootstrapcdn.com/",
        "https://api.tiles.mapbox.com/",
        "https://api.mapbox.com/",
        "https://kit.fontawesome.com/",
        "https://cdnjs.cloudflare.com/",
        "https://cdn.jsdelivr.net",
    ];
    const styleSrcUrls = [
        "https://kit-free.fontawesome.com/",
        "https://stackpath.bootstrapcdn.com/",
        "https://api.mapbox.com/",
        "https://api.tiles.mapbox.com/",
        "https://fonts.googleapis.com/",
        "https://use.fontawesome.com/",
        "https://cdn.jsdelivr.net",
    ];
    const connectSrcUrls = [
        "https://api.mapbox.com/",
        "https://a.tiles.mapbox.com/",
        "https://b.tiles.mapbox.com/",
        "https://events.mapbox.com/",
    ];
    const fontSrcUrls = [];
    this.use(
        helmet.contentSecurityPolicy({
            directives: {
                defaultSrc: [],
                connectSrc: ["'self'", ...connectSrcUrls],
                scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
                styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
                workerSrc: ["'self'", "blob:"],
                objectSrc: [],
                imgSrc: [
                    "'self'",
                    "blob:",
                    "data:",
                    "https://res.cloudinary.com/dzmc7wwus/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                    "https://images.unsplash.com/",
                ],
                fontSrc: ["'self'", ...fontSrcUrls],
            },
        })
    );

    //initialize passport
    this.use(passport.initialize())
    this.use(passport.session()) //use application-level middleware (after session middleware)
    passport.use(new LocalStrategy(User.authenticate())); // tell passport to use LocalStrategy and the authentication method is on User method
    passport.serializeUser(User.serializeUser()); //how to store the user in the session
    passport.deserializeUser(User.deserializeUser()); //how to unstore the user in the session


    this.use((req, res, next) => { //middleware to pass to res.locals
        //res.locals holds variables accessible to the views rendered, when we want to dislay something on the page based on some variable, it helps!  
        res.locals.success = req.flash('success')
        res.locals.error = req.flash('error')
        res.locals.currentUser = req.user
        next()
    })

    //routes middlewares
    this.use('/', userRoutes)
    this.use('/campgrounds', campgroundsRoutes)
    this.use('/campgrounds/:id/reviews', reviewsRoutes)
}
app.config()

app.get('/', (req, res) => {
    res.render('home')
})

//if any other route do not match, throw error
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

//error catching
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

//start listening
app.listen(3000, () => {
    console.log('Serving on port 3000')
})


