import { vibration } from "haptics";
import clock from "clock";
import * as document from "document";
import { HeartRateSensor } from "heart-rate";
import { me as appbit } from "appbit";
import { today } from "user-activity";
import * as DM_Settings from "../common/device_settings.js";

// Tick every second
clock.granularity = "seconds";

let now = new Date();

const hour = document.getElementById("hour");
const minute = document.getElementById("minute");
const date_month = document.getElementById("date_month");
const week_day = document.getElementById("day_of_week");
const second = document.getElementById("second");
const am_pm = document.getElementById("am_pm");

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Nov", "Dec"];
const week_days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const prependZero = (number) => {
    return number < 10 ? "0" + number : number;
};

const tmFormat = {
    clockDisplay: "12h"
};

clock.addEventListener("tick", (evt) => {
    // log the preferences object
    now = new Date();
    const hours = tmFormat.clockDisplay === "12h" ? now.getHours() % 12 || 12 : now.getHours();
    const minutes = now.getMinutes();
    const month = now.getMonth();
    const date = now.getDate();
    const day = now.getDay();
    const seconds = now.getSeconds();

    hour.text = prependZero(hours);
    minute.text = prependZero(minutes);
    date_month.text = months[month] + "." + date;
    week_day.text = week_days[day - 1];
    second.text = prependZero(seconds);

    if (tmFormat.clockDisplay === "12h") {
        am_pm.text = now.getHours() >= 12 ? "PM" : "AM";
    } else {
        am_pm.text = "";
    }
});

const heart_rate = document.getElementById("heart_rate");
if (HeartRateSensor) {
    const hrm = new HeartRateSensor({ frequency: 1 });
    hrm.addEventListener("reading", () => {
        heart_rate.text = hrm.heartRate;
    });
    hrm.start();
} else {
    heart_rate.text = "N/A";
}

if (appbit.permissions.granted("access_activity")) {
    const steps = today.adjusted.steps;
    const steps_text = document.getElementById("steps");
    steps_text.text = steps;
}

let timer = null;
let settingsCallback = (settings) => {
    if (settings.toggleVibrate) {
        setInterval(() => {
            vibration.start("ring");
            timer && clearTimeout(timer);
            timer = setTimeout(() => {
                vibration.stop();
            }, 1500); // 1.5 seconds
        }, 300000); // 5 minutes
    }
    if (!settings.toggleVibrate) {
        timer && clearTimeout(timer);
        vibration.stop();
    }

    for (const key of Object.keys(settings)) {
        console.log("key: " + key + ", value: " + settings[key]);
    }
    if (settings.tmformat) {
        tmFormat.clockDisplay = "24h"
    }

    if (!settings.tmformat) {
        tmFormat.clockDisplay = "12h"
    }

    if (settings.weather) {
        const weather = settings.weather;
        const weather_text = document.getElementById("weather");
        weather_text.text = weather.temperature + "°" + weather.unit.substring(0, 1).toUpperCase();

        // if day time show sun, if night show moon
        const sun = document.getElementById("daytime");
        const moon = document.getElementById("night");
        const hours = now.getHours();
        if (hours >= 6 && hours <= 18) {
            sun.style.display = "inline";
            moon.style.display = "none";
        } else {
            moon.style.display = "inline";
            sun.style.display = "none";
        }
    }
};

DM_Settings.initialize(settingsCallback);