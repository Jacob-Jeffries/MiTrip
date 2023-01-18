var apiKey = "c4bb58bd64426daa167673eddf9bb21a";
var city = "";
var state = "";
var country = "";
let startCity = document.querySelector("#start");
let endCity = document.querySelector("#end");
var date = ('dddd, MMMM Do YYYY');
var dateTime = ('YYYY-MM-DD HH:MM:SS');

function isZipCode(str) {
  const re = /^\d{5}$/;
  return re.test(str);
}

$(function () {
  // search listener
  $(document).on("submit", "#search-form", function(event) {
    event.preventDefault();
    // $("#location").removeClass("error");
    // $("#location-error").hide();
    $("#root").html('');
    getLocation();
  });

  function getLocation() {
    let searchLocation = $("#start").val();
    console.log("location: ", searchLocation);
    console.log("isZip", isZipCode(searchLocation));

    if (isZipCode(searchLocation)) {
      getLocationByZip(searchLocation);
    } else {
      getLocationByCity(searchLocation);
    }
  }

  function getLocationByZip(searchLocation) {
    let url = "//api.openweathermap.org/geo/1.0/zip";
    let data = {
      zip: searchLocation + ",US",
      appid: apiKey,
    };

    $.ajax({
      type: "get",
      url: url,
      data: data,
      dataType: "json",
      success: function (location) {
        console.log(location);

        //if no results, show error
        if (!location.name) {
          locationError();
          return;
        }
        city = location.name;
        getWeatherData(location.lat, location.lon);
      },
      error: function (response) {
        locationError();
        return;
      },
    });
  }

  function getLocationByCity(searchLocation) {
    let url = "//api.openweathermap.org/geo/1.0/direct";
    let data = {
      q: searchLocation,
      limit: 5,
      appid: apiKey,
    };
    console.log("Data", data);
    $.ajax({
      type: "get",
      url: url,
      data: data,
      dataType: "json",
      success: function (locations) {
        console.log(locations);
        console.log("length", locations.length);

        //if no results, show error
        if (locations.length == 0) {
          locationError();
          return;
        }
        if (locations.length == 1) {
          getWeatherData(locations[0].lat, locations[0].lon);
          city = locations[0].name;
          state = locations[0].state;
          return;
        }
        $("#search-btn").after('<div class="location-choice"><h3>Which One?</h3></div>');
        locations.forEach((location, index) => {
          $(".location-choice").append(`<button type="button" class="location-choice-btn" data-lat="${location.lat}" data-lon="${location.lon}" data-city="${location.name}" data-state="${location.state}" data-country="${location.country}">${location.name}, ${location.state}</button>`);
        });
      },
      error: function (response) {
        locationError();
        return;
      },
    });
  }

  $(document).on("click", ".location-choice-btn", function() {
    city= $(this).data('city');
    state = $(this).data('state');
    getWeatherData($(this).data('lat'), $(this).data('lon'));
    $(".location-choice").remove();
  });

  $(document).on("click", ".location-history-btn", function() {
    city= $(this).data('city');
    state = $(this).data('state');
    getWeatherData($(this).data('lat'), $(this).data('lon'), false);
    $(".location-choice").remove();
  });

  function locationError() {
    $("#location").addClass("error");
    $("#location-error").show();
  }
  var url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;
  function getWeatherData(lat, lon, addHistory=true) {
    let data = {
      lat: lat,
      lon: lon,
      units: 'imperial',
      exclude: 'minutely,hourly',
      appid: apiKey,
    };

    localStorage.setItem("startLat", lat);
    localStorage.setItem("startLon", lon);

    $.ajax({
      type: "get",
      url: url,
      data: data,
      dataType: "json",
      success: function (weather) {
        console.log("Weather Data",weather);

        // if no results, show error
        if (weather.length == 0) {
          locationError();
          return;
        }

        $("#root").html('');
        console.log(weather);
        if(addHistory) {
          $("#location-history").append(`<button type="button" class="location-history-btn" data-lat="${lat}" data-lon="${lon}" data-city="${city}" data-state="${state}" data-country="${country}">${city}, ${state}</button>`);
        }
      },
      error: function (response) {
        locationError();
        return;
      },
    });
    // getRoute(end);
    callMapbox();
  };
  var cardTodayBody = $('.cardBodyToday')
  $(cardTodayBody).empty();

	$.ajax({
		url2: url,
		method: 'GET',
	}).then(function (response) {
		$('.cardTodayCityName').text(response.name);
		$('.cardTodayDate').text(date);
		//Icons
		$('.icons').attr('src', `https://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png`);
		// Temperature
		var pEl = $('<p>').text(`Temperature: ${response.main.temp} °F`);
		cardTodayBody.append(pEl);
		//Feels Like
		var pElTemp = $('<p>').text(`Feels Like: ${response.main.feels_like} °F`);
		cardTodayBody.append(pElTemp);
		//Humidity
		var pElHumid = $('<p>').text(`Humidity: ${response.main.humidity} %`);
		cardTodayBody.append(pElHumid);
		//Wind Speed
		var pElWind = $('<p>').text(`Wind Speed: ${response.wind.speed} MPH`);
		cardTodayBody.append(pElWind);
		//Set the lat and long from the searched city
		var cityLon = response.coord.lon;
		// console.log(cityLon);
		var cityLat = response.coord.lat;
		// console.log(cityLat);
  })
});

// Start of MAPBOX code-----JJ

function callMapbox(){
  let start = [null]
  let end = [null]

  // This takes the lat & long from the weather API for the starting city. I pull it from local storage - essentially I am using the weather API as my forward geocoding service
  start = [parseFloat(localStorage.getItem("startLon")), parseFloat(localStorage.getItem("startLat"))]
  console.log(start);

  // Hard coded the end point for development, until the second city in the form is working & storing Lon / Lat to local storage
  end = [-84.546667, 42.733611];
  console.log(end);

  getRoute(start, end);

  start = [null]
  end = [null]
}

// Line 205: Save my API Token as a variable used later in the API call
mapboxgl.accessToken = 'pk.eyJ1IjoiamFjb2ItamVmZnJpZXMiLCJhIjoiY2xjcDJzeTJtMWh3YzNwcjBscWJ2amg5OCJ9.FCsyRgLMa5gW0lyMlWsClw';

// Line 208-213: Creates a "map" variable and  draws it onto the screen; into which start point, end point, and directions lines will be drawn.
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [-86, 44], // starting position
  zoom: 4.5
});



// getRout(end) create a function to make a directions request
// This is an async function that uses await to handle the fetch promise
async function getRoute(start, end) {
  // Mapbox API call  
  const query = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
    { method: 'GET' }
  );
  // await instead of .then . then to handle promise
  const json = await query.json();
  const data = json.routes[0];  
  // console.log(json.routes[0]);
  // Pulling out the route data from the returned JSON object
  const route = data.geometry.coordinates;
  console.log(route);

  // Creating an object that contains the route data in a structured "geojson" accordiung to MAPBOX specifications - used to draw route on the map: line endpoints are defined
  const geojson = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: route
    }
  };

  // if the route already exists on the map, we'll reset it using setData
  if (map.getSource('route')) {
    // console.log("if");
    map.getSource('route').setData(geojson);
    map.getSource('point').setData(
      {
        type: 'Feature',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: [
                  parseFloat(localStorage.getItem("startLon")),
                  parseFloat(localStorage.getItem("startLat"))]
              }
      });
    map.getSource('end').setData(
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: end
        }
      });
  }
  // otherwise, we'll make a new request and draw the new features
  else {

    //Adds a blue line to represent the travel path
    map.addLayer({
      id: 'route',
      type: 'line',
      source: {
        type: 'geojson',
        data: geojson
      },
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#3887be',
        'line-width': 5,
        'line-opacity': 0.75
      }
    });

    //Adds a Green circle to the map to represent the start point
    map.addLayer({
      id: 'point',
      type: 'circle',
      source: {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: [
                  parseFloat(localStorage.getItem("startLon")),
                  parseFloat(localStorage.getItem("startLat"))]
              }
            }
          ]
        }
      },
      paint: {
        'circle-radius': 10,
        'circle-color': '#00FF00'
      }
    });

    //Add a red circle to the map to represent the destination point
    map.addLayer({
      id: 'end',
      type: 'circle',
      source: {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: end
              }
            }
          ]
        }
      },
      paint: {
        'circle-radius':10,
        'circle-color': '#f30'
      }
    });
  }
  
  // Add turn instructions here at the end
  // Line 327: calls the original JSON from the MAPBOX directions API call, and pulls out the text of directions. 
  const instructions = document.getElementById('instructions');
  const steps = data.legs[0].steps;
  let tripInstructions = '';
  for (const step of steps) {
    tripInstructions += `<li>${step.maneuver.instruction}</li>`;
  }
  instructions.innerHTML = `<p><strong>Trip duration: ${Math.floor(
    data.duration / 3600)} hr 🚗 </strong></p><ol>${tripInstructions}</ol>`;
};
// END of async that get directions from MAPBOX directions API
