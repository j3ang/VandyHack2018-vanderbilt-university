'use strict';

//
// profile charts
//

$(document).ready(function () {
    let handle = getHandle();

    const $celeberity_chart = $('#chart-celeb');
    const $followers_chart = $('#chart-followers');

    const api = 'http://54.149.198.224:3000/api/';

    // let $ordersSelect = $('[name="ordersSelect"]');
    const getCelebrityGossipRelevanceUrl = api + "getCelebrityGossipRelevance/";
    const getCelebrityAudienceRelevanceUrl = api + "getCelebrityAudienceRelevance/";
    const getCelebritySentimentUrl = api + "getCelebritySentiment/";
    const getCelebFollowersLocationUrl = api + "getCelebGossipLocation/";


    //
    // Ajax Calls
    //
    // get Celebrity Gossip Relevance 
    $.ajax({
        url: "https://cors-anywhere.herokuapp.com/" + getCelebrityGossipRelevanceUrl + handle,
        success: function (result) {

            let res = JSON.parse(result).data;

            let keys = Object.keys(res);
            let values = Object.values(res);

            initCelebrityGossipRelevanceChart($celeberity_chart, keys, values);

        }
    });

    // get Celebrity Audience Relevance
    $.ajax({
        url: "https://cors-anywhere.herokuapp.com/" + getCelebrityAudienceRelevanceUrl + handle,
        success: function (result) {

            let res = JSON.parse(result).data;

            let keys = Object.keys(res);
            let values = Object.values(res);

            if ($followers_chart.length) {
                initFollowerRelevanceChart($followers_chart, keys, values);
            }
        }
    });

    // get Celebrity Sentiment 
    $.ajax({
        url: "https://cors-anywhere.herokuapp.com/" + getCelebritySentimentUrl + handle,
        success: function (result) {

            let res = JSON.parse(result).data;

            let keys = Object.keys(res);
            let values = Object.values(res);

            createChart('chart-celebSentiment', 'doughnut', keys, values, {
                responsive: true,
                cutoutPercentage: 50,
                maintainAspectRatio: false,
                plugins: {
                    labels: [{
                        render: 'label',
                        position: 'outside',
                        // fontColor: function (data) {
                        //     var rgb = hexToRgb(data.dataset.backgroundColor[data.index]);
                        //     var threshold = 140;
                        //     var luminance = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
                        //     return luminance > threshold ? 'black' : 'white';
                        // },
                        precision: 2
                    }, {
                        render: 'percentage',
                        fontColor: function (data) {
                            var rgb = hexToRgb(data.dataset.backgroundColor[data.index]);
                            var threshold = 140;
                            var luminance = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
                            return luminance > threshold ? 'black' : 'white';
                        },
                        precision: 2
                    }]
                }
            });

        }
    });

    // get Celebrity follower location
    $.ajax({
        url: "https://cors-anywhere.herokuapp.com/" + getCelebFollowersLocationUrl + handle,
        success: function (result) {
            let res = JSON.parse(result).data;
            findStations(res);
        }
    });

    var host = "cit.datalens.api.here.com";
    var queries = {
        "query": {
            "fileName": "query.json",
            "dataset": "57b42548635b42cab517d62db91ee954",
            "id": "567f23e2902542619d849ecf0544f117"
        }
    };
    const {
        query
    } = queries;

    function findStations(locations) {
        var coortable = [];
        console.log("printing locations");

        for (let j = 0; j < locations.length; j++) {
            let coords = JSON.parse(locations[j].Location.replace(/'/g, "\""));
            coortable.push(coords.coordinates);
        }


        var nashville = new mapsjs.map.Marker({
            lat: 36.16,
            lng: -86.78
        }, {
            icon: icon
        });
        let nashgroup = new mapsjs.map.Group();
        nashgroup.addObject(nashville)
        map.setViewBounds(nashgroup.getBounds());
        map.setZoom(1)
        map.addObject(nashville);
        for (let i = 0; i < coortable.length; i++) {
            map.addObject(new mapsjs.map.Marker({
                lat: coortable[i][1],
                lng: coortable[i][0]
            }, {
                icon: icon2
            }));

        }

    }

    var platform = new H.service.Platform({
        app_id: 'ZjNYVApAFoUvPWClnv9W',
        app_code: 'lh3atS4f8NpsDcPCzubGYA',
        useHTTPS: true
    });
    const pixelRatio = devicePixelRatio > 1 ? 2 : 1;
    const defaultLayers = platform.createDefaultLayers({
        tileSize: 256 * pixelRatio
    });

    var map = new H.Map(document.getElementsByClassName('dl-map')[0],
        defaultLayers.normal.basenight, {
            pixelRatio
        });

    var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

    var ui = H.ui.UI.createDefault(map, defaultLayers);
    ui.removeControl('mapsettings');

    var svg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="28px" height="36px">' +
        '<path d="M 19 31 C 19 32.7 16.3 34 13 34 C 9.7 34 7 32.7 7 31 C 7 29.3 9.7 28 13 28 C 16.3 28 19' +
        ' 29.3 19 31 Z" fill="#000" fill-opacity=".2"/>' +
        '<path d="M 13 0 C 9.5 0 6.3 1.3 3.8 3.8 C 1.4 7.8 0 9.4 0 12.8 C 0 16.3 1.4 19.5 3.8 21.9 L 13 31 L 22.2' +
        ' 21.9 C 24.6 19.5 25.9 16.3 25.9 12.8 C 25.9 9.4 24.6 6.1 22.1 3.8 C 19.7 1.3 16.5 0 13 0 Z" fill="#fff"/>' +
        '<path d="M 13 2.2 C 6 2.2 2.3 7.2 2.1 12.8 C 2.1 16.1 3.1 18.4 5.2 20.5 L 13 28.2 L 20.8 20.5 C' +
        ' 22.9 18.4 23.8 16.2 23.8 12.8 C 23.6 7.07 20 2.2 13 2.2 Z" fill="#090"/>' +
        '</svg>';

    var svg2 =
        '<svg xmlns="http://www.w3.org/2000/svg" width="28px" height="36px">' +
        '<path d="M 19 31 C 19 32.7 16.3 34 13 34 C 9.7 34 7 32.7 7 31 C 7 29.3 9.7 28 13 28 C 16.3 28 19' +
        ' 29.3 19 31 Z" fill="#000" fill-opacity=".2"/>' +
        '<path d="M 13 0 C 9.5 0 6.3 1.3 3.8 3.8 C 1.4 7.8 0 9.4 0 12.8 C 0 16.3 1.4 19.5 3.8 21.9 L 13 31 L 22.2' +
        ' 21.9 C 24.6 19.5 25.9 16.3 25.9 12.8 C 25.9 9.4 24.6 6.1 22.1 3.8 C 19.7 1.3 16.5 0 13 0 Z" fill="#fff"/>' +
        '<path d="M 13 2.2 C 6 2.2 2.3 7.2 2.1 12.8 C 2.1 16.1 3.1 18.4 5.2 20.5 L 13 28.2 L 20.8 20.5 C' +
        ' 22.9 18.4 23.8 16.2 23.8 12.8 C 23.6 7.07 20 2.2 13 2.2 Z" fill="#2D5EE6"/>' +
        '</svg>';

    var options = {
        'size': new mapsjs.math.Size(18, 24),
        'anchor': new mapsjs.math.Point(14, 32),
        'hitArea': new mapsjs.map.HitArea(
            mapsjs.map.HitArea.ShapeType.POLYGON, [0, 16, 0, 7, 8, 0, 18, 0, 26, 7, 26, 16, 18, 34, 8, 34])
    };
    var icon = new mapsjs.map.Icon(svg, options);
    var icon2 = new mapsjs.map.Icon(svg2, options);



    //
    // Functions
    //
    // Init Celebrity Gossip Relevance Chart
    function initCelebrityGossipRelevanceChart($celeberity_chart, x, y) {

        // Create chart
        let celeberity_chart = new Chart($celeberity_chart, {
            type: 'bar',
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            callback: function (value) {
                                if (!(value % 10)) {
                                    //return '$' + value + 'k'
                                    return value
                                }
                            }
                        }
                    }]
                },
                tooltips: {
                    callbacks: {
                        label: function (item, data) {
                            let label = data.datasets[item.datasetIndex].label || '';
                            let yLabel = item.yLabel;
                            let content = '';

                            if (data.datasets.length > 1) {
                                content += '<span class="popover-body-label mr-auto">' + label + '</span>';
                            }

                            content += '<span class="popover-body-value">' + yLabel + '</span>';

                            return content;
                        }
                    }
                }
            },
            data: {
                labels: x,
                datasets: [{
                    label: 'Celebrity Tweet Relevance',
                    data: y
                }]
            }
        });

        // Save to jQuery object
        $celeberity_chart.data('Celebrity Chart', celeberity_chart);

    }
    // Init Follower Gossip Relevance Chart
    function initFollowerRelevanceChart($follower_chart, x, y) {
        let follower_chart = new Chart($follower_chart, {
            type: 'bar',
            options: {
                scales: {
                    yAxes: [{
                        gridLines: {
                            color: Charts.colors.gray[900],
                            zeroLineColor: Charts.colors.gray[900]
                        }
                    }]
                },
                tooltips: {
                    callbacks: {
                        label: function (item, data) {
                            let label = data.datasets[item.datasetIndex].label || '';
                            let yLabel = item.yLabel;
                            let content = '';

                            if (data.datasets.length > 1) {
                                content += '<span class="popover-body-label mr-auto">' + label + '</span>';
                            }

                            content += '<span class="popover-body-value">' + yLabel + '</span>';

                            return content;
                        }
                    }
                }
            },
            data: {
                labels: x,
                datasets: [{
                    label: 'Follower Tweet Relevance',
                    data: y,
                    backgroundColor: "#4286f4"
                }]
            }
        });

        // Save to jQuery object
        $follower_chart.data('follower_chart', follower_chart);

    };


    // Create dougnout chart
    function createChart(id, type, labels, data, options) {
        var data = {
            labels: labels,
            datasets: [{
                label: 'My First dataset',
                data: data,
                backgroundColor: [
                    '#2dce89',
                    '#fb6340',
                    '#adb5bd'
                ]
            }]
        };

        new Chart(document.getElementById(id), {
            type: type,
            data: data,
            options: options
        });
    }
    // dynamic dounaut chart font color
    function hexToRgb(hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function (m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    // Get handle 
    function getHandle() {
        let handle = window.location.href.split('/').slice(-1).pop();
        return handle;
    }

});
