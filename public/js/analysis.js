$(document).ready(function () {
    let handle = getHandle();

    function htmlDecode(input) {
        var e = document.createElement('div');
        e.innerHTML = input;
        return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
    }

    var $chart = $('#chart23');
    //  var myVar = JSON.parse(htmlDecode("<%= JSON.stringify(data) %>"));

    //  var locations = JSON.parse(htmlDecode("<%= JSON.stringify(locations) %>"));

    var getCelebFollowersLocationUrl = 'http://54.149.198.224:3000/api/getCelebGossipLocation';
    // Ajax call to get celebs locations
    $.ajax({
        url: "https://cors-anywhere.herokuapp.com/" + getCelebFollowersLocationUrl + handle,
        success: function (result) {

            let res = JSON.parse(result).data;

        }
    });

    console.log(myVar);

    function initChart23($chart) {

        var keys = Object.keys(myVar);
        var values = Object.values(myVar);

        // Create chart
        var ordersChart = new Chart($chart, {
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
                            var label = data.datasets[item.datasetIndex].label || '';
                            var yLabel = item.yLabel;
                            var content = '';

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
                labels: keys,
                datasets: [{
                    label: 'Sales',
                    data: values
                }]
            }
        });

        // Save to jQuery object
        $chart.data('chart', ordersChart);
    }
    initChart23($chart);


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

    function findStations() {
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
        nashgroup = new mapsjs.map.Group();
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
    icon = new mapsjs.map.Icon(svg, options);
    icon2 = new mapsjs.map.Icon(svg2, options);

    findStations();



});
