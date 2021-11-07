const express = require('express');
const db = require('../db');
const request = require('request');

const router = express.Router();

// GET CATEGORIES
router.get('/api/v1/categories', async (req, res) => {
  try {
    const results = await db.query(`SELECT * FROM public."Category";`)

    if (results.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          addresses: results.rows
        }
      });
    } else {
      res.status(204).json({
        status: "No Results."
      });
    }
  } catch (error) {
    console.log(error)
  }
});

// GET CATEGORY
router.get('/api/v1/category/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM public."Category" WHERE id = $1;', [
      req.params.id
    ])
    
    if (result.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          address: result.rows[0]
        }
      })
    } else {
      res.status(204).json({
        status: "ID did not match."
      });
    }
  } catch (error) {
    console.log(error)
  }
});

module.exports = router;