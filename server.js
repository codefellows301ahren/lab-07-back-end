'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require(`superagent`)
const pg = require('pg')

const app = express();
const PORT = process.env.PORT || 3000;

let currentLoc = null;

// database setup
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

function Location(request, geoData) {
  this.search_query = request;
  this.formatted_address = geoData.body.results[0].formatted_address;
  this.latitude = Number(geoData.body.results[0].geometry.location.lat);
  this.longitude = Number(geoData.body.results[0].geometry.location.lng);
}

function EventData(request){
  this.link = request.url
  this.name = request.name.text
  this.event_date = request.start.local
  this.summary = request.summary
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
      currentLoc = new Location(query, res);
      return currentLoc;
    })
}

function darkskyWeather(lat, lon){
  // console.log('Getting Dark!!!')
  const url = `https://api.darksky.net/forecast/${process.env.DARK_SKY}/${lat},${lon}`;
  const weatherSummaries =[];
  return superagent.get(url)
    .then(res => {
      res.body.daily.data.forEach(day => {
        weatherSummaries.push(new Forecast(day));
        console.log(weatherSummaries)
        // console.log('finish Dark!!!')
      });
      return weatherSummaries;
    });
}
function getEvent(request, response){
  console.log('Getting Events!!!')
  const url = `https://www.eventbriteapi.com/v3/events/search?token=${process.env.EVENT_BRIGHT_API}&location.address=${request.query.data.search_query}`;
  console.log(request.query.data.search_query, 'im what you are looking for!!!')
  return superagent.get(url)
    .then(res =>{
      let events = res.body.events.map(data =>{
        let eventData = new EventData(data)
        return eventData
      })
      // console.log(events)
      response.send(events);
    })
}



app.use(express.static('./public'));

app.use(cors());

app.get('/location', (request, response) => {
  serchToLatLong(request.query.data)//Serch box entry
    .then(location => response.send(location));
})

app.get('/weather', (currentLoc, response) => {
  // console.log('starting');
  darkskyWeather(currentLoc.query.data.latitude, currentLoc.query.data.longitude)
    .then(weather => {
      response.send(weather);
      // console.log(`Sent Weather`)
    })
})

app.get('/events',(getEvent));


// console.log(`Sent Events`)

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
