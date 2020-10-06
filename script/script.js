$(document).ready(function () {
  // Set Global Variables
  var userLat
  var userLng;
  var destLat
  var destLng;
  var map, infoWindow;
  var userRadius;
  var meters = 805;
  var results;
  var i;

  // Sets the side bar to hidden on page view
  $("#sideContainer").hide();

  // Sets dropdown for states
  var states = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", 
  "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", 
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", 
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", 
  "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", 
  "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", 
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", 
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", 
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", 
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

  // Populate State dropdown
  for (var i = 0; i < states.length; i++) {
    var dropDown = $("<option>");
    dropDown.addClass("stateOption");
    dropDown.attr("data-state", states[i]);
    dropDown.text(states[i]);
    $("#inputState").append(dropDown);
  }

  // Sets Radius dropdown
  var radius = [0.5, 1, 2, 5, 8, 10, 15, 20, 30, 50];

  // Populates dropdown for radius menu
  for (var j = 0; j < radius.length; j++) {
    var radDropdown = $("<option>");
    radDropdown.addClass("radius");
    radDropdown.attr("data-radius", radius[j]);
    radDropdown.text(radius[j]);
    $("#inputRadius").append(radDropdown);
  }

  // Closes user input modal on an button click
  $("#closeBtn, .button").on("click", function (event) {
    event.preventDefault();

    // call outside functions for actions on click
    $("#addressModal").hide();
  });

  // Display the side nav
  $("#prevSearches").on("click", function () {
    $("#sideContainer").show();
  });

  // hide side nav when clicked outside
  $(document).mouseup(function (i) {
    var sideList = $("#sideNav");
    if (!sideList.is(i.target) && sideList.has(i.target).length === 0) {
      $("#sideContainer").hide();
    }
  });

  // Clicking the Find a Place Button calls the map location function
  $("#modalFindMeBtn").on("click", function (event) {
    event.preventDefault();

    // The findLocation() function will receive each location of restaurants
    findLocation();
  });

  // When users searches for a specified address - runs Geocode API to get Lat and Lng
  $("#modalGoBtn").on("click", function () {
    var userAddress = $("#inputAddress").val().trim().split(" ").join("+");
    var userCity = $("#inputCity").val().trim().split(" ").join("+");
    var userState = $("#inputState").val().trim();

    // Ajax call info and call
    var APIKey = "&key=AIzaSyDWUZn7KlbUcbraIe6njU0DFVz-YYN2D_w";
    var queryURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${userAddress},${userCity},${userState}${APIKey}`;

    $.ajax({
      url: queryURL,
      method: "GET",
    }).then(function (response) {
      console.log(response);
      // Gets users Lat and Lng from Address
      userLat = response.results[0].geometry.location.lat;
      userLng = response.results[0].geometry.location.lng;
      // var map, infoWindow;
      var pos = {
        lat: userLat,
        lng: userLng,
      };

      // runs the AJAX to get a JSON for the different food spots bassed on the location
      getFoodSpots();

      // sets map view based on location from address
      infoWindow = new google.maps.InfoWindow();
      map = new google.maps.Map(document.getElementById("map"), {
        center: {
          lat: userLat,
          lng: userLng,
        },

        zoom: 15,
      });
      // Sets the position and shows the info window on map with 'You' as the message. Centers the map on that location
      infoWindow.setPosition(pos);
      infoWindow.setContent("You.");
      infoWindow.open(map);
      map.setCenter(pos);
    });
  });

  // Calls function to location you on the map when no address is entered and grabs the user
  function findLocation() {
    // Sets the inital page display of the map in the background.
    // Hard Coded a random location into it

    map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 38.7555258, lng: -80.04494120000001 },
      zoom: 15,
    });

    infoWindow = new google.maps.InfoWindow();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function (position) {
          var pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          infoWindow.setPosition(pos);
          infoWindow.setContent("You.");
          infoWindow.open(map);
          map.setCenter(pos);
          userLat = position.coords.latitude;
          userLng = position.coords.longitude;

          // Runs the Zomato ajax call
          getFoodSpots();
        },
        function () {
          handleLocationError(true, infoWindow, map.getCenter());
        }
      );
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
  }

  // Googles error message handling if browser or computer doesn't support GPS
  function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
      browserHasGeolocation
        ? "Error: The Geolocation service failed."
        : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(map);
  }

  // This function is evoked when "Find A Place" button is clicked.
  // Calls the Zomato API to receive restaurants
  function getFoodSpots() {
    userRadius = $("#inputRadius").val().trim();
    meters = parseInt(userRadius * 1609.344);
    var APIKey = "&apikey=2acf625e70fd25f7205fda31a0f6cb15"; // Zomato API key
    var queryURL = `https://developers.zomato.com/api/v2.1/search?lat=${userLat}&lon=${userLng}&radius=${meters}&order=asc&sort=rating${APIKey}`;

    $.ajax({
      url: queryURL,
      method: "GET",
    }).then(function (response) {
      results = response.restaurants;
    });
  }

  // Picks a randomn location from the Zoomato food array and sets it to the side nave as well as calls the destnation map function
  $("#searchAgain").on("click", function () {
    // Here we want a random restaurant when users decide to click "searchAgain" button.
    var randomNumber = [Math.floor(Math.random() * 20)];

    // i is a local variable set to undefined
    // Set i equal to randomNumber to receive results info only once.
    i = randomNumber;

    // <li> will hold the list items from results
    var placeHolder = $("<li>");
    placeHolder.addClass("placeCard");

    var URL = $("<a>"); // This will grab each restaurant URL
    var restaurantCuisines = $("<p>"); // target the results.restaurant.cuisines
    var restaurantHighlights = $("<p>"); // This will target the results.restaurant.highlights
    var restaurantRatings = $("<p>"); // This will target the results.restairant.ratings
    var restaurantName = $("<h4>"); // Name will target the names of the restaurant

    restaurantName.addClass("restName");
    restaurantName.attr("data-name", results[i].restaurant.name);
    restaurantName.text(results[i].restaurant.name);

    // restaurant URL links
    URL.addClass("link");
    URL.attr("href", results[i].restaurant.url);

    // Restaurant cuisine
    restaurantCuisines.addClass("cuisine");
    restaurantCuisines.text(results[i].restaurant.cuisines);

    // Restaurant highlights
    restaurantHighlights.addClass("info");
    restaurantHighlights.attr("data-info", results[i].restaurant.highlights);
    restaurantHighlights.text(results[i].restaurant.highlights);

    // restaurant ratings
    restaurantRatings.addClass("rating");
    restaurantRatings.attr(
      "data-rating",
      results[i].restaurant.user_rating.aggregate_rating
    );
    restaurantRatings.text(
      "Rating: " + results[i].restaurant.user_rating.aggregate_rating
    );

    // Append results.restaurant info to var a (links)
    URL.append(
      restaurantHighlights,
      restaurantRatings,
      restaurantName,
      restaurantCuisines
    );

    // Append restaurant links to placeHolder (<li>)
    placeHolder.append(URL);

    // Append placeHolder to sideNav ID
    $("#sideNav").append(placeHolder);

    // Diplsay the latitude and longitude for each restaurant
    destLat = results[i].restaurant.location.latitude * 1;
    destLng = results[i].restaurant.location.longitude * 1;

    // Calling the destMap to display where the restaurant is located on the map
    destMap();
  });

  // Sets the second map with the location of the food place and your current location
  function destMap() {
    lats = destLat;
    lngs = destLng;

    // Map options
    var options = {
      zoom: 15,
      center: {
        lat: 41.955048,
        lng: -79.835499,
      },
    };

    // Dest map settings
    var map = new google.maps.Map(document.getElementById("map"), options);
    var rendererOptions = {
      suppressMarkers: true,
    };

    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
    directionsDisplay.setMap(map);
    var request = {
      travelMode: google.maps.TravelMode.DRIVING,
      optimizeWaypoints: true,
      waypoints: [],
    };

    // Array of markers that show on the map (Start and finish locations)
    var markers = [
      {
        coords: {
          lat: userLat,
          lng: userLng,
        },
        // iconImage:'ME.png',
        content: "You",
      },
      {
        coords: {
          lat: lats,
          lng: lngs,
        },
        // iconImage:'food.png',
        content: results[i].restaurant.name,
      },
    ];

    // Loop through markers object to set each
    for (var j = 0; j < markers.length; j++) {
      // Add marker
      addMarker(markers[j]);
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
          content: props.content,
        });

        marker.addListener("click", function () {
          infoWindow.open(map, marker);
        });
      }

      if (j === 0) {
        request.origin = props.coords;
      } else if (j === markers.length - 1) {
        request.destination = props.coords;
      } else {
        if (props.coords) {
          request.waypoints.push({
            location: props.coords,
            stopover: true,
          });
        }
      }

      infoWindow.open(map, marker);
      // End of Add Marker Function
    }

    directionsService.route(request, function (response, status) {
      if (status == "OK") {
        directionsDisplay.setDirections(response);
      }
    });
  }

  // When users are viewing the sideNav and decide to click on the restaurant link it will sent them to that link.
  $(document).on("click", ".link", function (event) {
    event.preventDefault();
    window.open(this.href, "_blank");
  });
});
