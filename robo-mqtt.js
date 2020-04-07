function startConnect() {
    // Generate a random client ID
    clientID = "Commander_" + parseInt(Math.random() * 100);

    // Fetch the hostname/IP address and port number from the form
    host = document.getElementById("host").value;
    port = document.getElementById("port").value;
	mqttUser = document.getElementById("user").value;
	mqttPass = document.getElementById("pass").value;

    // Print output for the user in the messages div
    document.getElementById("messages").innerHTML += '<span>Connecting to: ' + host + ' on port: ' + port + '</span><br/>';
    document.getElementById("messages").innerHTML += '<span>Using the following client value: ' + clientID + '</span><br/>';

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
    document.getElementById("messages").innerHTML += '<span>Subscribing to: ' + topic + '</span><br/>';

    // Subscribe to the requested topic
    client.subscribe(topic);
	uiConnected();
	$('[href="#controll"]').tab('show');
	
}

// Called when the client loses its connection
function onConnectionLost(responseObject) {
    document.getElementById("messages").innerHTML += '<span>ERROR: Connection lost</span><br/>';
    if (responseObject.errorCode !== 0) {
        	document.getElementById("messages").innerHTML += '<span>ERROR: ' + + responseObject.errorMessage + '</span><br/>';
    }
	uiError();
}

// Called when a message arrives
function onMessageArrived(message) {
    console.log("onMessageArrived: " + message.payloadString);
    document.getElementById("messages").innerHTML += '<span>Topic: ' + message.destinationName + '  | ' + message.payloadString + '</span><br/>';
}

// Called when the disconnection button is pressed
function startDisconnect() {
    client.disconnect();
    document.getElementById("messages").innerHTML += '<span>Disconnected</span><br/>';
	uiInactive();

}

function mqttFailure(){
	document.getElementById("messages").innerHTML += '<span>ERROR: Connection  failed.</span><br/>';
	uiError();
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