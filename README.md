# openlayers-map-directory
OpenStreetMap OpenLayers map with directory. Import entries from a local json file.

Use Openstreetmap to display a map with clickable markers, points are generated from a json files stored in the same dir.<br/>
If you need more information to display, you can add a "More info" record in json file.<br/>
Json file is in french, I'm sorry I don't want to bother to translate each time I make an update. I hope you'll understand easily.<br/>
Change properties names to your needs in json file and edit your js code to reflect properties names.<br/>

There is some interaction feedback : entry is highlighted when you click on a marker and an entry.

Javascript base library used : OpenLayers (v10.3.1)<br/>
OpenLayers : https://openlayers.org/

OpenLayers plugins : ol-popup<br/>
https://github.com/walkermatt/ol-popup
https://developers.arcgis.com/openlayers/layers/display-a-popup/

Use OSM tiles or download custom openstreetmaps tiles and store them on your web server.

# Files used :

tiles (in case you want to use your tiles) : folder where custom tiles are stored<br />
index.html<br />
app.js<br />
jquery-latest.min.js<br />
ol.js<br />
ol.js.map<br />
ol-popup.js<br />
app.css<br />
ol.css<br />
ol-popup.css<br />
infos.json : example json file<br />

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

2) Create a json file to store entries and put it on the same dir.<br/>
Sample : see infos.json<br/>
json properties names are in french but you'll understand easily.<br/>
Change these names to your needs, don't forget to change js code accordingly.

3) If you need a "More info" text, you can set it in json file by adding a "autres_plus_texte" property.
Eg :
```
"autres_plus_texte": "Other infos<br><br>block longerblablabla<br><br>dfdfdsfsdff  sdfsff s<br><br><a target=\"_blank\" href=\"https://google.fr\">Link</a>"
```

4) Play with it.<br/>
Launch https://example/index.html<br/>
Click on markers on map and entries on the right panel.
