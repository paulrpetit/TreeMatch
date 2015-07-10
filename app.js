//basic map
L.mapbox.accessToken = 'pk.eyJ1IjoiYmxvdmF0byIsImEiOiJmcXN6S1YwIn0.xr8I64KZ2GNjEoONxqH42g';
var map = L.mapbox.map('map', 'mapbox.light', {
  zoomControl: false
}).setView([37.7, -122], 9);
var DPWLayer = L.mapbox.featureLayer().addTo(map);
var DavyLayer = L.mapbox.featureLayer().addTo(map);

DavyLayer.setGeoJSON(davy);
DPWLayer.setGeoJSON(DPW);
// On map move, determine if point lies within bounding box
// run buffer on davy points and test which points lie within
// add within dpw points to the html table
map.on('move', function() {
  var DavyInBounds = [],
      DPWInBounds = [],
      bounds = map.getBounds();

  // on each Davy layer calulate if DPW lies within buffer and append table head
  DavyLayer.eachLayer(function(marker) {
    if (bounds.contains(marker.getLatLng())) {
      DavyInBounds.push('<tr><td><div class="checkbox-pill"><input type="checkbox" id='+marker._leaflet_id+' ><label for='+marker._leaflet_id+' class="button icon check fill-mustard short"></label></div></td><td>'+marker._leaflet_id+'</td><td>'+marker.feature.properties.name+'</td><td>Another Attribute</td></tr>');
    }
  });
  // concatenate html and set it for Davy
  DavyInBoundsConcat = "";
  for(i=0; i < DavyInBounds.length; i++) {
    DavyInBoundsConcat += DavyInBounds[i];
  }
  document.getElementById('davy').innerHTML = DavyInBoundsConcat;

  // on each DPW layer append table body
  DPWLayer.eachLayer(function(marker) {
    if (bounds.contains(marker.getLatLng())) {
      DPWInBounds.push('<tr><td><div class="checkbox-pill"><input type="checkbox" id='+marker._leaflet_id+' ><label for='+marker._leaflet_id+' class="button icon check fill-green short"></label></div></td><td>'+marker._leaflet_id+'</td><td>'+marker.feature.properties.name+'</td><td>plus some</td></tr>');
    }
  });
  // concatenate html and set it for DPW
  DPWInBoundsConcat = "";
  for(i=0; i < DPWInBounds.length; i++) {
    DPWInBoundsConcat += DPWInBounds[i];
  }
  document.getElementById('DPW').innerHTML = DPWInBoundsConcat;
});

// When map loads, zoom to libraryLayer features
map.fitBounds(DavyLayer.getBounds());