'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require(`superagent`)
const app = express();
const PORT = process.env.PORT || 3000;

function Location(request, geoData) {
  this.search_query = request;
  this.formatted_address = geoData.body.results[0].formatted_address;
  this.latitude = Number(geoData.body.results[0].geometry.location.lat);
  this.longitude = Number(geoData.body.results[0].geometry.location.lng);
}

function Forecast(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0, 15);
}

// function searchToLatLong(request, response) {
//   const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${request.query.data}&key=${process.env.GEOCODE_API_KEY}`;

function serchToLatLong(query){
  const url =`https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;
  return superagent.get(url)
    .then(res => {
      return new Location(query, res);

    })

}

app.use(express.static('./public'));
app.use(cors());

app.get('/location', (request, response) => {
  serchToLatLong(request.query.data)//Serch box entry
    .then(location => response.send(location));
})
// // app.get(`/location`, searchToLatLong);

// app.get('/location', (request, response) => {
//   // try {
//     const geo = require('./data/geo.json');
//     console.log(request.query.data);
//     const blob = new Location(request.query.data, geo);
//     console.log(blob);
//     response.send(blob);
//   } catch (error) {
//     handleError(error);
//   }
// });

app.get('/weather', (request, response) => {
  try {
    const weatherData = require('./data/darksky.json');
    const dailyWeather = Object.values(weatherData.daily.data);
    const blob = dailyWeather.map(day => new Forecast(day));
    console.log(blob);
    response.send(blob);
  } catch (error) {
    handleError(error);
  }
});





app.use('*', (request, response) =>
  response.send('Sorry, that route does not exist.')
);

function handleError(err, response) {
  console.error(err);
  if (response) {
    response.status(500).send('Sorry, something went wrong here.');
  }
}

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
