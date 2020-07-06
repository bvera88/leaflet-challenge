// Store our API endpoint inside queryUrl
var queryUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

var earthquakes = new L.LayerGroup();

// i couldn't find the leaflet map like the gray one used in the image, so i applied the dark
  var darkmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/dark-v10',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    // "Satellite Map": satellitemap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Earthquakes": earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [37.0902, -95.7129],
    zoom: 4,
    layers: [darkmap, earthquakes]
  });

  // Create a layer control
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  d3.json(queryUrl, function(earthquakeData) {
    // function for size of markers
    function markerSize(magnitude) {
        if (magnitude === 0) {
          return 1;
        }
        return magnitude * 3;
    }
    // coloring the markers here
    function styleInfo(feature) {
        return {
          opacity: 1,
          fillOpacity: 1,
          fillColor: chooseColor(feature.properties.mag),
          color: "#000000",
          radius: markerSize(feature.properties.mag),
          stroke: true,
          weight: 0.5
        };
    }

    // geojson layer created
    L.geoJSON(earthquakeData, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: styleInfo,
        
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h4>Location: " + feature.properties.place + 
            "</h4><hr><p>Date & Time: " + new Date(feature.properties.time) + 
            "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");
        }
    // Add earthquakeData to earthquakes LayerGroups 
    }).addTo(earthquakes);
    // Add earthquakes 
    earthquakes.addTo(myMap);

      // adding colors for the legend
      // not sure why theyre not appearing on site
      function chooseColor(magnitude) {
          switch (true) {
          case magnitude > 5:
              return "#581845";
          case magnitude > 4:
              return "#900C3F";
          case magnitude > 3:
              return "#C70039";
          case magnitude > 2:
              return "#FF5733";
          case magnitude > 1:
              return "#FFC300";
          default:
              return "#DAF7A6";
          }
      }
    
      // creating the legend
      var legend = L.control({ position: "bottomright" });
      legend.onAdd = function() {
          var div = L.DomUtil.create("div", "info legend"), 
          magnitudeLevels = [0, 1, 2, 3, 4, 5];
  
          div.innerHTML += "<h3>Magnitude</h3>"
  
          for (var i = 0; i < magnitudeLevels.length; i++) {
              div.innerHTML +=
                  '<i style="background: ' + chooseColor(magnitudeLevels[i] + 1) + '"></i> ' +
                  magnitudeLevels[i] + (magnitudeLevels[i + 1] ? '&ndash;' + magnitudeLevels[i + 1] + '<br>' : '+');
          }
          return div;
      };
      legend.addTo(myMap);
  });

