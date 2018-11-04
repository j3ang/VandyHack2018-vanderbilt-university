var express = require('express');
var router = express.Router();
var request = require('request');
var Promise = require('promise');
const app = express();
const locals = app.locals;

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('indexejs.ejs', { title: 'Express' });
});/* GET home page. */

request('http://54.149.198.224:3000/api/getCelebs', function (error, response, body) {
    if (!error && response.statusCode == 200) {
        locals.celebs = JSON.parse(body).data;
        console.log(locals.celebs);
    }
});

router.post('/form', function(req, res, next) {

    console.log(req.body);
    var cname = req.body.cname;
    var pname = req.body.pname;

    var cbFood = req.body.cbFood;
    var cbEnt = req.body.cbEnt;
    var cbTech = req.body.cbTech;
    var cbPolitics = req.body.cbPolitics;
    var cbSports = req.body.cbSports;
    var p = req.body.rbs;
    var promises = [];
    var l_promises = [];
    var categories = "";
    var sentiment = "";
    if(p == 'vp'){
        sentiment = "Very Positive";
    }
    else if(p =='p'){

        sentiment = "Positive";
    }
    else{
        sentiment = "Average";
    }


    if(cbFood == 'on'){

        promises.push(getAnalysisData("Food",p));
        l_promises.push(getLocationData("Food"));
        categories += "Food, ";
    }
    if(cbEnt == 'on'){
        promises.push(getAnalysisData("Entertainment",p));
        l_promises.push(getLocationData("Entertainment"));
        categories += "Entertainment, ";
    }

    if(cbTech == 'on'){
        promises.push(getAnalysisData("Technology",p));
        l_promises.push(getLocationData("Technology"));
        categories += "Technology, ";
    }

    if(cbPolitics == 'on'){

        promises.push(getAnalysisData("Politics",p));
        l_promises.push(getLocationData("Politics"));
        categories += "Politics, ";
    }

    if(cbSports == 'on'){
        promises.push(getAnalysisData("Sports",p));
        l_promises.push(getLocationData("Sports"));
        categories += "Sports, ";
    }

    categories = categories.substring(0,categories.length-2);

    var analysis = {};
    var a = function(ress) {
        Promise.all(promises).then(function (results) {
            var status = 0;
            for (res in results) {
                var tab = results[res];

                if (status == 0) {
                    for (i in tab) {
                        var row = tab[i];
                        analysis[row.name] = 0;
                    }
                    status = 1;

                }


                for (j in tab) {
                    var row = tab[j];
                    analysis[row.name] += row.value;
                    console.log(row.name + " value is " + row.value);
                }
            }

            var array = [];
            for (var key in analysis) {
                array.push({
                    name: key,
                    value: analysis[key]
                });
            }

            var sorted = array.sort(function(a, b) {
                return (a.value > b.value) ? -1 : ((b.value > a.value) ? 1 : 0)
            });


            var final = {};
            for(var i= 0;i<sorted.length;i++){
                var row= sorted[i];
                final[row.name] = row.value;
            }



            request('http://localhost:3000/api/getCelebs2/', function (error, response, body) {

                var users = JSON.parse(body).data;
                var b = function(resss) {
                    Promise.all(l_promises).then(function (results) {
                        resss.render('analysis.ejs', { data: final,cname:cname,pname:pname, categories:categories, sentiment:sentiment,users: users, user: locals.celebs, locations:results[0]});

                    });
                };

                b(ress);

            });



        }, function (error) {

            ress.render('error.pug', { title: 'Express' });
            console.log(error);
        });
    };

    a(res);
});

function getAnalysisData(cat, senti){
    return new Promise(function(resolve,reject){

        request('http://localhost:3000/api/analyze/'+cat+"/"+senti, function (error, response, body) {

            resolve(JSON.parse(body).data);
        });
    });

}

function getLocationData(cat){
    return new Promise(function(resolve,reject){

        request('http://localhost:3000/api/getCategoryLocation/'+cat, function (error, response, body) {

            resolve(JSON.parse(body).data);
        });
    });

}

module.exports = router;
