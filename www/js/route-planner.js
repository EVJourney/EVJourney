    var map;
    var markers = [];
    var infoWindow;
    var locationSelect;
    var directionsDisplay;
    var start_lat_lng;
    var end_lat_lng;
    var infoLatLng;
    var waypts = [];
    var latitude;
    var longitude;
    var zoomLvl;
	var startGeo;
	var routePlanning;

    function initialize() {
					
    
		if (navigator.geolocation) {
			var geoTimeout = setTimeout("noGeo()", 12000);
    		navigator.geolocation.getCurrentPosition(
    			function(position) {
					clearTimeout(geoTimeout);
					latitude = position.coords.latitude;
					longitude = position.coords.longitude;
					zoomLvl = 11;
					drawMap();
				},
    			function (error) {
					clearTimeout(geoTimeout);
					noGeo();
				}, {
    				maximumAge: 20000,
    				timeout: 12000,
    				enableHighAccuracy: true
    			}
    		);
    	} else {
			clearTimeout(geoTimeout);
			noGeo();
		}
		
	

    }

	function noGeo() {
		latitude = 37.7749295;
		longitude = -122.419415;
		zoomLvl = 11;
		drawMap();
	}



  /*   function tryLowAcc(position) {
    	navigator.geolocation.getCurrentPosition(
    		getPosition, function (error) {
    			latitude = 37.7749295;
    			longitude = -122.419415;
    			zoomLvl = 4;
    			drawMap();
    		}, {
    			maximumAge: 20000,
    			timeout: 12000,
    			enableHighAccuracy: false
    		});
    	return;
    } */

    function drawMap() {
		routePlanning = false;
		$(".loading").show();
				
    	/* var url = "http://evjourney.com/EVJ-Save-Location.php?latitude=" + latitude + "&longitude=" + longitude;

    	var client = new XMLHttpRequest();

    	client.open("PUT", url, false);

    	client.setRequestHeader("Content-Type", "text/plain");

    	client.send(); */

    	var coords = new google.maps.LatLng(latitude, longitude);
		google.maps.visualRefresh = true
    	map = new google.maps.Map(document.getElementById("map_canvas"), {
    		//center: new google.maps.LatLng(33.181543, -96.870616),
    		center: coords,
    		zoom: zoomLvl,
    		mapTypeId: 'roadmap',
    		zoomControlOptions: {
    			position: google.maps.ControlPosition.LEFT_BOTTOM
    		},
    		mapTypeControl: false,
    		panControl: false,
    		streetViewControl: false,
			scaleControl: true,
    	});
		
    	infoWindow = new google.maps.InfoWindow();
		
		google.maps.event.addListener( map, 'click', function() { 
			infoWindow.close(); 
		} );

    	start_lat_lng = latitude + ',' + longitude;

    	end_lat_lng = latitude + ',' + longitude;

    	getStationsNear(latitude, longitude);

    	locationSelect = document.getElementById("locationSelect");
    	locationSelect.onchange = function () {
    		var markerNum = locationSelect.options[locationSelect.selectedIndex].value;
    		if (markerNum !== "none") {
    			google.maps.event.trigger(markers[markerNum], 'click');
    		}
    	};




    }




	function findByAddress() {
		var address = document.getElementById("findInput").value;
		var geocoder = new google.maps.Geocoder(); 
		geocoder.geocode({'address': address}, function(results, status) { 
			if (status == google.maps.GeocoderStatus.OK) {
				
				
				latitude = results[0].geometry.location.lat();
				longitude = results[0].geometry.location.lng();
				drawMap();
				
				
			} else { 
				alert(address + ' not found'); 
			} 
		}); 
	}

    function calcRoute(start_lat_lng, end_lat_lng) {

    	if (directionsDisplay != null) {
    		directionsDisplay.setMap(null);
    		directionsDisplay = null;
    	}

    	var start = start_lat_lng;

    	var end = end_lat_lng;


    	directionsService = new google.maps.DirectionsService();

    	// Create a renderer for directions and bind it to the map. 
    	var rendererOptions = {
    		map: map
    	}
    	directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions)

    	directionsDisplay.setMap(map);

    	// clear panel

    	directionsDisplay.setPanel();

    	directionsDisplay.setPanel(document.getElementById("directionsPanel"));


    	var request = {
    		origin: start,
    		destination: end,
    		waypoints: waypts,
    		optimizeWaypoints: true,
    		travelMode: google.maps.DirectionsTravelMode.DRIVING
    	};
    	directionsService.route(request, function (response, status) {

    		//alert(status);

    		if (status == google.maps.DirectionsStatus.OK) {
    			directionsDisplay.setDirections(response);
    		}
    	});


    }

    function getMarkers(start_lat_lng, end_lat_lng) {
    	clearLocations();

    	var searchUrl = 'http://evjourney.com/EVJ-Locator-CS-NREL-r.php?start=' + start_lat_lng + '&end=' + end_lat_lng;

    	downloadUrl(searchUrl, function (data) {
    		var xml = parseXml(data);
    		var markerNodes = xml.documentElement.getElementsByTagName("marker");
    		var bounds = new google.maps.LatLngBounds();
    		for (var i = 0; i < markerNodes.length; i++) {
    			var id = parseFloat(markerNodes[i].getAttribute("id"));
    			var name = markerNodes[i].getAttribute("name");
				var phone = markerNodes[i].getAttribute("phone");
				var network = markerNodes[i].getAttribute("network")
    			var address = markerNodes[i].getAttribute("address");
    			var distance = parseFloat(markerNodes[i].getAttribute("distance"));
    			var link = markerNodes[i].getAttribute("link");
    			//var link2 = markerNodes[i].getAttribute("link2"); 
    			var latlng = new google.maps.LatLng(
    				parseFloat(markerNodes[i].getAttribute("lat")),
    				parseFloat(markerNodes[i].getAttribute("lng")));
    			var fastcharge = markerNodes[i].getAttribute("fastcharge");
				var level1 = markerNodes[i].getAttribute("level1");
				var level2 = markerNodes[i].getAttribute("level2");
				var fastnum = markerNodes[i].getAttribute("fastnum"); 
				var cpstation = markerNodes[i].getAttribute("cpstation");
				var blinkid = markerNodes[i].getAttribute("blinkid");
				var details = markerNodes[i].getAttribute("details");
    			//createOption(name, distance, id); 
    			createOption(name, distance, i);
    			createMarker(latlng, name, address, phone, network, link, level1, level2, fastnum, fastcharge, cpstation, blinkid, details);
    			bounds.extend(latlng);
    		}
			$(".loading").hide();
    		// map.fitBounds(bounds); 
    		locationSelect.style.visibility = "visible";
    		locationSelect.onchange = function () {
    			var markerNum = locationSelect.options[locationSelect.selectedIndex].value;
    			google.maps.event.trigger(markers[markerNum], 'click');
    		};
    	});
    }


     ///////////////////////////////////

    function searchLocations() {
		routePlanning = true;
		if (waypts) {
			waypts = [];
		}
    	displaySearch();
	}
	
	function displaySearch() {
		
		$(".loading").show();
		var address = document.getElementById("startInput").value;


    	var geocoder = new google.maps.Geocoder();
    	geocoder.geocode({
    		address: address
    	}, function (results, status) {
    		if (status == google.maps.GeocoderStatus.OK) {
				startGeo = results[0].geometry.location;
			var address = document.getElementById("endInput").value;
			var geocoder = new google.maps.Geocoder();
			geocoder.geocode({
				address: address
			}, function (results, status) {
				if (status == google.maps.GeocoderStatus.OK) {


					searchLocationsNear(startGeo);
					searchLocationsNear(results[0].geometry.location);
					var start_lat_lng = document.getElementById("startInput").value;
					
					var end_lat_lng = document.getElementById("endInput").value;
					
					
					
					calcRoute(start_lat_lng, end_lat_lng);
					
					 getMarkers(start_lat_lng, end_lat_lng);
					
					var directions_url = "http://maps.google.com?saddr=" + encodeURIComponent(start_lat_lng) + "&daddr="
					
					if (waypts) {
						for (var i = 0; i < waypts.length; i++) {
							directions_url += encodeURIComponent(waypts[i].location) + "+to:"; //"&mrad="
						}
					}
					directions_url += encodeURIComponent(end_lat_lng);
					$(".getdirections").replaceWith($('<div class="getdirections"><a href="' + directions_url + '" target="_blank">' + "Get Directions" + '</a></div>'));

				} else {
					alert(address + ' not found');
				}
			});

    		} else {
    			alert(address + ' not found');
    		}
    	});






    

    }

    function clearLocations() {
    	infoWindow.close();
    	for (var i = 0; i < markers.length; i++) {
    		markers[i].setMap(null);
    	}
    	markers.length = 0;

    	locationSelect.innerHTML = "";
    	var option = document.createElement("option");
    	option.value = "none";
    	option.innerHTML = "Click here to see Charge Station List:";
    	locationSelect.appendChild(option);
    }

    function getStationsNear(latitude, longitude) {
    	//  clearLocations(); 

    	//alert(latitude + ',' + longitude);

    	var radius = 500;

    	var searchUrl = 'http://evjourney.com/EVJ-Locator-NREL-r.php?lat=' + latitude + '&lng=' + longitude + '&radius=' + radius; //map radius to slider
		
		downloadUrl(searchUrl, function (data) {
    		var xml = parseXml(data);
    		var markerNodes = xml.documentElement.getElementsByTagName("marker");
    		var bounds = new google.maps.LatLngBounds();
    		for (var i = 0; i < markerNodes.length; i++) {
    			var id = parseFloat(markerNodes[i].getAttribute("id"));
    			var name = markerNodes[i].getAttribute("name");
    			var address = markerNodes[i].getAttribute("address");
				var phone = markerNodes[i].getAttribute("phone");
				var network = markerNodes[i].getAttribute("network");
    			var link = markerNodes[i].getAttribute("link");
    			//var link2 = markerNodes[i].getAttribute("link2");  
    			var distance = parseFloat(markerNodes[i].getAttribute("distance"));
    			var latlng = new google.maps.LatLng(
    				parseFloat(markerNodes[i].getAttribute("lat")),
    				parseFloat(markerNodes[i].getAttribute("lng")));
    			var fastcharge = markerNodes[i].getAttribute("fastcharge");
				var level1 = markerNodes[i].getAttribute("level1");
				var level2 = markerNodes[i].getAttribute("level2");
				var fastnum = markerNodes[i].getAttribute("fastnum"); 
				var cpstation  = markerNodes[i].getAttribute("cpstation");
				var blinkid  = markerNodes[i].getAttribute("blinkid");
				var details = markerNodes[i].getAttribute("details");
    			//createOption(name, distance, id); 
    			createOption(name, distance, i);
    			createMarker(latlng, name, address, phone, network, link, level1, level2, fastnum, fastcharge, cpstation, blinkid, details);
    			//bounds.extend(latlng);

    		}
			$(".loading").hide();
    		// map.fitBounds(bounds); 
    		locationSelect.style.visibility = "visible";
    		locationSelect.onchange = function () {
    			var markerNum = locationSelect.options[locationSelect.selectedIndex].value;
    			google.maps.event.trigger(markers[markerNum], 'click');
    		};
    	});

    	//map.setZoom(15);

    	//map.setCenter(new google.maps.LatLng(latitude, longitude));
		
    }

    function searchLocationsNear(center) {
    	clearLocations();


    	var radius = 20;

    	var searchUrl = 'http://evjourney.com/EVJ-Locator-NREL-r.php?lat=' + center.lat() + '&lng=' + center.lng() + '&radius=' + radius;

    	downloadUrl(searchUrl, function (data) {
    		var xml = parseXml(data);
    		var markerNodes = xml.documentElement.getElementsByTagName("marker");
    		var bounds = new google.maps.LatLngBounds();
    		for (var i = 0; i < markerNodes.length; i++) {
    			var id = parseFloat(markerNodes[i].getAttribute("id"));
    			var name = markerNodes[i].getAttribute("name");
    			var address = markerNodes[i].getAttribute("address");
				var phone = markerNodes[i].getAttribute("phone");
				var network = markerNodes[i].getAttribute("network");
    			var link = markerNodes[i].getAttribute("link");
    			//var link2 = markerNodes[i].getAttribute("link2");  
    			var distance = parseFloat(markerNodes[i].getAttribute("distance"));
    			var latlng = new google.maps.LatLng(
    				parseFloat(markerNodes[i].getAttribute("lat")),
    				parseFloat(markerNodes[i].getAttribute("lng")));
    			var fastcharge = markerNodes[i].getAttribute("fastcharge");
				var level1 = markerNodes[i].getAttribute("level1");
				var level2 = markerNodes[i].getAttribute("level2");
				var fastnum = markerNodes[i].getAttribute("fastnum");
				var cpstation  = markerNodes[i].getAttribute("cpstation");
				var blinkid  = markerNodes[i].getAttribute("blinkid");				
				var details = markerNodes[i].getAttribute("details");
    			//createOption(name, distance, id); 
    			createOption(name, distance, i);
    			createMarker(latlng, name, address, phone, network, link, level1, level2, fastnum, fastcharge, cpstation, blinkid, details);
    			bounds.extend(latlng);
    		}
    		// map.fitBounds(bounds); 
    		locationSelect.style.visibility = "visible";
    		// locationSelect.onchange = function () {
    			// var markerNum = locationSelect.options[locationSelect.selectedIndex].value;
    			// google.maps.event.trigger(markers[markerNum], 'click');
    		// };
    	});
    }

    function createMarker(latlng, name, address, phone, network, link, level1, level2, fastnum, fastcharge, cpstation, blinkid, details) {

    	if (name == 'Your Location') {

    		var image = new google.maps.MarkerImage('location.png',

    			new google.maps.Size(25, 38),

    			// The origin for this image is 0,0.  

    			new google.maps.Point(0, 0)

    		);
    	} else if (fastcharge == 'YES') {

    		var image = new google.maps.MarkerImage('plug3.png',

    			new google.maps.Size(25, 38),

    			// The origin for this image is 0,0.  

    			new google.maps.Point(0, 0)

    		);

    	} else {

    		var image = new google.maps.MarkerImage('plug.png',

    			new google.maps.Size(25, 38),

    			// The origin for this image is 0,0.  

    			new google.maps.Point(0, 0)

    		);

    	}


    	var html = "<div class='info_header'>" + name + "</div>" 
		
		if (address != "") {
			html  += "<div class='info_sub'>Address:</div>" + address; 
		}
		if (phone != "Not Found" && phone != null) {
			html += "<div class = 'info_sub'>Phone:</div>" + phone;
		}
		if (network != "Not Found" && network != null) {
			html += "<div class = 'info_sub'>Network:</div>" + network; 
		}
		if (level1 > 0 || level2 > 0 || fastnum > 0) {
			html += "<div class = 'info_sub'>Plug types:</div>"
		if (level1 > 0) {
			 html += "<div>" + level1 + " Level 1" + "</div>"; 
		}
		if (level2 > 0) {
			html += "<div>" + level2 + " Level 2" + "</div>"; 
		}
		if (fastnum > 0) {
			html += "<div>" + fastnum + " Fast Charge" + "</div>"; 
		}
		}
		
		if (details != "") {
			html += "<div class = 'info_sub'>Details:</div><div>" + details + "</div>";
		}
		
		html += link;
		
	/* 	if (cpstation != null  || blinkid != null) */
		if (cpstation != ""  || blinkid != "")
		{
		html += "<div class='availability' onclick='availability(&quot;";
		
		if (cpstation != "" && cpstation != null)
		{
			html += $.trim(cpstation);
			html += "&quot;, &quot;cp"
		}
	 
		if (blinkid != "")
		{
			html += blinkid;
			html += "&quot;, &quot;b"
		}
		
		html += "&quot;)'>Check Availability</div>";
		}
    	// var html = link + " <b>" + name + "</b> <br/>" + address + " " + link2;

    	var marker = new google.maps.Marker({
    		map: map,
    		icon: image,
    		position: latlng,
    		zIndex: google.maps.Marker.MAX_ZINDEX + 1
    	});


    	google.maps.event.addListener(marker, 'click', function () {
    		infoWindow.setContent(html);
    		infoWindow.open(map, marker);
    		infoLatLng = marker.getPosition()
			if (!routePlanning) {
			$(".change_waypoint").hide();
			}
    	});
    	markers.push(marker);
		
    }


    function createOption(name, distance, num) {
    	var option = document.createElement("option");
    	option.value = num;
    	option.innerHTML = name + "(" + distance.toFixed(1) + ")";
    	locationSelect.appendChild(option);
    }

    function downloadUrl(url, callback) {
    	var request = window.ActiveXObject ?
    		new ActiveXObject('Microsoft.XMLHTTP') :
    		new XMLHttpRequest;

    	request.onreadystatechange = function () {
    		if (request.readyState == 4) {
    			request.onreadystatechange = doNothing;
    			callback(request.responseText, request.status);
    		}
    	};

    	request.open('GET', url, true);
    	request.send(null);
    }

    function parseXml(str) {
    	if (window.ActiveXObject) {

    		//alert('Active X Parser');

    		var doc = new ActiveXObject('Microsoft.XMLDOM');
    		doc.loadXML(str);
    		return doc;
    	} else if (window.DOMParser) {

    		//alert('DOM Parser');	

    		return (new DOMParser).parseFromString(str, 'text/xml');
    	}
    }

    function doNothing() {}

    function changeWaypoint() {
    	var ptExists = false;
    	for (var i = 0; i < waypts.length && !ptExists; i++) {
    		if (waypts[i].location.toString() === infoLatLng.toString()) {
    			waypts.splice(i, 1);
    			ptExists = true;
    		}
    	}
    	if (!ptExists) {
    		waypts.push({
    			location: infoLatLng,
    			stopover: true
    		});
    	}
    	displaySearch();


    }
	
	function availability (stationID, net){
/* 		alert(stationID);
		alert(net); */

		var searchUrl = 'http://evjourney.com/evj-status.php?station_id=' + stationID + "&net=" + net;
		/* var searchUrl = 'evj-cp-status.php?station_id=' + stationID; */

	
	/* alert('Search URL: ' + searchUrl); */

		
    	downloadUrl(searchUrl, function (data) {
    		var xml = parseXml(data);
			
    		var statusNodes = xml.documentElement.getElementsByTagName("Port");
			var statusAlert = "Status: ";
			for (var i = 0; i < statusNodes.length; i++) {
    			var port_number = statusNodes[i].getAttribute("port_number");
				/* var port_number = parseFloat(statusNodes[i].getAttribute("port_number")); */
    			var status = statusNodes[i].getAttribute("status");
				statusAlert +=  "\n" + "Port " + port_number + ": " + status;
	
    			//createOption(name, distance, id); 
    		}
		alert(statusAlert);
		});
		
		/* modal.openAvail(); */
		
		
		
	}
	
google.maps.event.addDomListener(window, 'load', initialize);