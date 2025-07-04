// /public/js/map.js
(function () {
  "use strict";

  // Ensure mapToken and listing are defined
  if (typeof mapToken === "undefined" || !mapToken) {
    console.error("Mapbox access token is missing");
    return;
  }
  if (typeof listing === "undefined" || !listing.geometry || !listing.geometry.coordinates) {
    console.error("Listing coordinates are missing or invalid");
    return;
  }

  // Initialize Mapbox
  mapboxgl.accessToken = mapToken;
  const map = new mapboxgl.Map({
    container: "map", // Container ID
    style: "mapbox://styles/mapbox/streets-v12", // Map style
    center: listing.geometry.coordinates, // [lng, lat]
    zoom: 9, // Starting zoom
  });

  // Add navigation controls (zoom and rotation)
  map.addControl(new mapboxgl.NavigationControl());

  // Add marker with popup
  new mapboxgl.Marker({ color: "red" })
    .setLngLat(listing.geometry.coordinates)
    .setPopup(
      new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <h5>${listing.title}</h5>
        <p>Exact location will be provided after booking</p>
      `)
    )
    .addTo(map);
})();