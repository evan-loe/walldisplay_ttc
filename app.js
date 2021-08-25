const fs = require('fs')
const path = require('path');
const fetch = require('node-fetch')
const config = JSON.parse(fs.readFileSync('config.json'));
const express = require('express');
const app = express();

app.use('public', express.static(path.join(__dirname, 'static')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

app.get('/display', (req, res) => {
    res.send('')
})

app.listen(3000)



const ttc_bus_refresh_interval = 20000;
const dueNow = 15
const pictures = ["darkblueskydock.jpeg", "cityroad.jpg", "purplemountains.jpg"]

async function getWeather() {
    const data = {
        apikey: config['weatherApiKey'],
        location: [40.758, -73.9855],
        fields: ["precipitationIntensity", "precipitationType", "windSpeed", "windGust", "windDirection", "temperature", "temperatureApparent", "cloudCover", "cloudBase", "cloudCeiling", "weatherCode"],
        timesteps: ["current", "1h", "1d"]
    }

    const weather_url = `https://api.tomorrow.io/v4/timelines?${new URLSearchParams(data).toString()}`
    console.log(weather_url);
    const response = await fetch(weather_url)
    const json = await response.json();
    const currWeather = json.data.timelines.find(timeline => timeline.timestep == "current").intervals[0].values
    document.getElementById('temperature').textContent = currWeather.temperature
    document.getElementById('temperatureApparent').textContent = currWeather.temperatureApparent

    console.log(currWeather);
}

function createDiv(text) {
    let div = document.createElement("div");
    div.textContent = text;
    return div
}

function changeBusTimeText(bus_time_table, index, seconds) {

    const minute = (Math.floor(seconds / 60) > 0 ? `${Math.floor(seconds/60)} m ` : "")
    const time_text = (seconds > dueNow ? `${minute}${seconds - Math.floor(seconds/60)*60} s ` : "Due Now")
    if (bus_time_table.childNodes.length > index) {
        var div = bus_time_table.childNodes[index]
        div.textContent = time_text
    } else {
        var div = createDiv(time_text)
        bus_time_table.appendChild(div)
    }
    div.setAttribute("seconds", seconds)
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getTTCBus() {
    const pred_data = {
        command: "predictions",
        a: "ttc",
        stopId: "15536"
    }
    const route_ttc_url = `https://retro.umoiq.com/service/publicXMLFeed?${new URLSearchParams(pred_data).toString()}`

    const ttc_url = `https://retro.umoiq.com/service/publicXMLFeed?${new URLSearchParams(pred_data).toString()}`
    console.log(ttc_url)
    const response = await fetch(ttc_url);
    console.log(`XML Response: ${response.status} ${response.statusText}`);
    const bus_xml = new window.DOMParser().parseFromString(await response.text(), "text/xml");
    if (bus_xml.getElementsByTagName('Error').length != 0) {
        console.log(`Error: ${bus_xml.getElementsByTagName('Error')[0].textContent}`)
        return
    }

    document.getElementById('stop-name').textContent = bus_xml.getElementsByTagName("predictions")[0].getAttribute("stopTitle")
    document.getElementById('route-name').textContent = bus_xml.getElementsByTagName("direction")[0].getAttribute("title").replace("North - ", "").replace("South - ", "").replace("East - ", "").replace("West - ", "")

    const bus_time_table = document.getElementById('bus-times');
    bus_time_table.innerHTML = ''
    const predictions = bus_xml.getElementsByTagName("prediction")
    for (let index = 0; index < predictions.length; index++) {
        const prediction = predictions[index]
        changeBusTimeText(bus_time_table, index, parseInt(prediction.getAttribute("seconds")))
    }

    for (let j = 1; j <= ttc_bus_refresh_interval / 1000; j++) {
        for (var index = 0; index < parseInt(bus_time_table.childNodes.length); index++) {
            const time_div = bus_time_table.childNodes[index]
            changeBusTimeText(bus_time_table, index, parseInt(time_div.getAttribute("seconds") - 1))
        }
        await sleep(995);
    }
}

async function getTTCSubway() {
    const response = await fetch('cropped_stop_times.csv');
    const data = await response.text()
}

async function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function startImageTransition() {

    var top = -5;
    let curr_image = document.getElementById('background-img-top');
    let old_image = document.getElementById('background-img-back');
    curr_image.childNodes[0].style.opacity = 1;
    old_image.childNodes[0].style.opacity = 1;

    setInterval(changeBackgroundImage, 10000);

    async function changeBackgroundImage() {

        curr_image.style.zIndex = top + 1;
        await sleep(300);
        old_image.style.zIndex = top;
        await sleep(300);

        old_image.src = `static/backgrounds/${pictures[Math.floor(Math.random() * pictures.length)]}`;

        console.log(document.getElementById('background-img-back').childNodes[0].src)

        await transition(curr_image);
        await sleep(300);
        curr_image.style.zIndex = top - 2;
        await sleep(300);
        curr_image.childNodes[0].style.opacity = 1;
        // switch curr and old image
        [curr_image, old_image] = [old_image, curr_image];
    }

    function transition(image) {
        return new Promise(function(resolve, reject) {

            var del = 0.01;
            var id = setInterval(changeOpacity, 10);

            function changeOpacity() {
                image.childNodes[0].style.opacity -= del;
                if (image.childNodes[0].style.opacity <= 0) {
                    clearInterval(id);
                    resolve();
                }
            }


        })
    }


}



// getWeather()
// setInterval(getWeather, 3600000);
// getTTCBus();
// setInterval(getTTCBus, ttc_bus_refresh_interval);
// startImageTransition()