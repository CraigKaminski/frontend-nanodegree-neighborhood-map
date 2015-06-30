// The mapView object holds all the logic for creating and manipulating the map.
// An immediately-invoked function expression is used to hide any properties and
// methods not required outside of the object.
var mapView = (function() {
  // The object contains the coordinates for the center of the map
  var mapCenter = {lat: 39.9833, lng: -82.9833};

  // This array holds the places of interest.
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
  
  // A variable which will hold a reference to the Google map.
  var map;
  
  // This function creates a Google map
  function drawMap() {
    // Obtain a reference to the div which will contain the map
    var mapDiv = document.getElementById('map-canvas');
    // Set some options for the map
    var mapOptions = {
      center: mapCenter,
      zoom: 11,
      disableDefaultUI: true
    };
    // Create the Google map
    map = new google.maps.Map(mapDiv, mapOptions);
  }
  
  // This function adds a map mark for each location in the places array
  function addPlaces() {
    // Create a places services object so the name of the place can
    // be converted into coordinates.
    var placesService = new google.maps.places.PlacesService(map);
    
    // For each element in the places array, use the places service to
    // determine the coordinates of the place and place a map marker there.
    for (var i = 0; i < places.length; i++) {
      placesService.textSearch({query: places[i]}, function(results, status) {
        // Make sure the place service successful found a location before
        // adding a map marker
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          addMarker(results[0]);
        }
      });
    }
  }
  
  // This function places a map marker at location contained in the data
  // returned from a call to the places service.
  function addMarker(placeData) {
    // Create the map marker.
    var marker = new google.maps.Marker({
      map: map,
      position: placeData.geometry.location,
      title: placeData.name
    });
    
    // Add an click event handler to the map marker.
    google.maps.event.addListener(marker, 'click', function() {
      showInfoWindow(this);
    });
    
    // Add the map marker to the observable array in the ViewModel. Because this is
    // an observable array, it works well with the asynchronous calls being made to
    // the places service. When the call completes and a marker is added to the
    // array, the ViewModel will ensure the unordered list element is updated.
    searchListViewModel.mapMarkers.push(marker);
  }
  
  // This function displays an info window for the given map marker.
  function showInfoWindow(marker) {
    // The URL for the Flickr search method. It searches Flickr for the name of the
    // location indicated by the provided map marker.
    var flickrUrl = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=48176340165d2b6fba06370ce7e21e95&format=json&jsoncallback=?&text=' + marker.getTitle() + ' columbus ohio';
    
    // Create an info window object.
    var infoWindow = new google.maps.InfoWindow({
      maxWidth: 325
    });
    
    // Make an AJAX call to Flickr to obtain photos for the map marker's location.
    $.getJSON(flickrUrl, function(data) {
      // Create an array containing the list of photos returned from Flickr
      var photos = data.photos.photo;
      
      // This array will hold random photos from the list of photos returned from Flickr
      var randomPhotos = [];
      
      // Randomly select photos from the ones obtained from Flickr
      for (var i = 0; i < 4; i++) {
        randomIndex = Math.floor(Math.random() * photos.length);
        randomPhotos.push(photos[randomIndex]);
      }
      
      // This variable holds the HTML content of the info window.
      var infoWindowContent = '<h2>' + marker.getTitle() + '</h2>';
      
      // For each randomly selected photo, add an image element to the variable
      // containing the HTML for the info window
      for (var i = 0; i < 4; i++) {
        var photoUrl = 'https://farm' + randomPhotos[i].farm + '.staticflickr.com/' +
         randomPhotos[i].server + '/' + randomPhotos[i].id + '_' + randomPhotos[i].secret + '_q.jpg';
        infoWindowContent += '<img src=' + photoUrl + '>';
      }
      
      // Add the content to the info window. Using this method to set the contents of
      // the info window works with the asynchronous nature of AJAX calls because the
      // info window contents can be changed after the info window has been displayed.
      infoWindow.setContent(infoWindowContent);
    }).error(function(jqXHR, errorString) {
      // Let the use know the AJAX call failed in the info window.
      infoWindow.setContent('<h2>' + marker.getTitle() +
        '</h2><p>Unable to retrieve photos from Flickr</p>'
      );
    });
    
    // Display the info window for the map marker
    infoWindow.open(map, marker);
  }
  
  // This object is returned by this immediately-invoked function expression.
  return {
    // The init function is used to draw the map and map markers
    init: function() {
      drawMap();
      addPlaces();
    },
    
    // An external reference to the showInfoWindow function is provided so it can
    // be called from the ViewModel.
    showInfoWindow: showInfoWindow,
  };
})();

// The ViewModel class contains the logic for the search and list portion of the
// application.
var ViewModel = function() {
  // Save a reference to this for later use.
  var self = this;
  
  // Create an observable for the contents of the search input.
  self.searchTerm = ko.observable('');
  // Create an observable array to hold the map markers
  self.mapMarkers = ko.observableArray();

  // This computed observable is used to populate the unordered list element.
  // It uses filters the map markers observable array with the search input.
  self.filteredMapMarkers = ko.computed(function() {
    // Return an array of the filtered map markers. The filter method of the
    // array containing the map markers is used to filter the map markers.
    return self.mapMarkers().filter(function(marker) {
      // The filter function will return any map marker that contains the
      // text in the search input in its title.
      if (marker.title.toLowerCase().indexOf(self.searchTerm().toLowerCase()) > -1) {
        marker.setVisible(true)
        return true;
      } else {
        marker.setVisible(false);
        return false;
      }
    });
  });
  
  // This function is the click event handler for place list elements.
  self.selectMapMarker = function() {
    var marker = this;
    // Start the bounce animation for the map marker
    marker.setAnimation(google.maps.Animation.BOUNCE);
    // Stop the bounce animation for the map marker after 3 seconds.
    setTimeout(function() {
      marker.setAnimation(null);
    }, 3000);
    // Use the showInfoWindow method of the mapView object to display the info window.
    mapView.showInfoWindow(marker);
  };
};

// Instantiate the ViewModel class
var searchListViewModel = new ViewModel();

window.onload = function() {
  mapView.init();
  ko.applyBindings(searchListViewModel);
};