function initMap() {
  var coordinatesMap = {lat: 59.939856, lng: 30.323037},

      coordinatesMarker = {lat: 59.938856, lng: 30.323037},

      map = new google.maps.Map(document.getElementById("map"), {
          center: coordinatesMap,
          zoom: 15,
          disableDefaultUI: true,
      });

      marker = new google.maps.Marker({
          position: coordinatesMarker,
          map: map,
          icon: "img/icon-map-pin.svg",
          animation: google.maps.Animation.BOUNCE
      });

      marker.addListener('click', toggleBounce);

      function toggleBounce() {
          if (marker.getAnimation() !== null) {
              marker.setAnimation(null);
          } else {
              marker.setAnimation(google.maps.Animation.BOUNCE);
          }
   }
};

function hello() {};
