let origin = ['46.546389','-87.406667']
let destination = ['45.745833','-87.064167']
apiKey = 'pk.eyJ1IjoiamFjb2ItamVmZnJpZXMiLCJhIjoiY2xjcDJzeTJtMWh3YzNwcjBscWJ2amg5OCJ9.FCsyRgLMa5gW0lyMlWsClw'

url = 'https://api.mapbox.com/directions/v5/mapbox/driving/'+origin[1]+','+origin[0]+';'+destination[1]+','+destination[0]+'?geometries=geojson&access_token='+apiKey

fetch(url)
.then(function(response) {
  return response.json();
})
.then(function(data) {
  console.log(data);
});

mapboxgl.accessToken = 'pk.eyJ1IjoiamFjb2ItamVmZnJpZXMiLCJhIjoiY2xjcDFpNzQwOTcyYjNxcG50YzRzcXJkaCJ9.jzr3wLabpJcm1KbVsDCe-w';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [-85,45], // starting position
  zoom: 4.5
});
// set the bounds of the map
const bounds = [
  [-91.29156, 41.22885],
  [-80.83142, 48.42494]
];
map.setMaxBounds(bounds);

// an arbitrary start will always be the same
// only the end or destination will change
const start = [-87.406667,46.546389];

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
});

