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
      link.innerHTML = '<td value='+marker._leaflet_id+'>'+marker._leaflet_id+'</td><td>'+marker.feature.properties.name+'</td><td>Davy</td>';
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
      link.innerHTML = '<td value='+marker._leaflet_id+'>'+marker._leaflet_id+'</td><td>'+marker.feature.properties.name+'</td><td>DPW</td>';
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
var data = [["clickCounter", "DavyID", "DPW-ID"]];
var csvContent = "";
var clickCounter = 1;
//match function adds selected features to data for csv
var matchSelected = function() {
  clickCounter++

  var davySelected = tableBodyDavy.getElementsByClassName('active');
  var davyID = davySelected[0].childNodes[0].innerText;

  var DpwSelected = tableBodyDPW.getElementsByClassName('active');
  var DpwID = DpwSelected[0].childNodes[0].innerText;

  if (davyID && DpwID) {
    data[clickCounter] = new Array(3);
    data[clickCounter][0] = clickCounter - 2;
    data[clickCounter][1] = davyID;
    data[clickCounter][2] = DpwID;

    data.forEach(function(infoArray, index){
      dataString = infoArray.join(",");
      csvContent += index < data.length ? dataString+ "\n" : dataString;
    });
  }
  console.log(csvContent);
};

var download = function(content, fileName, mimeType) {
  var a = document.createElement('a');
  mimeType = mimeType || 'application/octet-stream';

  if (navigator.msSaveBlob) { // IE10
    return navigator.msSaveBlob(new Blob([content], { type: mimeType }), fileName);
  } else if ('download' in a) { //html5 A[download]
    a.href = 'data:' + mimeType + ',' + encodeURIComponent(content);
    a.setAttribute('download', fileName);
    document.body.appendChild(a);
    setTimeout(function() {
      a.click();
      document.body.removeChild(a);
    }, 66);
    return true;
  } else { //do iframe dataURL download (old ch+FF):
    var f = document.createElement('iframe');
    document.body.appendChild(f);
    f.src = 'data:' + mimeType + ',' + encodeURIComponent(content);

    setTimeout(function() {
      document.body.removeChild(f);
    }, 333);
    return true;
  }
}
var downloadCSV = function() {
  download(csvContent, 'treeMatch.csv', 'text/csv');
}