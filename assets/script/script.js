var apiKey = "c4bb58bd64426daa167673eddf9bb21a";
var city = "";
var state = "";

function isZipCode(str) {
  const re = /^\d{5}$/;
  return re.test(str);
}

(function () {
  // search listener
  $(document).on("submit", "#search-form", function(event) {
    event.preventDefault();
    $("#location").removeClass("error");
    $("#location-error").hide();
    $("#root").html('');
    getLocation();
  });

  function getLocation() {
    let searchLocation = $("#location").val();
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

  function getWeatherData(lat, lon, addHistory=true) {
    let url = "https://api.openweathermap.org/data/3.0/onecall";
    let data = {
      lat: lat,
      lon: lon,
      units: 'imperial',
      exclude: 'minutely,hourly',
      appid: apiKey,
    };

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
        displayWeatherData(weather);
        if(addHistory) {
          $("#location-history").append(`<button type="button" class="location-history-btn" data-lat="${lat}" data-lon="${lon}" data-city="${city}" data-state="${state}" data-country="${country}">${city}, ${state}</button>`);
        }
      },
      error: function (response) {
        locationError();
        return;
      },
    });
  }

  function displayWeatherData(weather) {
    console.log("dt", weather.current.dt);
    console.log("offset", weather.timezone_offset);
    $("#root").append(`<div id="current-wrapper">
      <h2 id="current-header">Current Weather for ${city}, ${state}, ${country}<br />${dayjs(dayjs.unix(parseInt(weather.current.dt)+parseInt(weather.timezone_offset))).format("dddd, MMMM D, YYYY h:mmA")}</h2>
      <div id="current-content">
      <div id="icon"><img class="weather-icon-current" src="./assets/img/weather-icons/${weather.current.weather[0].icon}.png" /></div>
      <div id="current-text">
        <div id="current-description"><strong>Description: </strong>${weather.current.weather[0].description}</div>
        <div id="current-temp"><strong>Temperature:</strong> ${weather.current.temp}&deg;F</div>
        <div id="current-temp"><strong>Feels Like:</strong> ${weather.current.feels_like}&deg;F</div>
        <div id="current-temp"><strong>Humidity:</strong> ${weather.current.humidity}%</div>
        <div id="current-temp"><strong>Wind Speed:</strong> ${weather.current.wind_speed}mph</div>
        </div>
      </div>
    </div>`);

    $("#root").append('<div id="daily-wrapper"></div>');

    weather.daily.forEach((day,index) => {
      if(index < 5) {
        $("body #daily-wrapper").append(`<div class="daily-forecast">
          <h4>${dayjs(dayjs.unix(parseInt(day.dt) + parseInt(weather.timezone_offset))).format("ddd, MMM D")}</h4>
          <div><img class="weather-icon-daily" src="./assets/img/weather-icons/${day.weather[0].icon}.png" /></div>
          <div id="daily-text">
            <div><strong>Temp Day:</strong> ${day.temp.day}&deg;F</div>
            <div><strong>Temp Night:</strong> ${day.temp.night}&deg;F</div>
            <div><strong>Feels Like:</strong> ${weather.current.feels_like}&deg;F</div>
            <div><strong>Humidity:</strong> ${weather.current.humidity}%</div>
            <div><strong>Wind Speed:</strong> ${weather.current.wind_speed}mph</div>
            </div>
        </div>`);
    }
    });
  }

});
mapboxgl.accessToken = 'pk.eyJ1IjoiamFjb2ItamVmZnJpZXMiLCJhIjoiY2xjcDJzeTJtMWh3YzNwcjBscWJ2amg5OCJ9.FCsyRgLMa5gW0lyMlWsClw';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [-87, 45], // starting position
  zoom: 4.5
});
// set the bounds of the map
const bounds = [
  [-90.81610, 41.50836],
  [-81.42114, 47.93089]
];
map.setMaxBounds(bounds);

// an arbitrary start will always be the same
// only the end or destination will change
const start = [-122.662323, 45.523751];

// this is where the code for the next step will go
// create a function to make a directions request
async function getRoute(end) {
  // make a directions request using cycling profile
  // an arbitrary start will always be the same
  // only the end or destination will change
  const query = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/cycling/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
    { method: 'GET' }
  );
  const json = await query.json();
  const data = json.routes[0];
  console.log(json.routes[0]);
  const route = data.geometry.coordinates;
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
    map.getSource('route').setData(geojson);
  }
  // otherwise, we'll make a new request
  else {
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
  }
  // add turn instructions here at the end
  console.log(data);

const instructions = document.getElementById('instructions');
const steps = data.legs[0].steps;
console.log(steps);

let tripInstructions = '';
for (const step of steps) {
  tripInstructions += `<li>${step.maneuver.instruction}</li>`;
}
instructions.innerHTML = `<p><strong>Trip duration: ${Math.floor(
  data.duration / 60
)} min 🚴 </strong></p><ol>${tripInstructions}</ol>`;
}

map.on('load', () => {
  // make an initial directions request that
  // starts and ends at the same location
  getRoute(start);

  // Add starting point to the map
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
              coordinates: start
            }
          }
        ]
      }
    },
    paint: {
      'circle-radius': 10,
      'circle-color': '#3887be'
    }
  });
  // this is where the code from the next step will go
  map.on('click', (event) => {
    const coords = Object.keys(event.lngLat).map((key) => event.lngLat[key]);
    const end = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: coords
          }
        }
      ]
    };
    if (map.getLayer('end')) {
      map.getSource('end').setData(end);
    } else {
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
                  coordinates: coords
                }
              }
            ]
          }
        },
        paint: {
          'circle-radius': 10,
          'circle-color': '#f30'
        }
      });
    }
    getRoute(coords);
  });
  // get the sidebar and add the instructions
});