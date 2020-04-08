function startConnect() {
  // Generate a random client ID
  clientID = "Commander_" + parseInt(Math.random() * 100);

  // Fetch the hostname/IP address and port number from the form
  host = document.getElementById("host").value;
  port = document.getElementById("port").value;
  mqttUser = document.getElementById("user").value;
  mqttPass = document.getElementById("pass").value;
  robotNumber = Number(document.getElementById("robot").value);

  // Print output for the user in the messages div
  //document.getElementById("messages").innerHTML += '<span>Connecting to: ' + host + ' on port: ' + port + '</span><br/>';
  //document.getElementById("messages").innerHTML += '<span>Using the following client value: ' + clientID + '</span><br/>';


  printMessage('New Connection', host + '<br /> on port: ' + port + ' Using the following client value: ' + clientID,'connection');
  // Initialize new Paho client connection
  client = new Paho.MQTT.Client(host, Number(port), clientID);

  // Set callback handlers
  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived;

  client.connect({
    onSuccess: onConnect,
    userName: mqttUser,
    password: mqttPass,
    onFailure: mqttFailure
  });
}


// Called when the client connects
function onConnect() {
  // Fetch the MQTT topic from the form
  topic = "/zumobot/" + String(robotNumber) + "/telemetry";

  // Print output for the user in the messages div
  //document.getElementById("messages").innerHTML += '<span>Subscribing to: ' + topic + '</span><br/>';
  printMessage('Subscribing to Topic', topic ,'mqtt');

  // Subscribe to the requested topic
  client.subscribe(topic);
  uiConnected();
  $('[href="#control"]').tab('show');

}

// Called when the client loses its connection
function onConnectionLost(responseObject) {
  //document.getElementById("messages").innerHTML += '<span>ERROR: Connection lost</span><br/>';
  printMessage('Connection error', responseObject.errorMessage, 'connection');
  uiError();
}

/*
Topics.

we want to recieve all the sensors.
We want to send commands to the robot.

drive command, drive x encoder ticks? arcs? velocity?
advance by x ticks.
on/off, timed.

/zumobot/#/drive/position
[-45,33] l motor back by 45 ticks r motor f by 33

/zumobot/#/drive/velocity
[-100,100,3000] l motor reverse speed 100 r motor forward 100 for 3000ms


/zumobot/#/telemetry
Telemetry Packet. Sensor values.

array style
[lineLeftSensor,lineMiddleSensor,lineRightSensor,
proxFrontLeftSensor,proxFrontRightSensor,proxLeftSensor,proxRightSensor,
encoderRightCount,encoderLeftCount,
buttonA,buttonB,buttonC]

[10,10,10,5,5,5,5,432,545,1,1,0]

object style

lls,lms,lrs,
pfls,pfrs,pls,prs
erc,elc
ba,bb,bc

{'lls':10,'lms':10,'lrs':10,
 'pfls':5,'pfrs':5,'pls':5,'prs':5,
 'erc':432,'erc':545,
 'ba':1,'bb':1,'bc':0
}




*/



// Called when a message arrives
function onMessageArrived(message) {
  console.log("onMessageArrived: " + message.payloadString);
  //document.getElementById("messages").innerHTML += '<span>Topic: ' + message.destinationName + '  | ' + message.payloadString + '</span><br/>';
  printMessage( message.destinationName,  message.payloadString , 'mqtt');
  robotNumber = 1;
  if (message.destinationName == "/zumobot/" + String(robotNumber) + "/telemetry") {
    var sensorData = JSON.parse(message.payloadString);
    updateHud("lineLeftSensor", sensorData[0])
    updateHud("lineMiddleSensor", sensorData[1])
    updateHud("lineRightSensor", sensorData[2])

    updateHud("proxFrontLeftSensor", sensorData[3])
    updateHud("proxFrontRightSensor", sensorData[4])
    updateHud("proxLeftSensor", sensorData[5])
    updateHud("proxRightSensor", sensorData[6])

    updateHud("encoderRightCount", sensorData[7])
    updateHud("encoderLeftCount", sensorData[8])

    //updateHud("",sensorData[0])  // button a
    //updateHud("",sensorData[0])  // button b
    //updateHud("",sensorData[0])  // button c

    //updateHud("",sensorData[0])  // battery
  }


}

// Called when the disconnection button is pressed
function startDisconnect() {
  client.disconnect();
  document.getElementById("messages").innerHTML += '<span>Disconnected</span><br/>';
  printMessage('Disconnected', 'Disconnecting from server', 'connection');
  uiInactive();

}

function mqttFailure() {
  printMessage('Connection Error', 'Connection  failed', 'connection');
  //document.getElementById("messages").innerHTML += '<span>ERROR: Connection  failed.</span><br/>';
  uiError();
}

function printMessage(title, message, type = "") {
  switch (type) {
    case "info":
      msgImage = "info.jpg";
      break;
    case "mqtt":
      msgImage = "mqtt.jpg";
      break;
    case "connection":
      msgImage = "connection.png";
      break;
    default:
      msgImage = "grey-square.jpg";
      break;

  }

  var message = `
  <div class="item">
    <img class="ui avatar image" src="images/${msgImage}">
    <div class="content">
      <a class="header">${title}</a>
      <div class="description">${message}</div>
    </div>
  </div>
  `;
  document.getElementById("messages").innerHTML = message + document.getElementById("messages").innerHTML;
}


function updateHud(sensor, value) {
  robosvg = document.getElementById('svg-robot').contentDocument;
  ui_elem = robosvg.getElementById(sensor)
  switch (sensor) {
    // Line Sensor Circles

    case "lineLeftSensor":
    case "lineMiddleSensor":
    case "lineRightSensor":
      val = map(Number(value), 0, 255, 1, 10);
      ui_elem.setAttribute('r', val);
      break;
    case "proxFrontLeftSensor":
    case "proxFrontRightSensor":
    case "proxLeftSensor":
    case "proxRightSensor":
      console.info(sensor + 'Gradient');
      ui_elem = robosvg.getElementById(sensor + 'Gradient');
      val = map(Number(value), 0, 255, 10, 60);
      ui_elem.setAttribute('r', val);
      break;
    case "encoderRightCount":
    case "encoderLeftCount":
      r = ui_elem.getElementsByTagName("tspan")[0];
      r.innerHTML = value;
      break;
  }
}

function uiConnected() {
  $("#connection-error").hide();
  $("#connection-success").show();
  $("#button-connect").show();
  $("#button-disconnect").hide();
}

function uiError() {
  $("#connection-error").show();
  $("#connection-success").hide();
  $("#button-connect").show();
  $("#button-disconnect").hide();
}


function uiInactive() {
  $("#connection-error").hide();
  $("#connection-success").hide();
  $("#button-connect").show();
  $("#button-disconnect").hide();
}

function map(x, in_min, in_max, out_min, out_max) {
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
