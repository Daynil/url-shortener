'use strict';
const express = require('express');
const app = express();
const path = require('path');
const morgan = require('morgan');

app.use(morgan('dev'));
let pathname = path.join(process.cwd());
app.use( express.static(pathname) );

app.get('/new/:originalUrl', (req, res) => {
	let originalUrl = req.params.originalUrl;
	res.status(200).json({ 'original_url': originalUrl });
});

let port = process.env.PORT || 3000;
app.listen(port, () => console.log('Listening on port ' + port + '...'));
