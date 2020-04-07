function startConnect() {
    // Generate a random client ID
    clientID = "Commander_" + parseInt(Math.random() * 100);

    // Fetch the hostname/IP address and port number from the form
    host = document.getElementById("host").value;
    port = document.getElementById("port").value;
	mqttUser = document.getElementById("user").value;
	mqttPass = document.getElementById("pass").value;

    // Print output for the user in the messages div
    //document.getElementById("messages").innerHTML += '<span>Connecting to: ' + host + ' on port: ' + port + '</span><br/>';
    //document.getElementById("messages").innerHTML += '<span>Using the following client value: ' + clientID + '</span><br/>';


	printMessage('Connecting to: ' + host + ' on port: ' + port + '<br/>'+'Using the following client value: ' + clientID);
    // Initialize new Paho client connection
    client = new Paho.MQTT.Client(host, Number(port), clientID);

    // Set callback handlers
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    client.connect({ 
        onSuccess: onConnect,
		userName : mqttUser,
		password : mqttPass,
        onFailure: mqttFailure 
    });
}


// Called when the client connects
function onConnect() {
    // Fetch the MQTT topic from the form
    topic = "#";

    // Print output for the user in the messages div
    //document.getElementById("messages").innerHTML += '<span>Subscribing to: ' + topic + '</span><br/>';
	printMessage('Subscribing to: ' + topic + '');

    // Subscribe to the requested topic
    client.subscribe(topic);
	uiConnected();
	$('[href="#controll"]').tab('show');
	
}

// Called when the client loses its connection
function onConnectionLost(responseObject) {
    //document.getElementById("messages").innerHTML += '<span>ERROR: Connection lost</span><br/>';
	printMessage('ERROR: Connection lost','danger');
    if (responseObject.errorCode !== 0) {
        	document.getElementById("messages").innerHTML += '<span>ERROR: ' + + responseObject.errorMessage + '</span><br/>';
    }
	uiError();
}

// Called when a message arrives
function onMessageArrived(message) {
    console.log("onMessageArrived: " + message.payloadString);
    //document.getElementById("messages").innerHTML += '<span>Topic: ' + message.destinationName + '  | ' + message.payloadString + '</span><br/>';
	printMessage('<b>Topic:</b> ' + message.destinationName + '  | ' + message.payloadString + '','success');
}

// Called when the disconnection button is pressed
function startDisconnect() {
    client.disconnect();
    document.getElementById("messages").innerHTML += '<span>Disconnected</span><br/>';
	printMessage('Disconnected','info');
	uiInactive();

}

function mqttFailure(){
	printMessage('<b>ERROR:</b> Connection  failed.','danger');
	//document.getElementById("messages").innerHTML += '<span>ERROR: Connection  failed.</span><br/>';
	uiError();
}

function printMessage(message,level="info"){
	message = "<div class=\"alert px-2 py-1 alert-"+level+"\" role=\"alert\">"+message+"</div>"
	document.getElementById("messages").innerHTML = message + document.getElementById("messages").innerHTML ;
}

function updateHud(sensor,value){
	robosvg = document.getElementById('svg-robot').contentDocument;
	ui_elem = robosvg.getElementById(sensor)
	switch (sensor){
		// Line Sensor Circles

		case "lineLeftSensor":
		case "lineMiddleSensor":
		case "lineRightSensor":
			val = map(Number(value),0,255,1,10);
			ui_elem.setAttribute('r',val);
			break;
		case "proxFrontLeftSensor":
		case "proxFrontRightSensor":
		case "proxLeftSensor":
		case "proxRightSensor":
			console.info(sensor+'Gradient');
			ui_elem = robosvg.getElementById(sensor+'Gradient');
			val = map(Number(value),0,255,10,60);
			ui_elem.setAttribute('r',val);
			break;
		case "encoderRightCount":
		case "encoderLeftCount":
			r = ui_elem.getElementsByTagName("tspan")[0];
			r.innerHTML=value;
		break;
	}
}

function uiConnected(){
	$( "#btn-connect" ).addClass("hidden");
	$( "#btn-connected" ).removeClass("hidden");
	$( "#btn-reconnect" ).addClass("hidden");
	$( "#btn-disconnect" ).removeClass("hidden");
	$( "#connfailed" ).addClass("hidden");

}

function uiError(){
	$( "#btn-connect" ).addClass("hidden");
	$( "#btn-connected" ).addClass("hidden");
	$( "#btn-reconnect" ).removeClass("hidden");
	$( "#btn-disconnect" ).addClass("hidden");
	$( "#connfailed" ).removeClass("hidden");	
}


function uiInactive(){
	$( "#btn-connect" ).removeClass("hidden");
	$( "#btn-connected" ).addClass("hidden");
	$( "#btn-reconnect" ).addClass("hidden");
	$( "#btn-disconnect" ).addClass("hidden");
	$( "#connfailed" ).addClass("hidden");		
}

function map( x,  in_min,  in_max,  out_min,  out_max) {
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}