const express = require('express');
const router = express.Router();
const request = require('request');
const app = express();


const locals = app.locals;

request('http://54.149.198.224:3000/api/getCelebs', function (error, response, body) {
    if (!error && response.statusCode == 200) {
        locals.celebs = JSON.parse(body).data;
        //   console.log(locals.celebs.data);
    }
})




// Home page route.
router.get('/', function (req, res) {
    //  res.send('send works');
    res.render('profile', {
        celebs: locals.celebs,
        title: 'profile'
    });
})

router.get('/:handle', function (req, res) {

    console.log(req.params.handle);
    let handle = req.params.handle;
    let celeb;

    // get specific celeb
    for (var x = 0; x < locals.celebs.length; x++) {
        if (locals.celebs[x].Handle == handle) {
            celeb = locals.celebs[x];
            request('http://54.149.198.224:3000/api/getCelebrityGossipRelevance/' + handle, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    locals.celebGossipRelevance = JSON.parse(body).data;
                    console.log(locals.celebGossipRelevance);
                }
            })
            break;
        }
    }

    res.render('profile.pug', {
        title: '@' + handle,
        handle: handle,
        celebs: locals.celebs,
        celeb: celeb,
        celebGossipRelevance: locals.celebGossipRelevance
    });
})



module.exports = router;
