'use strict';
const express = require('express');
const app = express();
const path = require('path');
const morgan = require('morgan');
const mongoose = require('mongoose');
const baseUrl = 'https://daynil-urlst.herokuapp.com/';
mongoose.connect('mongodb://localhost:27017/urlshortener');

let urlSchema = new mongoose.Schema({
	 originalUrl: String,
	 newUrl: String 
});

let Url = mongoose.model('Url', urlSchema); // DB name is automatically urls

function generateShortenedUrl(protocol, host) {
	let randInt = Math.floor(Math.random()*10000);
	return protocol + '://' + host + '/' + randInt;
}

function checkExisting(url) {
	return new Promise((resolve, reject) => {
		resolve(url);
	});
}

function addShortenedUrl(originalUrl, req, res) {
	let newUrl = generateShortenedUrl(req.protocol, req.headers.host);

	let urlPair = new Url({
		originalUrl: originalUrl,
		newUrl: newUrl
	});
	
	urlPair.save( (err) => {
		if (err) res.status(400).json( {'error': err} );
		else {
			res.status(200).json({ 'original_url': urlPair.originalUrl, 'new_url': urlPair.newUrl });
		}
	});
}

app.use(morgan('dev'));
let pathname = path.join(process.cwd());
app.use( express.static(pathname) );

app.get(/\/new\/(.+)/, (req, res) => {
	let originalUrl = req.params[0];
	
	// Look for an existing shortened url for the requested URL and return it if exists
	// TODO add to the then chain to check for duplicates
	let dupePromise = Url.findOne({ originalUrl: originalUrl }).exec();
	dupePromise.then(checkExisting)
			   .then(existingUrl => {
				   if (existingUrl != null) res.status(200).json({ 'original_url': existingUrl.originalUrl, 
				   														'new_url': existingUrl.newUrl });
				   else addShortenedUrl(originalUrl, req, res);
			   });
});

app.get(/(.+)/, (req, res) => {
	let testUrl = req.protocol + '://' + req.headers.host + req.params[0];
	Url.findOne({ newUrl: testUrl })
	   .exec( (err, url) => {
		   if (err) res.status(404).json({ 'error': err });
		   else {
			   if (url == null) res.status(404).json({ 'error': 'No short url found for the given input' });
			   else res.redirect(url.originalUrl);
		   }
	   });
});

let port = process.env.PORT || 3000;
app.listen(port, () => console.log('Listening on port ' + port + '...'));
