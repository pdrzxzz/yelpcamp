// https://docs.mapbox.com/mapbox-gl-js/guides/install/
campground = JSON.parse(campground)

mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'showMap', // container ID
    style: 'mapbox://styles/mapbox/dark-v11', // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 8, // starting zoom
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

new mapboxgl.Marker()
.setLngLat(campground.geometry.coordinates) //set marker in campground position
.setPopup(
    new mapboxgl.Popup({offset: 15})
    .setHTML(
        `<h4>${campground.title}</h4><p>${campground.location}</p>`
    )

)
.addTo(map)