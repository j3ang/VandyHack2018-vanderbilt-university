const express = require('express');
const router = express.Router();
const request = require('request');
const app = express();


const locals = app.locals;

request('http://54.149.198.224:3000/api/getCelebs', function (error, response, body) {
    if (!error && response.statusCode == 200) {
        locals.celebs = JSON.parse(body).data;
        console.log(locals.celebs);
    }
});



// Home page route.
router.get('/', function (req, res) {
    res.render('home.ejs', {
        user: locals.celebs,
        title: 'home'
    });
});






module.exports = router;
