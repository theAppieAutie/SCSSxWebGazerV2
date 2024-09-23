// Load environment variables
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
  }

  const zlib = require('zlib');

//  middleware function for decompression
function gzipDecompression(req, res, next) {
    if (req.headers['content-encoding'] === 'gzip') {
        console.log("gzip encoding detected") // this gets logged but nothing more 
        const gunzip = zlib.createGunzip();
        req.pipe(gunzip);

        let body = [];
        gunzip.on('data', (chunk) => { //maybelook into this code a bit more
            console.log(`!!!!!!!!!!!!!!!!!!!!!!!!!! ${chunk}`)
            body.push(chunk);
        }).on('end', () => {
            console.log(`********************** finished gunzip now going to try concat to string`)
            try {
                req.body = Buffer.concat(body).toString(); // add a console.log here to see if the try is successful don't think it is
                console.log(`!!!!!!!!!!!!!!!!!!!!!!!!!! ${req.body}`)
                next();
            } catch (e) {
                console.log(`error has occurred here ${e}`)
                next(e)
            }
        }).on('error', (err) => {
            console.log(`Decompression Error: ${err}`)
            next(err);
        });
    } else {
        next();
    }
}
  
// Import modules and configurations
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const participantDetailsRoutes = require("./routes/participantDetailsRoutes.js");
const informationRoutes = require("./routes/informationRoutes.js");
const scalesRoutes = require("./routes/scalesRoutes.js");
const trialRoutes = require("./routes/trialRoutes.js");
const dbServices = require("./services/dbServices.js");


  
const app = express();
  
// Configure views
app.set("views", path.join(__dirname, "./views"));
app.set("view engine", "ejs");

// Static files
app.use("/public", express.static(path.join(__dirname, "/public")));
app.use(express.static(path.join(__dirname, "/public")));

// middleware
app.use(gzipDecompression);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(flash());
app.use(methodOverride('_method'));

// services middleware
app.use((req, res, next) => {
    req.dbServices = dbServices;
    next();
});





// Session Configuration
app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false
    })
);

// routes
app.use('/participant', participantDetailsRoutes);
app.use('/information', informationRoutes);
app.use('/scales', scalesRoutes);
app.use('/trial', trialRoutes);





app.get('/', (req, res) => {
    res.render('information')
})

const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode at ${PORT}`);
});

module.exports = app;