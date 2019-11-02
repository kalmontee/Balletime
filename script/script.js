$(document).ready(function() {

    var userLat;
    var userLng;
    var destLat;
    var destLng;
    var userRadius;
    var meters = 804;
    var results;
    var i = 0;

    $("#sideContainer").hide();
    //dropdown for states
    var states = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida",
        "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
        "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana",
        "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina",
        "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
        "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
    ];

    var radius = [0.5, 1, 2, 5, 8, 10, 15, 20, 30, 50];

    // Set previous places to local storage
    // var previousPlaces = localStorage.getItem('items') ? JSON.parse(localStorage.getItem('items')) : [];

    // localStorage.setItem('items', JSON.stringify(previousPlaces));
    // var data = JSON.parse(localStorage.getItem('items'));

    //close modal on click
    $("#closeBtn, .button").on("click", function(event) {
        event.preventDefault();
        // call outside functions for actions on click
        $("#addressModal").hide();
    });

    // dropdown for states menu
    for (var i = 0; i < states.length; i++) {
        var dropDown = $("<option>");
        dropDown.addClass("stateOption");
        dropDown.attr("data-state", states[i]);
        dropDown.text(states[i]);
        $("#inputState").append(dropDown);
    }
    // dropdown for radius menu
    for (var j = 0; j < radius.length; j++) {
        var radDropdown = $("<option>");
        radDropdown.addClass("radius");
        radDropdown.attr("data-radius", radius[j]);
        radDropdown.text(radius[j]);
        $("#inputRadius").append(radDropdown);
    }
    // show side nav
    $("#prevSearches").on("click", function() {
        $("#sideContainer").show();

        // working on local storage
        // localStorage.setItem("name", restaurants);
        // localStorage.setItem("restaurants", JSON.stringify(i));

    });

    // hide side nav when clicked outside
    $(document).mouseup(function(i) {
        var sideList = $("#sideNav");
        if (!sideList.is(i.target) && sideList.has(i.target).length === 0) {
            $("#sideContainer").hide();
        }
    });


    $("#modalFindMeBtn").on("click", function(event) {
        event.preventDefault()
            // call outside functions for actions on click
        findLocation();
    });

    // When users click "search"
    $("#modalGoBtn").on('click', function() {
        // Prevent the page from resetting
        event.preventDefault();
        // My location variables:
        // Address, City, State, Zip,
        var userAddress = $('#inputAddress').val().trim().split(' ').join('+');
        var userCity = $('#inputCity').val().trim().split(' ').join('+');
        var userState = $('#inputState').val().trim();
        userRadius = $('#inputRadius').val().trim();

        meters = parseInt(userRadius * 1609.344);

        var APIKey = "&key=AIzaSyAE2CIuMnHiuUN7XLs9fRiATGN1gD-t0LY";
        // Here we are building the URL we need to query the database
        var queryURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + userAddress + "," + userCity + "," + userState + APIKey;
        // We then created an AJAX call
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function(response) {

            userLat = (response.results[0].geometry.location.lat);
            userLng = (response.results[0].geometry.location.lng);
            console.log(queryURL)
            var map, infoWindow;
            var pos = {
                lat: userLat,
                lng: userLng

            };
            getFoodSpots();

            infoWindow = new google.maps.InfoWindow;
            map = new google.maps.Map(document.getElementById('map'), {
                center: {
                    lat: userLat,
                    lng: userLng,
                },

                zoom: 15
            });

            infoWindow.setPosition(pos);
            infoWindow.setContent('You.');
            infoWindow.open(map);
            map.setCenter(pos);
            //remove
            console.log(queryURL)
        });

        zoom: 15
    });


    $("#closeBtn, .button").on("click", function(event) {
        event.preventDefault();
        $("#addressModal").hide();
    });

    // // MAP FUNCTIONS
    //Displays map on screen
    var map, infoWindow;
    infoWindow = new google.maps.InfoWindow;
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 38.7555258,
            lng: -80.04494120000001
        },
        zoom: 15
    });

    //Calls function to location you on the map
    function findLocation() {
        userRadius = $('#inputRadius').val().trim();
        meters = parseInt(userRadius * 1609.344);

        // Try HTML5 geolocation.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                var pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                infoWindow.setPosition(pos);
                infoWindow.setContent('You.');
                infoWindow.open(map);
                map.setCenter(pos);
                userLat = position.coords.latitude;
                userLng = position.coords.longitude;


                getFoodSpots();

            }, function() {
                handleLocationError(true, infoWindow, map.getCenter());
            });
        } else {
            // Browser doesn't support Geolocation
            handleLocationError(false, infoWindow, map.getCenter());
        }
    }
    //Googles error message handling if browser or computer doesn't support GPS
    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
            'Error: The Geolocation service failed.' :
            'Error: Your browser doesn\'t support geolocation.');
        infoWindow.open(map);
    }


    // This function is run when either locator button is pushed.  

    function getFoodSpots() {

        var zBaseURL = "https://developers.zomato.com/api/v2.1/search?"
        var APIKey = "&apikey=2acf625e70fd25f7205fda31a0f6cb15";
        var queryURL = "https://developers.zomato.com/api/v2.1/search?" + "lat=" + userLat + "&lon=" + userLng + "&" + "radius=" + meters + "&order=asc" + "&sort=rating" + APIKey;
        console.log(queryURL);

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function(response) {
            results = response.restaurants;

            // var restaurant = {
            //     name: results[i].restaurant.name,

            // }

        });

    }

    $("#searchAgain").on("click", function() {
        var randomNumber = [Math.floor(Math.random() * 20)];
        console.log(results[randomNumber]);
        i = randomNumber
        var placeHolder = $('<li>');
        var a = $('<a>');
        var p1 = $('<p>');
        var p = $('<p>');
        var p2 = $('<p>');
        var name = $('<h4>');
        placeHolder.addClass("placeCard");
        name.addClass("restName");
        name.attr('data-name', results[i].restaurant.name);
        name.text(results[i].restaurant.name);
        a.addClass("link");
        a.attr("href", results[i].restaurant.url);
        p1.addClass("cuisine");
        p1.text(results[i].restaurant.cuisines);
        p.addClass("info");
        p.attr("data-info", results[i].restaurant.highlights);
        p.text(results[i].restaurant.highlights);
        p2.addClass("rating");
        p2.attr("data-rating", results[i].restaurant.user_rating.aggregate_rating);
        p2.text("Rating: " + results[i].restaurant.user_rating.aggregate_rating);
        a.append(p, p2, name, p1);
        placeHolder.append(a);
        $("#sideNav").append(placeHolder);

        localStorage.setItem('Name', JSON.stringify(results[i].restaurant.name));
        localStorage.setItem('Rating', JSON.stringify(results[i].restaurant.user_rating.aggregate_rating));
        localStorage.setItem('Cuisine', JSON.stringify(results[i].restaurant.cuisines));

        destLat = (results[i].restaurant.location.latitude * 1);
        destLng = (results[i].restaurant.location.longitude * 1);
        destMap();

    });

    // localStorage.getItem(JSON.parse())
    localStorage.getItem(JSON.parse("name"));

    function destMap() {
        lats = destLat;
        lngs = destLng;

        console.log(results);
        console.log(i);


        // Map options
        var options = {
            zoom: 12,
            center: { lat: 41.955048, lng: -79.835499 }
        }

        // New map
        var map = new google.maps.Map(document.getElementById('map'), options);
        var rendererOptions = {
            suppressMarkers: true,
        };
        var directionsService = new google.maps.DirectionsService();
        var directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
        directionsDisplay.setMap(map);
        var request = { travelMode: google.maps.TravelMode.DRIVING, optimizeWaypoints: true, waypoints: [] };


        // Array of markers
        var markers = [{
                coords: { lat: userLat, lng: userLng },
                //   iconImage:'ME.png',
                content: 'You'
            },
            {
                coords: { lat: lats, lng: lngs },
                //   iconImage:'food.png',
                content: results[i].restaurant.name
            }
        ];

        // Loop through markers
        for (var l = 0; l < markers.length; l++) {
            // Add marker
            addMarker(markers[l]);
        }

        // Add Marker Function
        function addMarker(props) {
            var marker = new google.maps.Marker({
                position: props.coords,
                map: map,
                // icon:props.iconImage
            });

            // Check content
            if (props.content) {
                var infoWindow = new google.maps.InfoWindow({
                    content: props.content
                });

                marker.addListener('click', function() {
                    infoWindow.open(map, marker);

                });
            }
            if (l === 0) {
                request.origin = props.coords;
            } else if (l === markers.length - 1) {
                request.destination = props.coords;
            } else {
                if (props.coords) {
                    request.waypoints.push({
                        location: props.coords,
                        stopover: true
                    })
                }

            }
            infoWindow.open(map, marker);
            //End of Add Marker Function
        }
        directionsService.route(request, function(response, status) {
            if (status == "OK") {
                directionsDisplay.setDirections(response)
            }

        });
    }

    $(document).on("click", ".link", function() {
        event.preventDefault();
        window.open(this.href, "_blank");
    });

    // $("#sideNav").append(localStorage.getItem("name"));
    // var restaurants = JSON.parse(localStorage.getItem("restaurants"));
    // console.log(restaurants);

    // if (!Array.isArray(i)) {
    //     i = [];
    // }

});


// Once user clicks "Find A Place"
// set the results to local storage in Previous searches button (SideNav)