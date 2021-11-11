const express = require('express');
const bcrypt = require ('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

const salt = 10;
const secret = process.env.SECRET

// GET USERS
router.get('/api/v1/users', async (req, res) => {
  try {
    const results = await db.query(`SELECT id, name, email, phone, "addressID", "dateAndTimeSignUp", "profileImageUrl" FROM public."User";`)

    if(results.rowCount > 0){
      res.status(200).json({
        status: "OK",
        data: {
          users: results.rows
        }
      })
    } else {
      res.status(204).json({
        status: "No Results.",
      })
    }
  } catch (error) {
    console.log(error)
  }
});

// GET USER BY ID
router.get('/api/v1/user/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, phone, "addressID", "dateAndTimeSignUp", "profileImageUrl" FROM public."User" WHERE id = $1;', [
      req.params.id
    ])
    if(result.rowCount > 0){
      res.status(200).json({
        status: "OK",
        data: {
          user: result.rows[0]
        }
      })
    } else {
      res.status(204).json({
        status: "ID did not match.",
      })
    }
  } catch (error) {
    console.log(error)
  }
});

// GET USER BY EMAIL
router.get('/api/v1/user/byEmail/:email', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, phone, "addressID", "dateAndTimeSignUp", "profileImageUrl" FROM public."User" WHERE email = $1;', [
      req.params.email
    ])
    if(result.rowCount > 0){
      res.status(200).json({
        status: "OK",
        data: {
          user: result.rows[0]
        }
      })
    } else {
      res.status(204).json({
        status: "ID did not match.",
      })
    }
  } catch (error) {
    console.log(error)
  }
});

// CREATE USER
router.post('/api/v1/user', async (req, res) => {
  try {
    const existingUser = await db.query(
      'SELECT * FROM public."User" WHERE email = $1;', [
      req.body.email
    ])

    if(existingUser.rowCount === 0){
      const result = await db.query(
        'INSERT INTO public."User"(name, email, phone, "loginDetailID", "addressID", "dateAndTimeSignUp", "profileImageUrl", "extUserID", "passwordHash") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) returning *', [
        req.body.name,
        req.body.email,
        req.body.phone,
        req.body.loginDetailID,
        req.body.addressID,
        req.body.dateAndTimeSignUp,
        req.body.profileImageUrl,
        req.body.extUserID,
        bcrypt.hashSync(req.body.password, salt)
      ])
      res.status(201).json({
        status: "OK",
        data: {
          user: result.rows[0]
        }
      })
    } else {
      res.status(422).json({
        status: "User already exists.",
        data: {
          user: existingUser.rows[0]
        }
      })
    }


  } catch (error) {
    console.log(error);
  }
});

// UPDATE USER
router.put('/api/v1/user', async (req, res) => {
  try {
    const existingUser = await db.query(
      'SELECT * FROM public."User" WHERE email = $1;', [
      req.body.email
    ])
    if(existingUser.rowCount === 0){
      let newPassword;
      if(req.body.password) {
          newPassword = bcrypt.hashSync(req.body.password, 10)
      } else {
          newPassword = userExist.passwordHash;
      }

      const result = await db.query(
        'UPDATE public."User" SET name=$2, email=$3, phone=$4, "loginDetailID"=$5, "addressID"=$6, "dateAndTimeSignUp"=$7, "profileImageUrl"=$8, "extUserID"=$9 "passwordHash"=$10 WHERE id = $1 returning *',[
        req.body.id,
        req.body.name,
        req.body.email,
        req.body.phone,
        req.body.loginDetailID,
        req.body.addressID,
        req.body.dateAndTimeSignUp,
        req.body.profileImageUrl,
        req.body.extUserID,
        newPassword
      ])
      if (result.rowCount > 0) {
        res.status(200).json({
          status: "OK",
          data: {
            user: result.rows[0]
          }
        })
      } else {
        res.status(204).json({
          status: "ID did not match."
        });
      }
    } else {
      res.status(422).json({
        status: "User already exists.",
        data: {
          user: existingUser.rows[0]
        }
      })
    }
  } catch (error) {
    console.log(error)
  }
});

// DELETE USER
router.delete('/api/v1/user/:id', async (req, res) => {
  try {
    const resultGET = await db.query(
      'SELECT * FROM public."User" WHERE id = $1;', [
      req.params.id
    ])
    await db.query(
      'DELETE FROM public."User" WHERE id = $1',[
      req.params.id
    ])
    if (resultGET.rows.length > 0) {
      res.status(200).json({
        status: "OK",
        data: {
          user: resultGET.rows[0]
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

// LOGIN USER
router.post('/api/v1/user/login', async (req, res) => {
  const user = await db.query(
    'SELECT * FROM public."User" WHERE email = $1;', [
    req.body.email
  ])

  if(!user.rows[0]) {
    return res.status(400).json({
      status: "User not found."
    })
  }
  if(user && bcrypt.compareSync(req.body.password, user.rows[0].passwordHash)) {
    const token = jwt.sign(
      {
        userId: user.rows[0].id,
        isAdmin: user.rows[0].isAdmin
      },
      secret,
      {expiresIn : '1d'}
    )
    const userEmailAndToken = {
      email: user.rows[0].email,
      token: token
    }
    
    res.status(200).json({
      status: "OK",
      data: {
        userEmailAndToken: userEmailAndToken
      }
    })
  } else {
    res.status(400).json({
      status: "Password is incorrect. Please try again or contact us (＞ｙ＜)"
    })
  }
})

// REGISTER USER
router.post('/api/v1/user/register', async (req, res) => {
  try {
    const existingUser = await db.query(
      'SELECT * FROM public."User" WHERE email = $1;', [
      req.body.email
    ])

    if(existingUser.rowCount === 0){
      const result = await db.query(
        'INSERT INTO public."User"(name, email, phone, "loginDetailID", "addressID", "dateAndTimeSignUp", "profileImageUrl", "extUserID", "passwordHash") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) returning *', [
        req.body.name,
        req.body.email,
        req.body.phone,
        req.body.loginDetailID,
        req.body.addressID,
        req.body.dateAndTimeSignUp,
        req.body.profileImageUrl,
        req.body.extUserID,
        bcrypt.hashSync(req.body.password, salt)
      ])
      return res.status(201).json({
        status: "OK",
        data: {
          user: result.rows[0]
        }
      })
    } else {
      return res.status(200).json({
        status: "User already exists.",
        data: {
          user: existingUser.rows[0]
        }
      })
    }


  } catch (error) {
    console.log(error);
  }
});

module.exports = router;