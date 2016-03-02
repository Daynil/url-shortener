'use strict';
const express = require('express');
const app = express();
const path = require('path');
const validUrl = require('valid-url');
const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.connect('mongodb://daynil:d49nDcm%bYO%$d8C@ds019688.mlab.com:19688/urlshortenerservice');

let urlSchema = new mongoose.Schema({
	 originalUrl: String,
	 newUrl: String 
});

let Url = mongoose.model('Url', urlSchema); // Collection name is automatically urls - optional param to specify manually

function generateShortenedUrl(protocol, host) {
	let randInt = Math.floor(Math.random()*10000);
	return protocol + '://' + host + '/' + randInt;
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
	let originalUrl = req.params[0];  // Capture entered url
	if (!validUrl.isUri(originalUrl)) {
		res.status(400).json({ 'error': originalUrl + ' is not a valid url!' });
		return;
	}
	// Look for an existing shortened url for the requested URL and return it if exists
	Url.findOne({ originalUrl: originalUrl })
		.exec()
		.then(existingUrl => {
			if (existingUrl != null) res.status(200).json({ 'original_url': existingUrl.originalUrl, 
																 'new_url': existingUrl.newUrl });
			else addShortenedUrl(originalUrl, req, res);
		})
		.catch(e => res.status(500).json({ 'error': 'Server error' }));
});

app.get(/(.+)/, (req, res) => {
	let testUrl = req.protocol + '://' + req.headers.host + req.params[0];
	Url.findOne({ newUrl: testUrl })
		.exec()
		.then(url => {
			if (url == null) res.status(404).json({ 'error': 'No short url found for the given input' });
			else res.redirect(url.originalUrl);
		})
		.catch(e => res.status(500).json({ 'error': 'Server error' }));
});

let port = process.env.PORT || 3000;
app.listen(port, () => console.log('Listening on port ' + port + '...'));
