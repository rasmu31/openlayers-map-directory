$(document).ready(function() {
	var newLayer = new ol.layer.Tile({
		source: new ol.source.OSM({
				url: 'tiles/{z}/{x}/{y}.png'
		}),
		zIndex: 10,
	});

	var map = new ol.Map({
		layers: [newLayer],
		controls: ol.control.defaults.defaults({zoom: true}),
		target: 'map',
		view: new ol.View({
			center: ol.proj.transform([2.2936148185068854, 46.574690465180474], 'EPSG:4326', 'EPSG:3857'),
			zoom: 6,
			minZoom: 5,
			maxZoom: 8
		})
	});		
	
	// Style your features
	var pointStyle = new ol.style.Style({
		image: new ol.style.Circle({
			radius: 6,
			fill: new ol.style.Fill({color: [223, 107, 22]}),
			stroke: new ol.style.Stroke({
				color: [223, 107, 22], width: 2
			})
		})
	});
	
	const popup = new Popup();
	map.addOverlay(popup);
	
	var peopleLayer = new ol.layer.Vector({
		style: pointStyle,
		visible: true,
		map: map,
		zIndex: 10,
	});
	
	map.on("click", (event) => {
		const trailheads = map.getFeaturesAtPixel(
			event.pixel,
			{layerFilter: (layer) => layer === peopleLayer},
			{
				hitTolerance: 0,
			},
		);
		
		// If a feature is clicked, we show a popup with his informations
		if (trailheads.length > 0) {
			var propertiesTrail = trailheads[0].getProperties();
			const name = trailheads[0].get('name');
			const address = trailheads[0].get('address');
			const phone = trailheads[0].get('phone');
			const mail = trailheads[0].get('mail');
			const others = trailheads[0].get('others');
			popup.show(event.coordinate, `<b>${name}</b></br>${address}</br>${phone}</br>${mail}</br>${others}`);

		}
		else {
			popup.hide();
		}
	});
	
	// Import json file
	const fileSelector = document.getElementById('importButton');
	fileSelector.addEventListener('change', (event) => {
		var json;
		const fileList = event.target.files;				
		var selectedFile = fileList[0];
		var reader = new FileReader();
		reader.onload = function (event) {
			// Load source from json file loaded					
			json = JSON.parse(reader.result);
			var vectorSource = new ol.source.Vector({
				features: new ol.format.GeoJSON().readFeatures(json,{
					featureProjection: 'EPSG:3857'
				})
			}); 
			
			peopleLayer.setSource(vectorSource);
			$('.infoItem').remove();
			
			// Populate infos panel from json file
			for (let i = 0; i < json.features.length; i++) {
				$('#listInfos').append('<div class="infoItem"><a class="name" id="' + json.features[i].id + '" href="#">' + json.features[i].properties.name + "</a><br>" +
				json.features[i].properties.address + "<br>" + json.features[i].properties.phone + "<br>" + json.features[i].properties.mail + "<br>" +
				json.features[i].properties.others +
				'</div><br>');
			}
			
			// Or use https://gis.stackexchange.com/questions/345426/simulate-click-to-map-on-specific-coordinates-and-layer-in-openlayers
			$("a.name").click(function(event) {
				feature = vectorSource.getFeatureById(this.id);
				
				const name = feature.get('name');
				const address = feature.get('address');
				const phone = feature.get('phone');
				const mail = feature.get('mail');
				const others = feature.get('others');
				popup.show(feature.getGeometry().getCoordinates(), `<b>${name}</b></br>${address}</br>${phone}</br>${mail}</br>${others}`);
			});
		};
		
		reader.readAsText(selectedFile);
	
	});
	
});