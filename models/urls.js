'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const baseUrl = 'https://daynil-urlst.herokuapp.com/';

let Url = new Schema(
	{ originalUrl: String },
	{ newUrl: String }	
);

let Urls = mongoose.model('Url', Url);

let newUrl = (urlString) => {
	
}