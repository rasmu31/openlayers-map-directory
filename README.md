# openlayers-map-directory
OpenStreetMap OpenLayers map with directory. Import entries from a local json file.

Use Openstreetmap to display a map with clickable markers generated by a json file from your computer.<br/>
The goal is to not store json file on webserver but to use a local file and open it with your browser with JS FileReader().

Javascript base library used : OpenLayers (v10.3.1)<br/>
OpenLayers : https://openlayers.org/

OpenLayers plugins : ol-popup<br/>
https://github.com/walkermatt/ol-popup
https://developers.arcgis.com/openlayers/layers/display-a-popup/

Use OSM tiles or download custom openstreetmaps tiles and store them on your web server.

# Files used :

tiles : folder where custom tiles are stored<br />
index.html<br />
app.js<br />
jquery-latest.min.js<br />
ol.js<br />
ol.js.map<br />
ol-popup.js<br />
app.css<br />
ol.css<br />
ol-popup.css<br />
infos.json : example file to import<br />

# Quick overview :

1) Use OSM world map or generate custom map and store tiles on your webserver<br/>

- Use OSM world map :<br/>
```
var newLayer = new ol.layer.Tile({
	source: new ol.source.OSM({}),
	zIndex: 10,
});
```

- Use custom OSM tiles stored on your webserver<br/>

How to download OSM tiles ? I'm using maperitive http://maperitive.net/

Commands used :<br/>
set-geo-bounds -6,42,9,52<br/>
generate-tiles minzoom=5 maxzoom=8<br/>

Get maperitive tiles directory and copy it to your webserver.

```
var newLayer = new ol.layer.Tile({
	source: new ol.source.OSM({
			url: 'tiles/{z}/{x}/{y}.png'
	}),
	zIndex: 10,
});
```

2) Create a json file to import entries and store it on your computer.<br/>
Sample : see infos.json

3) Play with it.<br/>
Upload all files and custom tiles if needed to your web server.<br/>
Launch https://example/index.html<br/>
Click on import button and choose infos.json file<br/>
You'll be able to click on markers on map and on names on the right panel that will show a tooltip.
