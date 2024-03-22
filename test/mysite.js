var lat, lng;
var map, marker, circle, selectedArea;

$(document).ready(function() {

    map = L.map('kaart').setView([51.687887507106325, 5.308252958385905], 16);
    //basemap toevoegen
    var Jawg_Sunny = L.tileLayer('https://tile.jawg.io/jawg-sunny/{z}/{x}/{y}{r}.png?access-token={accessToken}', {
        attribution: '<a href="https://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        minZoom: 0,
        maxZoom: 22,
        accessToken: 'ONRZ7IFoqpBoufskgRiw2PJzOPL3qjDtbiMklzPfZn0hTsspPXe6ReeGmbUufO4p'
    });
    map.addLayer(Jawg_Sunny)
        // wms bijzondere locaties
    var bijzonderLocaties = L.tileLayer.wms('https://geoserver-sb.has.nl/bo_24200009_atlas_leefomgeving/wms', {
        layers: 'bo_24200009_atlas_leefomgeving:test_locaties',
        format: 'image/png',
        transparent: true,
    });
    map.addLayer(bijzonderLocaties);

    // Get user's location
    navigator.geolocation.getCurrentPosition(success, error);

    async function success(pos) {
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
        const accuracy = pos.coords.accuracy;

        if (marker) {
            map.removeLayer(marker);
            map.removeLayer(circle);
        }

        marker = L.circleMarker([lat, lng], {
            color: '#FFFFFF',
            weight: 2,
            fillColor: '#4285F4',
            fillOpacity: 1,
        }).addTo(map);

        circle = L.circle([lat, lng], { radius: accuracy }).addTo(map);
        map.setView([lat, lng], map.getZoom());

        // Load monumenten data with user's location as viewparams
        loadMonumentenData(lat, lng);
    }

    function error(err) {
        if (err.code === 1) {
            alert("Sta toegang tot uw locatie toe");
        } else {
            alert("Kan huidige locatie niet krijgen");
        }
    }

    function loadMonumentenData(lat, lng) {
        $.ajax({
            url: 'https://geoserver-sb.has.nl/bo_24200009_atlas_leefomgeving/ows?',
            type: 'GET',
            data: {
                service: 'WFS',
                version: '1.0.0',
                request: 'GetFeature',
                maxFeatures: 50,
                typeName: 'bo_24200009_atlas_leefomgeving:activieve_locaties',
                outputFormat: 'application/json',
                viewparams: `x:${lat};y:${lng}`
            },
            success: function(data) {
                handleJson(data);
            },
            dataType: 'json'
        });
    }

    function handleJson(data) {
        if (selectedArea) {
            map.removeLayer(selectedArea);
        }

        var popup = selectedArea = L.geoJson(data, {
            onEachFeature: function(feature, layer) {
                layer.bindPopup(feature.properties.infromatie, '<object>width="10000"</object>')

            }
        }).addTo(map);

        // Get the bounding box of the monuments layer
        var bounds = selectedArea.getBounds();

        // Fit the map to the bounding box with padding (optional)

    }

});