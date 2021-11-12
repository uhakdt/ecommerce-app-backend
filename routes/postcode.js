const express = require('express');
const db = require('../db');
const GetDateAndTimeNow = require('../auxillary/dateAndTimeNow');

const router = express.Router();

// CHECK POSTCODE
router.post('/api/v1/postcode/check', async (req, res) => {
  try {
    // Remove spaces
    console.log(req.body)
    let customerPostcode = req.body.code;
    customerPostcode = customerPostcode.replace(/\s+/g, '');

    // Take only 1st part of postcode and convert to Upper case
    var arr = customerPostcode.match(/^[a-zA-Z0-9]{2,4}(?=(?:\s*[a-zA-Z0-9]{3})?$)/mg);

    // Check if the Postcode matches standard UK Postcodes
    if(arr !== null){
      customerPostcode = arr[0].toUpperCase();
      const result = await db.query(
        'SELECT * FROM public."Postcode" WHERE postcode = $1;', [
          customerPostcode
        ])
      // Check if we cover this area
      if(result.rowCount > 0) {
        res.status(200).json({
          status: "OK",
          data: {
            postcode: customerPostcode
          },
          local: 'yes'
        })
      } else {
        const nonLocalPostcodeResult = await db.query('INSERT INTO public."PostcodeNonLocal" ("supplierID", postcode, "dateAndTime") VALUES ($1, $2, $3) returning *', [
          req.body.supplierID,
          customerPostcode,
          GetDateAndTimeNow()
        ])
        // HTTP Code 204: Empty Response
        res.status(200).json({
          status: "We do not cover this Postcode area yet.",
          data: {
            postcode: nonLocalPostcodeResult.rows[0],
          },
          local: 'no'
        })
      }
    } else {
      // HTTP Code 400: Wrong Input
      res.status(400).json({
        status: "The Postcode doesn't match the UK postcode standards - please check and try again.",
        data: {
          postcode: customerPostcode
        }
      })
    }
  } catch (error) {
    console.log(error)
  }
});

module.exports = router;