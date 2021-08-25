const fs = require('fs')
const path = require('path');
const fetch = require('node-fetch')
const config = JSON.parse(fs.readFileSync('config.json'));
const express = require('express');
const app = express();

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/display', (req, res) => {
    res.send('')
})

app.listen(3000, () => console.log('Server Started: listening on port 3000'));

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

async function getTTCSubway() {
    const response = await fetch('cropped_stop_times.csv');
    const data = await response.text()
}