"use strict";

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

function Location(request, geoData) {
  this.searchQuery = request;
  this.formatted_address = geoData.results[0].formatted_address;
  this.latitude = Number(geoData.results[0].geometry.location.lat);
  this.longitude = Number(geoData.results[0].geometry.location.lng);
}

function Forecast(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0, 15);
 }

app.use(express.static("./public"));
app.use(cors());

app.get("/location", (request, response) => {
  try {
    const geo = require("./data/geo.json");
      console.log(request.query.data);
    const blob = new Location(request.query.data, geo);
      console.log(blob);
    response.send(blob);
      } catch(error){
        console.log('There was an error!');
        response.status(500).send('Server down');
    }
});

app.get("/weather", (request, response) => {
  try {
    const weatherData = require("./data/darksky.json");
    const dailyWeather = Object.values(weatherData.daily.data);
    const blob = dailyWeather.map(day => new Forecast(day));
    console.log(day)
    console.log(blob);
    response.send(blob);
  } catch(error){
    console.log('There was an error!');
    response.status(500).send('Server down');
}
 });


app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
