const express = require('express');
const db = require('../db');
const request = require('request');

const router = express.Router();

let currentURL = process.env.URL_DEV;

module.exports = router;