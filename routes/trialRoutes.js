// imports
const {startTrial, stopTrial, addGazeData} = require('../controllers/trialController');

const express = require('express');
const zlib = require('zlib');

const router = express.Router();

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
              const decompressedPayload = Buffer.concat(body); // add a console.log here to see if the try is successful don't think it is
              console.log(`payload length ${decompressedPayload.length}`)
              req.body = JSON.parse(decompressedPayload.toString());
              console.log(`!!!!!!!!!!!!!!!!!!!!!!!!!! ${req.body}`)
              delete req.headers['content-encoding'];
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


// GET /game: Render the game page based on user group
router.get('/trial', async (req, res) => startTrial(req, res));

  
  //  handle adding data to Experiment
router.post("/addTrial", async (req, res) => stopTrial(req, res));

router.post("/addGazeData",  gzipDecompression, async (req,res) => addGazeData(req, res));

module.exports = router;


  