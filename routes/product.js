const express = require('express');
const db = require('../db');

const router = express.Router();

// GET PRODUCTS
router.get('/api/v1/products', async (req, res) => {
  try {
    const results = await db.query(`SELECT * FROM public."Product" WHERE stock != 0 and active = true order by price asc;`)
    
    if (results.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          products: results.rows
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

// GET PRODUCTS BY CATEGORY
router.get('/api/v1/products/:categoryName', async (req, res) => {
  try {
    const results = await db.query(`SELECT * FROM public."Product" WHERE $1 = ANY(categories) and stock != 0 and active = true order by price asc;`, [
      req.params.categoryName
    ])
    
    if (results.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          products: results.rows
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

// GET PRODUCT
router.get('/api/v1/product/:id', async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM public."Product" WHERE id=$1;`,[
      req.params.id
    ])
    if(result.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          product: result.rows[0]
        }
      })
    } else {
      res.status(204).json({
        status: "ID did not match."
      })
    }
  } catch (error) {
    console.log(error)
  }
});

// CREATE PRODUCT
router.post('/api/v1/product', async (req, res) => {
  try {
    const result = await db.query(
      'INSERT INTO public."Product"("supplierID", title, description, "imageUrl", "imagesUrl", "productRatingID", price, stock, active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) returning *', [
      req.body.supplierID,
      req.body.title,
      req.body.description,
      req.body.imageUrl,
      req.body.imagesUrl,
      req.body.productRatingID,
      req.body.price,
      req.body.stock,
      req.body.active,
    ])
    if(result.rowCount > 0){
      res.status(201).json({
        status: "OK",
        data: {
          product: result.rows[0]
        }
      })
    } else {
      res.status(500).json({
        status: "Not sure what happened."
      })
    }
  } catch (error) {
    console.log(error);
  }
});

// UPDATE PRODUCT
router.put('/api/v1/product', async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE public."Product" SET "supplierID"=$2, title=$3, description=$4, "imageUrl"=$5, "imagesUrl"=$6, "productRatingID"=$7, price=$8, stock=$9, active=$10 WHERE id=$1 returning *', [
      req.body.id,
      req.body.supplierID,
      req.body.title,
      req.body.description,
      req.body.imageUrl,
      req.body.imagesUrl,
      req.body.productRatingID,
      req.body.price,
      req.body.stock,
      req.body.active,
    ])
    if (result.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          product: result.rows[0]
        }
      })
    } else {
      res.status(204).json({
        status: "ID did not match."
      });
    }
  } catch (error) {
    console.log(error);
  }
});

// DELETE PRODUCT
router.delete('/api/v1/product/:id', async (req, res) => {
  try {
    const resultGET = await db.query(
      'SELECT * FROM public."Product" WHERE id = $1;', [
      req.params.id
    ])
    await db.query(
      'DELETE FROM public."Product" WHERE id = $1',[
      req.params.id
    ])
    if (resultGET.rowCount > 0) {
      res.status(200).json({
        status: "OK"
      })
    } else {
      res.status(204).json({
        status: "ID did not match."
      })
    }
  } catch (error) {
    console.log(error)
  }
});

module.exports = router;