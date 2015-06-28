function initialize() {
  var places = [
    'the ohio statehouse',
    'the ohio state university',
    'leveque tower',
    'cosi',
    'franklin park conservatory'
  ];
  var map;
  
  function drawMap() {
    var mapDiv = document.getElementById('map-canvas');
    var mapOptions = {
      center: {lat: 39.9833, lng: -82.9833},
      zoom: 10,
      disableDefaultUI: true
    };
    map = new google.maps.Map(mapDiv, mapOptions);
  }
  
  function addPlaces() {
    var placesService = new google.maps.places.PlacesService(map);
    
    for (var i = 0; i < places.length; i++) {
      var request = {
        query: places[i]
      };
      placesService.textSearch(request, placesServiceCallback);
    }
  }
  
  function placesServiceCallback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      addMarker(results[0]);
    }
  }
  
  function addMarker(placeData) {
    var marker = new google.maps.Marker({
      map: map,
      position: placeData.geometry.location,
      title: placeData.name
    });

    var infoWindow = new google.maps.InfoWindow({
      content: placeData.name
    });
    
    google.maps.event.addListener(marker, 'click', function() {
      infoWindow.open(map, marker);
    });
    
    myViewModel.mapMarkers.push(marker);
  }
  
  var ViewModel = function() {
    var self = this;
    
    self.searchTerm = ko.observable('');
    self.mapMarkers = ko.observableArray();
    
    self.filteredPlaces = ko.computed(function() {
      return places.filter(function(place) {
        if (place.indexOf(self.searchTerm()) > -1) {
          return true;
        } else {
          return false;
        }
      });
    });
      
    self.filteredMapMarkers = ko.computed(function() {
      return self.mapMarkers().filter(function(marker) {
        if (marker.title.indexOf(self.searchTerm()) > -1) {
          marker.setMap(map)
          return true;
        } else {
          marker.setMap(null);
          return false;
        }
      });
    });
    
    self.selectMapMarker = function() {
      console.log(this.title + ' clicked.');
      var infoWindow = new google.maps.InfoWindow({
        content: this.title
      });
      infoWindow.open(map, this);
    };
  };
  
  var myViewModel = new ViewModel();
  ko.applyBindings(myViewModel);
  drawMap();
  addPlaces();
}



window.onload = initialize;


/*
function createMapMarker(placeData) {
  var lat = placeData.geometry.location.lat();
  var lon = placeData.geometry.location.lng();
  var name = placeData.formatted_address;
  var bounds = window.mapBounds;
  var marker = new google.maps.Marker({
    map: map,
    position: placeData.geometry.location,
    title: name
  });
  
  
}

function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    createMapMarker(results[0]);
  }
}

var service = new google.maps.places.PlacesService(map);
var request = {
  query: place
};
service.textSearch(request, callback);
*/