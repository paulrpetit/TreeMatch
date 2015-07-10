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
      var link = tableBodyDavy.appendChild(document.createElement('tr'));
      link.className = marker._leaflet_id;
      link.href = '#';
      link.innerHTML = '<td></td><td>'+marker._leaflet_id+'</td><td>'+marker.feature.properties.name+'</td><td>Davy</td>';
      link.onclick = function() {
        if (/active/.test(this.className)) {
          this.className = this.className.replace(/active/, '').replace(/\s\s*$/, '');
        } 
        else {
          var siblings = tableBodyDavy.getElementsByTagName('tr');
          for (var i = 0; i < siblings.length; i++) {
            siblings[i].className = siblings[i].className
            .replace(/active/, '').replace(/\s\s*$/, '');
          };
          this.className += ' active';
        }
        link.ondblclick = function(){
          map.setView(marker.getLatLng(), 23);
        }
        return false;
      };
    }
  });
  
  // on each DPW layer append table body
  DPWLayer.eachLayer(function(marker) {
    if (bounds.contains(marker.getLatLng())) {
      var link = tableBodyDPW.appendChild(document.createElement('tr'));
      link.className = 'item';
      link.href = '#';
      link.innerHTML = '<td></td><td>'+marker._leaflet_id+'</td><td>'+marker.feature.properties.name+'</td><td>DPW</td>';
      link.onclick = function() {
        if (/active/.test(this.className)) {
          this.className = this.className.replace(/active/, '').replace(/\s\s*$/, '');
        } 
        else {
          var siblings = tableBodyDPW.getElementsByTagName('tr');
          for (var i = 0; i < siblings.length; i++) {
            siblings[i].className = siblings[i].className
              .replace(/active/, '').replace(/\s\s*$/, '');
          };
          this.className += ' active';
        }
        link.ondblclick = function(){
          map.setView(marker.getLatLng(), 23);
        }
        return false;
      };
    }
  });
});

// When map loads, zoom to libraryLayer features
map.fitBounds(DavyLayer.getBounds());

//CSV creation and export
var data = [["name1", "city1", "some other info"], ["name2", "city2", "more info"]];
var csvContent = "data:text/csv;charset=utf-8,";
data.forEach(function(infoArray, index){
   dataString = infoArray.join(",");
   csvContent += index < data.length ? dataString+ "\n" : dataString;
});
var downloadCSV = function(csvContent){
  var encodedUri = encodeURI(csvContent);
  window.open(encodedUri);
}