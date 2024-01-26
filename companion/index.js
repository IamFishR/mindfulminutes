import * as messaging from "messaging";
import { settingsStorage } from "settings";
import { me as companion } from "companion";
import weather from "weather";

settingsStorage.addEventListener("change", (evt) => {
    if (evt.oldValue !== evt.newValue) {
        // (evt.key, evt.newValue);
        if (evt.key === "temperatureUnits") {
            fetchWeather({
                temperatureUnit: JSON.parse(evt.newValue).values[0].name
            });
        }
        if (evt.key === "toggleVibrate") {
            const should_vibrate = evt.newValue;
            sendMessage(evt.key, should_vibrate);
        }

        if (evt.key === "tmformat") {
            const tmformat = evt.newValue;
            sendMessage(evt.key, tmformat);
        }
    }
});

function sendMessage(evtKey, evtNewValue) {
    if (evtNewValue) {
        sendData({
            key: evtKey,
            value: JSON.parse(evtNewValue)
        });
    }
}

function sendData(data) {
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
        // Send the data to peer as a message
        messaging.peerSocket.send(data);
    } else {
        // Wait for the connection to open and try again
        messaging.peerSocket.onopen = function () {
            messaging.peerSocket.send(data);
        }
    }
}

const fetchWeather = async (params) => {
    if (companion.permissions.granted("access_location")) {
        const temp_unit = params?.temperatureUnit ? params.temperatureUnit : JSON.parse(settingsStorage.getItem("temperatureUnits")).values[0].name;
        const TemperatureUnit = {
            Celsius: 'celsius',
            Fahrenheit: 'fahrenheit',
        };
        await weather
            .getWeatherData(
                {
                    temperatureUnit: TemperatureUnit[temp_unit]
                }
            ).then((data) => {
                if (data.locations.length > 0) {
                    const temp = Math.floor(data.locations[0].currentWeather.temperature);
                    const cond = data.locations[0].currentWeather.weatherCondition;
                    const loc = data.locations[0].name;
                    const unit = data.temperatureUnit;
                    const result = {
                        key: "weather",
                        value: {
                            temperature: temp,
                            condition: cond,
                            location: loc,
                            unit: unit
                        }
                    };
                    if (params?.type === "sendData") {
                        sendData(result);
                    } else {
                        sendMessage(result.key, JSON.stringify(result.value));
                    }
                }
            })
            .catch((ex) => {
                console.log(ex)
            });
    } else {
        console.log("Permission was denied");
    }
}

// Listen for the onopen event
messaging.peerSocket.onopen = function () {
    // Fetch weather when the connection opens
    fetchWeather({
        type: "sendData"
    });
}


// Listen for the onerror event
messaging.peerSocket.onerror = function (err) {
    // Handle any errors
    console.log("Connection error: " + err.code + " - " + err.message);
}

// wake up companion every 30 minutes
companion.wakeInterval = 1800000;

// fetch weather every 30 minutes
companion.addEventListener("wakeUp", (evt) => {
    fetchWeather();
});