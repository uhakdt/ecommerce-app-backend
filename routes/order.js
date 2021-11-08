const express = require('express');
const db = require('../db');
const request = require('request');
const GetDateAndTimeNow = require('../auxillary/dateAndTimeNow')

const router = express.Router();

let currentURL = process.env.URL_DEV;

// GET ORDERS
router.get('/api/v1/orders', async (req, res) => {
  try {
    const results = await db.query(`SELECT * FROM public."Order";`)

    if (results.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          orders: results.rows
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

// GET ORDERS BY USER
router.get('/api/v1/orders/:id', async (req, res) => {
  try {
    const results = await db.query(
      'SELECT * FROM public."Order" WHERE "userID" = $1;',
      [req.params.id]
    )

    if (results.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          orders: results.rows
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

// GET ORDER
router.get('/api/v1/order/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM public."Order" WHERE id = $1;', 
      [req.params.id]
    )

    const orderProductsResult = await db.query(
      'SELECT * FROM public."OrderProduct" WHERE "orderID" = $1;', 
      [req.params.id]
    )
    result.rows[0].orderProducts = orderProductsResult.rows;

    if (result.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          order: result.rows[0]
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

// CREATE ORDER
router.post('/api/v1/order', async (req, res) => {
  try {
    const cartProducts = req.body.cartProducts;
    let totalAmount = 0;
    for (let i = 0; i < cartProducts.length; i++) {
      const e = cartProducts[i];
      totalAmount += e.price * e.quantity;      
    }

    // Create Order
    const resultCreateOrder = await db.query(
      'INSERT INTO public."Order"("dateAndTime", "statusID", "supplierID", "userID", "totalAmount", "contactName", "contactEmail", "contactPhone", address1, address2, city, county, country, postcode) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) returning *', [
      GetDateAndTimeNow(),
      1,
      1,
      req.body.userID,
      totalAmount.toFixed(2),
      req.body.contactName,
      req.body.contactEmail,
      req.body.contactPhone,
      req.body.address1,
      req.body.address2,
      req.body.city,
      req.body.county,
      req.body.country,
      req.body.postcode,
    ])
    if(resultCreateOrder.rowCount > 0){
      // Create Order Products from Cart Products
      
      const createOrderProducts = async item => {
        const orderProductResult = await db.query(
          'INSERT INTO public."OrderProduct" ("orderID", title, quantity) VALUES ($1, $2, $3) returning *', [
          resultCreateOrder.rows[0].id,
          item.title,
          item.quantity,
        ])
        return orderProductResult;
      };
      const getCreateOrderProductsData = async () => {
        return Promise.all(req.body.cartProducts.map(item => createOrderProducts(item)))
      };
      getCreateOrderProductsData().then((data) => {
        resultCreateOrder.rows[0].orderProducts = data;
      }).catch(error => {
        console.log(error);
      });

      res.status(201).json({
        status: "OK",
        data: {
          order: resultCreateOrder.rows[0]
        }
      });
    } else {
      res.status(400).json({
        status: "Order cannnot be created."
      })
    }
  } catch (error) {
    console.log(error);
  };
});

// UPDATE ORDER STATUS
router.put('/api/v1/order', async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE public."Order" SET status=$2 WHERE id = $1 returning *',[
      req.body.id,
      req.body.status
    ])
    if (result.rowCount > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          order: result.rows[0]
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

// DELETE ORDER
router.delete('/api/v1/order/:id', async (req, res) => {
  try {
    const resultGET = await db.query(
      'SELECT * FROM public."Order" WHERE id = $1;', 
      [req.params.id]
    )

    if(resultGET.rowCount > 0) {
      const deleteOrderProductsResult = await db.query(
        'DELETE FROM public."OrderProduct" WHERE "orderID" = $1;',
        [req.params.id]
      )
      const deleteOrderResult = await db.query(
        'DELETE FROM public."Order" WHERE id = $1;',
        [req.params.id]
      )
      res.status(200).json({
        status: "OK",
        data: resultGET.rows[0]
      })
    } else {
      res.status(500).json({
        status: "Not sure what happened.",
        data: {
          order: resultGET.rows[0]
        }
      })
    }
  } catch (error) {
    console.log(error)
  }
});

module.exports = router;