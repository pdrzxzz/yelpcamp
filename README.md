# About
### Hosted on: https://yelpcamp-h58h.onrender.com/
## YelpCamp is a code-along project made by Colt Steele on https://www.udemy.com/course/the-web-developer-bootcamp  
This project is a catalog of campgrounds where you can either comment on other campgrounds or post a new one.


# Tools used: 

## Stylying
**Bootstrap 5** framework
**tarability.css** -> Pre-made star rating input, available on: https://github.com/LunarLogic/starability/tree/master
**@mapbox/mapbox-sdk** -> A package for managing maps (more specific we used Mapbox GL JS which is a client-side JavaScript library for mapbox)  

## Server
**express** -> Our web framework, the core of the web app  

## Templating
**ejs** -> Embedded JavaScript templates, Allow us to display and execute JS instructions before displaying server-side data into our front-end   
**ejs-mate** -> Very useful to shrink our ejs files, gathering repeated code into a separated file which is refered by the others  

## Data  
**mongoose** -> So we can connect and manipulate MongoDB with our JavaScript/Node.js   
**connect-mongo** -> Allow us to store session data on MongoDB instead of default memory storage   
**express-session** -> Session middleware for express, so we can have session data stored server-side (i.e. for user not have to login every time)  
**cloudinary** -> Cloudinary Node SDK which allow us to upload and manage cloud's assets (campground images)  
**multer** -> Node.js middleware to handle file (img) inputs (in forms which enctype = multipart/form-data)  
**multer-storage-cloudinary** -> multer storage engine for storing assets on Cloudinary  

## Authentication
*Never store the password itself, instead store a hashed version of it + a salt (random generated) value*  

**passport** -> Express-compatible authentication middleware for Node.js with 480+ different auth strategies  
**passport-local** -> Passport strategy for authenticating with username and password  
**passport-local-mongoose** -> Simplifies building username and password login with Passport (generate hash and salt automatically)  

## Security
**express-mongo-sanitize** -> Prevent '$' and '.' characters security issues (prevent operator injection)  
**sanitize-html** -> Clean up user-submitted HTML to prevent XSS attacks (Cross-site scripting)  
**helmet** -> Secure HTTP response headers (for express)  
**joi** -> Server-side data validation (Object schema validation)  

## Utilities
**nodemon** -> To listen for code changes and restart the server automatically 
**method-override** -> So we can use more http methods more than 'POST' via html forms for the same path (like PUT, DELETE, PATCH...)  
**connect-flash** -> Flash messages middleware for express   
**dotenv** -> Allow us to load environment variables from a .env files  
