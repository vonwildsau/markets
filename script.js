// This isn't necessary but it keeps the editor from thinking L and carto are typos
/* global L, carto, Mustache */

(function() { /**** scoping function open ****/

var map = L.map('map', {
  center: [40.728709, -73.979167],
  zoom: 11
});

// Get the popup template from the HTML.
var popupTemplate = document.querySelector('.popup-template').innerHTML;

// Add base layer
L.tileLayer(' https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: "&copy <a href=https://vonwildsau.com target='_blank'> vonwildsau</a>, <a href=https://data.cityofnewyork.us/dataset/DOHMH-Farmers-Markets/8vwk-6iz2> DOHMH</a>",
}).addTo(map);

// Initialize Carto
var client = new carto.Client({
  apiKey: 'default_public',
  username: 'vonwildsau'
});

  
  

// Initialze source data
var source = new carto.source.Dataset('table_8vwk_6iz2');
var source = new carto.source.SQL("SELECT * FROM vonwildsau.table_8vwk_6iz2");
// var source = new carto.source.SQL("SELECT * FROM vonwildsau.table_8vwk_6iz2 WHERE daysoperation ILIKE '%tuesday%'");
  
    
var d = new Date();
var options = { weekday: 'long'};
var day = (new Intl.DateTimeFormat('en-US', options).format(d));
console.log('Today is: ' + day);

var sql = "SELECT * FROM vonwildsau.table_8vwk_6iz2 WHERE open_year_round ILIKE 'Yes' AND daysoperation ILIKE "
console.log(sql + "'%" + day + "%'");
  
source.setQuery(sql + "'%" + day + "%'");


// Create style for the data
var style = new carto.style.CartoCSS(`
#layer {
  marker-width: 13;
  marker-fill: #1b7200;
  marker-fill-opacity: 0.9;
  marker-file: url('https://s3.amazonaws.com/com.cartodb.users-assets.production/production/vonwildsau/assets/20191207192556toma.png');
  marker-allow-overlap: true;
  marker-line-width: 1;
  marker-line-color: #FFFFFF;
  marker-line-opacity: 1;
  [zoom<12] {marker-width: 14}
  [zoom>12] {marker-width: 20}
}
`);

// Add style to the data
//
// Note: any column you want to show up in the popup needs to be in the list of featureClickColumns below
var layer = new carto.layer.Layer(source, style, {
  featureClickColumns: ['marketname', 'seasondates', 'streetaddress', 'hoursoperations', 'accepts_ebt', 'daysoperation', 'seasondates']
});

layer.on('featureClicked', function (event) {
  // Render the template with all of the data. Mustache ignores ata
  // that isn't used in the template, so this is fine.
  var content =  Mustache.render(popupTemplate, event.data);
  
  var popup = L.popup();
  popup.setContent(content);
  
  // Place the popup and open it
  popup.setLatLng(event.latLng);
  popup.openOn(map);
});



  // Add the data to the map as a layer
client.addLayer(layer);
client.getLeafletLayer().addTo(map);


  })();   /**** scoping function close ****/