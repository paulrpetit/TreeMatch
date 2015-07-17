// toggle guide
$('#guide-body').hide();
$('#guide').click(function() {
  $('#guide-body').toggle('fast');
});
//toggle match table
$('#match-body').hide();
$('#match-table').click(function() {
  $('#match-body').toggle('fast');
});

//basic map
L.mapbox.accessToken = 'pk.eyJ1IjoiYmxvdmF0byIsImEiOiJmcXN6S1YwIn0.xr8I64KZ2GNjEoONxqH42g';
var map = L.mapbox.map('map', 'mapbox.streets-satellite', {
  zoomControl: false,
  attributionControl: false
}).setView([37.76,-122.48], 18);

// Set marker and popup properties for each layer
for(i=0; i< davy.features.length; i++){
  davy.features[i].properties['marker-color'] = "#e55e5e";
  davy.features[i].properties['marker-size'] = "small";
}

for(i=0; i< DPW.features.length; i++){
  DPW.features[i].properties['marker-color'] = "#f9886c";
  DPW.features[i].properties['marker-size'] = "small";
}

var DPWLayer = L.mapbox.featureLayer();
var DavyLayer = L.mapbox.featureLayer();

DavyLayer.setGeoJSON(davy);
DPWLayer.setGeoJSON(DPW);

// On map move, determine if point lies within bounding box
// run buffer on davy points and test which points lie within
// add within dpw points to the html table
var tableBodyDavy = document.getElementById('davy');
var tableBodyDPW = document.getElementById('DPW');
var tableBodyMatches = document.getElementById('match-data');
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
      marker.bindPopup('<h3 value='+marker.feature.properties.FID_1+'>'+marker.feature.properties.COMMON+'</h3><p>'+marker.feature.properties.ADDRESS+ ' ' +marker.feature.properties.STREET+'</p><a target="_blank" href="https://maps.google.com?layer=c&cbll=' +marker.feature.geometry.coordinates[1]+ ',' + marker.feature.geometry.coordinates[0] +'">Google Street View</a>'); 
      marker.addTo(map);
      var link = tableBodyDavy.appendChild(document.createElement('tr'));
      link.className = marker._leaflet_id;
      link.href = '#';
      link.innerHTML = '<td value='+marker.feature.properties.FID_1+'>'+marker.feature.properties.COMMON+'</td><td>'+marker.feature.properties.BOTANICAL+'</td><td>'+marker.feature.properties.ADDRESS+ ' ' +marker.feature.properties.STREET+'</td><td>'+marker.feature.properties.SEQUENCE+'</td>';
      // on marker click, select record in table
      marker.on('click', function() {
        if (/active/.test(link.className)) {
          link.className = link.className.replace(/active/, '').replace(/\s\s*$/, '');
        } 
        else {
          var siblings = tableBodyDavy.getElementsByTagName('tr');
          for (var i = 0; i < siblings.length; i++) {
            siblings[i].className = siblings[i].className
            .replace(/active/, '').replace(/\s\s*$/, '');
          };
          link.className += ' active';
        }
        return false;
      });
      // on click table record, change class and open popup on marker
      link.onclick = function() {
        if (/active/.test(this.className)) {
          this.className = this.className.replace(/active/, '').replace(/\s\s*$/, '');
        } 
        else {
          marker.openPopup();
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
      marker.bindPopup('<h3 value='+marker.feature.properties.TreeID+'>'+marker.feature.properties.CommonName+'</h3><p>'+marker.feature.properties.AddressNo+ ' ' +marker.feature.properties.Street+'</p><a target="_blank" href="https://maps.google.com?layer=c&cbll=' +marker.feature.geometry.coordinates[1]+ ',' + marker.feature.geometry.coordinates[0] +'">Google Street View</a>');
      marker.addTo(map);
      var link = tableBodyDPW.appendChild(document.createElement('tr'));
      link.className = 'item';
      link.href = '#';
      link.innerHTML = '<td value='+marker.feature.properties.TreeID+'>'+marker.feature.properties.CommonName+'</td><td>'+marker.feature.properties.LatinName+'</td><td>'+marker.feature.properties.AddressNo+ ' ' +marker.feature.properties.Street+'</td><td>'+marker.feature.properties.SiteOrder+'</td>';
      // on marker click, select record in table
      marker.on('click', function() {
        if (/active/.test(link.className)) {
          link.className = link.className.replace(/active/, '').replace(/\s\s*$/, '');
        } 
        else {
          var siblings = tableBodyDPW.getElementsByTagName('tr');
          for (var i = 0; i < siblings.length; i++) {
            siblings[i].className = siblings[i].className
            .replace(/active/, '').replace(/\s\s*$/, '');
          };
          link.className += ' active';
        }
        return false;
      });
      // on click table record, change class and open popup on marker
      link.onclick = function() {
        if (/active/.test(this.className)) {
          this.className = this.className.replace(/active/, '').replace(/\s\s*$/, '');
        } 
        else {
          marker.openPopup();
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


//CSV creation and export
var data = [["Number of Match", "DavyID", "DPW-ID"]];
var csvContent = "";
var clickCounter = 0;
//match function adds selected features to data for csv
var matchSelected = function() {
  clickCounter++
  csvContent = "";
  var davySelected = tableBodyDavy.getElementsByClassName('active');
  var davyID = davySelected[0].childNodes[0].getAttribute('value');
  var DpwSelected = tableBodyDPW.getElementsByClassName('active');
  var DpwID = DpwSelected[0].childNodes[0].getAttribute('value');

  if (davyID && DpwID) {
    data[clickCounter] = new Array(3);
    data[clickCounter][0] = clickCounter - 1;
    data[clickCounter][1] = davyID;
    data[clickCounter][2] = DpwID;

    data.forEach(function(infoArray, index){
      dataString = infoArray.join(",");
      csvContent += index < data.length ? dataString+ "\n" : dataString;
    });
  }
  var link = tableBodyMatches.appendChild(document.createElement('tr'));
  link.setAttribute("id", "match"+data[clickCounter][0]);
  link.innerHTML = '<td>'+ data[clickCounter][0] +'</td><td>'+data[clickCounter][1]+'</td><td>'+data[clickCounter][2]+'</td>'

  // create new line feature between matched points and add them to the group
  var filteredDavy = turf.filter(davy, 'FID_1', Math.floor(davyID));
  var filteredDPW = turf.filter(DPW, 'TreeID', Math.floor(DpwID));

  var filteredDavyLatLng = [filteredDavy.features[0].geometry.coordinates[1], filteredDavy.features[0].geometry.coordinates[0]];
  var filteredDPWLatLng = [filteredDPW.features[0].geometry.coordinates[1], filteredDPW.features[0].geometry.coordinates[0]];

  var line = L.polyline([filteredDPWLatLng,filteredDavyLatLng], {color: '#56b881', opacity: '1'});
  matchLineGroup.addLayer(line);
};
var matchLineGroup = L.featureGroup().addTo(map);



// convert csv data and download
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
// button click runs download function
var downloadCSV = function() {
  download(csvContent, 'treeMatch.csv', 'text/csv');
}