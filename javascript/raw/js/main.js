var baseUrl = window.location.protocol + '//' + window.location.hostname;
if(window.location.port.length) {
    baseUrl += ':' + window.location.port;
}
var apiPath = '/api/1/';
var accessToken;
var currentVehicle;

/* Ajax Request */
function makeRequest(endpoint, callback, params, isPost) {
    var httpRequest = new XMLHttpRequest();

    function readyStateChange() {
        if (this.readyState === XMLHttpRequest.DONE) {
            if (this.status === 200) {
                xhrSuccess.call(this, callback)
            } else {
                xhrError(this);
            }
        }
    }

    httpRequest.onreadystatechange = readyStateChange.bind(httpRequest);

    var url = baseUrl + endpoint;

    var method = 'GET';
    if (isPost) {
        method = 'POST';
    }

    httpRequest.open(method, url, true);

    var parameterString;

    if (params) {
        parameterString = '';
        for (var p in params) {
            parameterString = parameterString + p + '=' + params[p] + '&';
        }
    }


    if (isPost) {
        httpRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    }
    if (accessToken) {
        httpRequest.setRequestHeader("Authorization", "Bearer {" + accessToken + "}");
    }

    httpRequest.send(parameterString);
}

function xhrSuccess(callback) {
    try {
        var data = JSON.parse(this.responseText);
        callback(data);
    } catch (e) {
        addMessage('Error parsing response from server - check console ', 'error');
        console.log('Error parsing response ', e, this.responseText, this)
    }
}

function xhrError(request) {
    addMessage('request error  - check console ', 'error');
    console.error('request error: ', request);
}

/* API "Commands" */
function login() {
    var email = document.getElementsByName('email')[0].value;

    if (!email || !email.length) {
        alert('Need to set an email address / username!');
        return;
    }

    var params = {
        grant_type: 'password',
        client_id: 'abc',
        client_secret: 123,
        email: email,
        password: 'testing'
    }

    function loginSuccess(data) {
        accessToken = data.access_token;
        addMessage('loginSuccess! Access Token is: "' + accessToken + '"');

        document.querySelector('#list-vehicles-button').disabled = false;
    }

    makeRequest('/oauth/token', loginSuccess, params, true);
}

function listVehicles() {
    var url = apiPath + 'vehicles';

    makeRequest(url, function success(data) {
        addVehiclesToList(data.response);
    });
}

function sendCommand(command) {
    if (!currentVehicle || -1 === currentVehicle) {
        alert('Please choose a vehicle');
        return;
    }

    function commandSuccess(data) {
        addMessage(command + ' success!');
        console.log('commandSuccess data? ', data);
    }

    var url = apiPath + 'vehicles/' + currentVehicle + '/command/' + command;
    makeRequest(url, commandSuccess, null, true);
}



function getInfo(command) {
    if (!currentVehicle || -1 === currentVehicle) {
        alert('Please choose a vehicle');
        return;
    }

    function getSuccess(data) {
        addMessage(command + ' success!');
        console.log('getSuccess data? ', data);
    }

    var url = apiPath + 'vehicles/' + currentVehicle + '/data_request/' + command;
    makeRequest(url, getSuccess);
}

/* Populate the select box with a list of vehicles */
function addVehiclesToList(vehicles) {
    var list = document.querySelector('#vehicle-list');
    list.disabled = true;

    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }

    if (!vehicles.length) {
        addMessage('No vehicles to add to the list!', 'error');
        return;
    }
    //Add a dummy vehicle to the list.
    addVehicle(list, 'Please select', -1);

    for (var i = 0; i < vehicles.length; i++) {
        addVehicle(list, vehicles[i].display_name, vehicles[i].vehicle_id);
    }
    addMessage('Added ' + vehicles.length + ' cars to the list');

    list.disabled = false;
}

function addVehicle(list, name, value) {
    var option = document.createElement('option');

    option.setAttribute('value', value);
    var textNode = document.createTextNode(name);
    option.appendChild(textNode);
    list.appendChild(option);
}

function selectVehicle() {
    currentVehicle = document.querySelector('#vehicle-list').value;
    var disabled = !currentVehicle && -1 === currentVehicle;

    var buttons = document.querySelectorAll('button.action');

    for (var i = 0; i < buttons.length; ++i) {
        buttons[i].disabled = disabled;
    }
}


function addMessage(message, type) {
    var li = document.createElement('li');
    var classAttr = 'message-item';

    if (type) {
        classAttr += ' message-' + type;
    }

    li.setAttribute('class', classAttr);
    var textNode = document.createTextNode(message);
    li.appendChild(textNode);

    document.getElementById('messages').appendChild(li);
}
