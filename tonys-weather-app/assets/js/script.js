var apiKey = "dd973ce46d39d0efc4bc792777fb49f2";
var city = "";
var state = "";
var country = "";

function isZipCode(str) {
  const re = /^\d{5}$/;
  return re.test(str);
}

$(function () {
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
        state = "";
        country = location.country;
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
          country = locations[0].country;
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
    country = $(this).data('country');
    getWeatherData($(this).data('lat'), $(this).data('lon'));
    $(".location-choice").remove();
  });

  $(document).on("click", ".location-history-btn", function() {
    city= $(this).data('city');
    state = $(this).data('state');
    country = $(this).data('country');
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