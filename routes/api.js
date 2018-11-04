var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var request = require('request');
var Promise = require('promise');

var con = mysql.createConnection({
    host: "54.149.198.224",
    user: "root",
    password: "Vandyhack",
    database: "tip"
});

/*501 database connection error, 502 query error */

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('This is the api route');

    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
    });

});

router.get('/getCelebs', function(req, res, next) {

    var sql ="select * from Celebs;";
    con.query(sql, function (err, result) {
        if (err){
            var data = {};
            data['Status'] = 502;
            console.log(err);
            res.send(JSON.stringify(data));
        }
        else
        {

            var data = {};
            data['Status'] = 200;
            var celebs = [];
            for(var i=0;i<10;i++){
                celeb = {};
                celeb['Name'] = result[i].Name;
                celeb['Handle'] = result[i].Handle;
                celeb['Image'] = result[i].Image;
                celeb['Followers'] = result[i].Followers;
                celeb['Grade'] = result[i].Grade;
                celeb['NewUsers'] = result[i].NewUsers;
                celeb['Category'] = result[i].Category;
                celeb['Sentiment'] = result[i].Sentiment;
                celeb['Following'] = result[i].Following;
                celeb['Tweets'] = result[i].Tweets;
                celebs.push(celeb);
            }

            data['data'] = celebs;
            res.send(JSON.stringify(data));
        }
    });



});

router.get('/getCelebs2', function(req, res, next) {

    var sql ="select * from Celebs;";
    con.query(sql, function (err, result) {
        if (err){
            var data = {};
            data['Status'] = 502;
            console.log(err);
            res.send(JSON.stringify(data));
        }
        else
        {

            var data = {};
            data['Status'] = 200;
            var celebs = {};
            for(var i=0;i<10;i++){
                celeb = {};
                celeb['Name'] = result[i].Name;
                celeb['Handle'] = result[i].Handle;
                celeb['Image'] = result[i].Image;
                celeb['Followers'] = result[i].Followers;
                celeb['Grade'] = result[i].Grade;
                celeb['NewUsers'] = result[i].NewUsers;
                celeb['Category'] = result[i].Category;
                celeb['Sentiment'] = result[i].Sentiment;
                celeb['Following'] = result[i].Following;
                celeb['Tweets'] = result[i].Tweets;
                celebs[result[i].Handle] = celeb;
            }

            data['data'] = celebs;
            res.send(JSON.stringify(data));
        }
    });



});

router.get('/getCelebGossipLocation/:handle', function(req, res, next) {

    var handle = req.params.handle;
    console.log(handle);

    if(handle == "" || handle == null){
        var result = {};
        result['Status'] = 600;
        res.send(JSON.stringify(result));
    }
    else
    {
        var sql ="select * from GossipTweets where Category='"+handle+"' and Location is NOT NULL;";

        con.query(sql, function (err, result) {
            if (err){
                var data = {};
                data['Status'] = 502;
                console.log(err);
                res.send(JSON.stringify(data));
            }
            else
            {
                try
                {
                    var data = {};
                    data['Status'] = 200;
                    var users = [];
                    for(var i=0;i<result.length;i++){
                        user = {};
                        user['Handle'] = result[i].Screen_name;
                        user['Location'] = result[i].Location;
                        users.push(user);
                    }

                    if(users.length == 0){
                        var sql2 ="select * from GossipTweets where Location is NOT NULL order by RAND() LIMIT 50;";
                        con.query(sql2, function (err, result) {
                            if (err) {
                                var data = {};
                                data['Status'] = 502;
                                console.log(err);
                                res.send(JSON.stringify(data));
                            }
                            else {
                                try {
                                    var data = {};
                                    data['Status'] = 200;
                                    var users = [];
                                    for (var i = 0; i < result.length; i++) {
                                        user = {};
                                        user['Handle'] = result[i].Screen_name;
                                        user['Location'] = result[i].Location;
                                        users.push(user);
                                    }
                                    data['data'] = users;
                                    res.send(JSON.stringify(data));
                                }
                                catch (e) {
                                    var data = {};
                                    console.log(e);
                                    data['Status'] = 503;
                                    res.send(JSON.stringify(data));
                                }
                            }
                        });
                    }
                    else{
                        data['data'] = users;
                        res.send(JSON.stringify(data));
                    }


                }
                catch (e) {
                    var data = {};
                    console.log(e);
                    data['Status'] = 503;
                    res.send(JSON.stringify(data));
                }


            }
        });

    }
});

router.get('/getCategoryLocation/:handle', function(req, res, next) {

    var handle = req.params.handle;
    console.log(handle);

    if(handle == "" || handle == null){
        var result = {};
        result['Status'] = 600;
        res.send(JSON.stringify(result));
    }
    else
    {
        var sql ="select * from CategoryTweets where Category='"+handle+"' and Location is NOT NULL;";

        con.query(sql, function (err, result) {
            if (err){
                var data = {};
                data['Status'] = 502;
                console.log(err);
                res.send(JSON.stringify(data));
            }
            else
            {
                try
                {
                    var data = {};
                    data['Status'] = 200;
                    var users = [];
                    for(var i=0;i<result.length;i++){
                        user = {};
                        user['Handle'] = result[i].Screen_name;
                        user['Location'] = result[i].Location;
                        users.push(user);
                    }
                    data['data'] = users;
                    res.send(JSON.stringify(data));
                }
                catch (e) {
                    var data = {};
                    console.log(e);
                    data['Status'] = 503;
                    res.send(JSON.stringify(data));
                }


            }
        });

    }
});


router.get('/getCelebritySentiment/:handle', function(req, res, next) {

    var handle = req.params.handle;
    console.log(handle);

    if(handle == "" || handle == null){
        var result = {};
        result['Status'] = 600;
        res.send(JSON.stringify(result));
    }
    else
    {
        var sql ="select Polarity, count(*) as Count from GossipTweets where Category='"+handle+"' group by Polarity ";

        con.query(sql, function (err, result) {
            if (err){
                var data = {};
                data['Status'] = 502;
                console.log(err);
                res.send(JSON.stringify(data));
            }
            else
            {
                try
                {
                    var data = {};
                    data['Status'] = 200;
                    var polarity = {};
                    var p = 0;
                    var n = 0;
                    var ne = 0;
                    for(var i=0;i<result.length;i++){
                        var a = result[i].Polarity;

                        console.log("hey "+a);
                        if(a == 1){
                            p = result[i].Count;
                        }
                        else if (a==-1){
                            n = result[i].Count;
                        }
                        else if (a ==0){
                            ne = result[i].Count;
                        }

                    }
                    console.log(" "+ p +" "+n+" "+ne);
                    var t = p + n + ne;
                    polarity['Positive'] = Math.round( (p/t) * 100);
                    polarity['Negative'] = Math.round((n/t) * 100);
                    polarity['Neutral'] = Math.round((ne/t) * 100);

                    data['data'] = polarity;
                    res.send(JSON.stringify(data));


                }
                catch (e) {
                    var data = {};
                    console.log(e);
                    data['Status'] = 503;
                    res.send(JSON.stringify(data));
                }


            }
        });

    }
});


router.get('/getCelebrityGossipRelevance/:handle', function(req, res, next) {

    var handle = req.params.handle;
    console.log(handle);

    if(handle == "" || handle == null){
        var result = {};
        result['Status'] = 600;
        res.send(JSON.stringify(result));
    }
    else
    {
        var sql ="select PredCategory as Cat, count(*) as Count from GossipTweets where Category='"+handle+"' group by PredCategory ";

        con.query(sql, function (err, result) {
            if (err){
                var data = {};
                data['Status'] = 502;
                console.log(err);
                res.send(JSON.stringify(data));
            }
            else
            {
                try
                {
                    var data = {};
                    data['Status'] = 200;
                    var polarity = {};
                    var f =0, e= 0, s =0, t= 0,p=0,ne=0;
                    for(var i=0;i<result.length;i++){
                        var a = result[i].Cat;

                        if(a == 'Food'){
                            f = result[i].Count;
                        }
                        else if (a=='Entertainment'){
                            e = result[i].Count;
                        }
                        else if (a =='Politics'){
                            p = result[i].Count;
                        }
                        else if (a =='Technology'){
                            t = result[i].Count;
                        }
                        else if (a =='Sports'){
                            s = result[i].Count;
                        }
                        else if (a =='NoClass'){
                            ne = result[i].Count;
                        }

                    }
                    var total = f+e+p+t+s+ne;
                    polarity['Food'] = Math.round( (f/total) * 100);
                    polarity['Entertainment'] = Math.round((e/total) * 100);
                    polarity['Technology'] = Math.round((t/total) * 100);
                    polarity['Sports'] = Math.round((s/total) * 100);
                    polarity['Politics'] = Math.round((p/total) * 100);
                    polarity['NoClass'] = Math.round((ne/total) * 100);

                    data['data'] = polarity;
                    res.send(JSON.stringify(data));


                }
                catch (e) {
                    var data = {};
                    console.log(e);
                    data['Status'] = 503;
                    res.send(JSON.stringify(data));
                }


            }
        });

    }
});

router.get('/getCelebrityAudienceRelevance/:handle', function(req, res, next) {

    var handle = req.params.handle;
    console.log(handle);

    if(handle == "" || handle == null){
        var result = {};
        result['Status'] = 600;
        res.send(JSON.stringify(result));
    }
    else
    {
        var sql ="select PredCategory as Cat, count(*) as Count from FollowersTweets where Category='"+handle+"' group by PredCategory ";

        con.query(sql, function (err, result) {
            if (err){
                var data = {};
                data['Status'] = 502;
                console.log(err);
                res.send(JSON.stringify(data));
            }
            else
            {
                try
                {
                    var data = {};
                    data['Status'] = 200;
                    var polarity = {};
                    var f =0, e= 0, s =0, t= 0,p=0,ne=0;
                    for(var i=0;i<result.length;i++){
                        var a = result[i].Cat;

                        if(a == 'Food'){
                            f = result[i].Count;
                        }
                        else if (a=='Entertainment'){
                            e = result[i].Count;
                        }
                        else if (a =='Politics'){
                            p = result[i].Count;
                        }
                        else if (a =='Technology'){
                            t = result[i].Count;
                        }
                        else if (a =='Sports'){
                            s = result[i].Count;
                        }
                        else if (a =='NoClass'){
                            ne = result[i].Count;
                        }

                    }
                    var total = f+e+p+t+s+ne;
                    polarity['Food'] = Math.round( (f/total) * 100);
                    polarity['Entertainment'] = Math.round((e/total) * 100);
                    polarity['Technology'] = Math.round((t/total) * 100);
                    polarity['Sports'] = Math.round((s/total) * 100);
                    polarity['Politics'] = Math.round((p/total) * 100);
                    polarity['NoClass'] = Math.round((ne/total) * 100);

                    data['data'] = polarity;
                    res.send(JSON.stringify(data));


                }
                catch (e) {
                    var data = {};
                    console.log(e);
                    data['Status'] = 503;
                    res.send(JSON.stringify(data));
                }


            }
        });

    }
});

router.get('/analyze/:handle/:sentiment', function(req, res, next) {
    //
    // var handle = req.params.handle;
    // var cat = req.body.cat;
    // var sentiment = req.body.sentiment;
    // var comapny_name = req.body.cname;

    var cat =req.params.handle;
    var senti =req.params.sentiment;
    var promises = [];
    request('http://localhost:3000/api/getCelebs/', function (error, response, body) {
        var celebs = JSON.parse(body).data;
        for(var i in celebs){
            var handle = celebs[i].Handle;

            promises.push( getAnalysisData(handle));
        }
        var a = function(ress){
            Promise.all(promises).then(function(results){
                var final = {};
                for(res in results){
                    celeb = results[res];
                    var handle = celeb.handle;
                    var score = 0;
                    if(senti = 'vp'){
                        score = (((celeb.gossip_data[cat] + celeb.audience_data[cat])/2) * 0.55) + (celeb.sentiment_data['Positive'] - celeb.sentiment_data['Negative']) * 0.45;

                    }
                    else if(senti = 'p'){
                        score = (((celeb.gossip_data[cat] + celeb.audience_data[cat])/2) * 0.62) + (celeb.sentiment_data['Positive'] - celeb.sentiment_data['Negative']) * 0.38;

                    }
                    else{
                        score = (((celeb.gossip_data[cat] + celeb.audience_data[cat])/2) * 0.70) + (celeb.sentiment_data['Positive'] - celeb.sentiment_data['Negative']) * 0.30;

                    }

                    final[handle] = score;

                }
                var data = {};
                data['Status'] = 200;

                console.log(JSON.stringify(data));

                var array = [];
                for (var key in final) {
                    array.push({
                        name: key,
                        value: final[key]
                    });
                }

                var sorted = array.sort(function(a, b) {
                    return (a.value > b.value) ? -1 : ((b.value > a.value) ? 1 : 0)
                });


                data['data'] = sorted;

                ress.send(JSON.stringify(data));


            }, function(error){
                console.log("error occured");
            });
        }


        a(res);


    });
});

function getAnalysisData(handle){
    var a_data = {};
    return new Promise(function(resolve,reject){

        request('http://localhost:3000/api/getCelebrityAudienceRelevance/'+handle, function (error, response, body) {
            var audience_data = JSON.parse(body).data;
            a_data['audience_data'] = audience_data;
            request('http://localhost:3000/api/getCelebrityGossipRelevance/'+handle, function (error, response, body) {
                var gossip_data = JSON.parse(body).data;
                a_data['gossip_data'] = gossip_data;
                request('http://localhost:3000/api/getCelebritySentiment/'+handle, function (error, response, body) {
                    var sentiment_data = JSON.parse(body).data;
                    a_data['sentiment_data'] = sentiment_data;

                    a_data['handle'] = handle;
                    resolve(a_data);
                });

            });

        });
    });

}

module.exports = router;