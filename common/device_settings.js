import me from "appbit"
import * as fs from "fs"
import * as messaging from "messaging"

const SETTINGS_TYPE = "cbor"
const SETTINGS_FILE = "settings.cbor"

let settings, onsettingschange = null;

export function initialize(callback) {
    settings = loadSettings()
    onsettingschange = callback
    onsettingschange(settings)
}

messaging.peerSocket.addEventListener("message", function (evt) {
    settings[evt.data.key] = evt.data.value
    onsettingschange(settings)
})

me.addEventListener("unload", saveSettings) // Register for the unload event

function loadSettings() {
    try {
        return fs.readFileSync(SETTINGS_FILE, SETTINGS_TYPE)
    } catch (ex) {
        return {}
    }
}

function saveSettings() {
    fs.writeFileSync(SETTINGS_FILE, settings, SETTINGS_TYPE)
}