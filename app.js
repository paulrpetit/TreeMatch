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
var tableBodyDavy = document.getElementById('davy');
var tableBodyDPW = document.getElementById('DPW');

map.on('move', function() {
  var bounds = map.getBounds();
  //remove existing elements from table
  while (tableBodyDavy.firstChild) {
      tableBodyDavy.removeChild(tableBodyDavy.firstChild);
  }
  while (tableBodyDPW.firstChild) {
    tableBodyDPW.removeChild(tableBodyDPW.firstChild);
  }
  // on each Davy layer calulate if DPW lies within bbox and append table
  DavyLayer.eachLayer(function(marker) {
    if (bounds.contains(marker.getLatLng())) {
      var link = tableBodyDavy.appendChild(document.createElement('a'));
      link.className = 'item';
      link.href = '#';
      link.innerHTML = '<tr class="" id='+marker._leaflet_id+'><td>'+marker._leaflet_id+'</td><td>'+marker.feature.properties.name+'</td><td>Davy</td></tr><br>';
      link.onclick = function() {
        if (/active/.test(this.className)) {
          this.className = this.className.replace(/active/, '').replace(/\s\s*$/, '');
        } else {
          var siblings = tableBodyDavy.getElementsByTagName('a');
          for (var i = 0; i < siblings.length; i++) {
            siblings[i].className = siblings[i].className
              .replace(/active/, '').replace(/\s\s*$/, '');
          };
          this.className += ' active';

          // When a menu item is clicked, animate the map to center
          // its associated marker and open its popup.
          map.panTo(marker.getLatLng());
          marker.openPopup();
        }
        return false;
      };
    }
  });
  
  // on each DPW layer append table body
  DPWLayer.eachLayer(function(marker) {
    if (bounds.contains(marker.getLatLng())) {
      var link = tableBodyDPW.appendChild(document.createElement('a'));
      link.className = 'item';
      link.href = '#';
      link.innerHTML = '<tr class="" id='+marker._leaflet_id+'><td>'+marker._leaflet_id+'</td><td>'+marker.feature.properties.name+'</td><td>DPW</td></tr><br>';
      link.onclick = function() {
        if (/active/.test(this.className)) {
          this.className = this.className.replace(/active/, '').replace(/\s\s*$/, '');
        } else {
          var siblings = tableBodyDPW.getElementsByTagName('a');
          for (var i = 0; i < siblings.length; i++) {
            siblings[i].className = siblings[i].className
              .replace(/active/, '').replace(/\s\s*$/, '');
          };
          this.className += ' active';

          // When a menu item is clicked, animate the map to center
          // its associated marker and open its popup.
          map.panTo(marker.getLatLng());
          marker.openPopup();
        }
        return false;
      };
    }
  });
});

// When map loads, zoom to libraryLayer features
map.fitBounds(DavyLayer.getBounds());