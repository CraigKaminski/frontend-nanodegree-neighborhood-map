function initialize() {
  var places = [
    'leveque tower',
    'cosi',
    'franklin park conservatory and botanical gardens',
    'the columbus clippers',
    'ohio stadium',
    'columbus blue jackets',
    'columbus park of roses',
    'lifestyle communities pavilion',
    'greater columbus convention center'
  ];
  var map;
  
  function drawMap() {
    var mapDiv = document.getElementById('map-canvas');
    var mapOptions = {
      center: {lat: 39.9833, lng: -82.9833},
      zoom: 11,
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

    contentDiv = document.createElement('div');
    contentDiv.innerHTML = '<h2>' + placeData.name + '</h2>';
    var infoWindow = new google.maps.InfoWindow({
      content: contentDiv,
      maxWidth: 300
    });
    
    google.maps.event.addListener(marker, 'click', function() {
      var flickrUrl = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=48176340165d2b6fba06370ce7e21e95&format=json&jsoncallback=?&text=' + placeData.name + ' columbus ohio';
      $.getJSON(flickrUrl, function(data) {
        var photos = data.photos.photo;
        var randomPhotos = [];
        for (var i = 0; i < 4; i++) {
          randomIndex = Math.floor(Math.random() * photos.length);
          randomPhotos.push(photos[randomIndex]);
        }
        var infoWindowContent = '<h2>' + marker.getTitle() + '</h2>';
        for (var i = 0; i < 4; i++) {
          var photoUrl = 'https://farm' + randomPhotos[i].farm + '.staticflickr.com/' +
           randomPhotos[i].server + '/' + randomPhotos[i].id + '_' + randomPhotos[i].secret + '_q.jpg';
          infoWindowContent += '<img src=' + photoUrl + '>';
        }
        // var photo = data.photos.photo[0];
        // var photoUrl = 'https://farm' + photo.farm + '.staticflickr.com/' +
        //   photo.server + '/' + photo.id + '_' + photo.secret + '_q.jpg';
        // console.log(photoUrl);
        // infoWindow.setContent('<h2>' + marker.getTitle() + '</h2>' +
        //   '<img src=' + photoUrl + '>');
        infoWindow.setContent(infoWindowContent);
      }).error(function(jqXHR, errorString) {
        console.log('flickr images could not be loaded: ' + errorString);
      });
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
      console.log(this.getTitle() + ': ' + this.getPosition().lat() + ', ' + this.getPosition().lng());
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