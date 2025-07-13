// server/routes/userRoutes.js
import express from "express";
import pool from "../db.js";
import bcrypt from "bcrypt";

const router = express.Router();

router.post("/register", async (req, res) => {
  let { username, first_name, last_name, email, password, role } = req.body;

  if (!username || !password || !role || !first_name || !last_name || !email) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    //we need to store hash passwords based on unique keys like email
    //so we need to hash with user_id and password together
    bcrypt.genSalt(10,(err,salt) =>{
      bcrypt.hash(password , salt,(err,hash)=>{
        password = hash;
      })
    })
    console.log(password);
    const result = await pool.query(
      `INSERT INTO users (username, first_name, last_name, email, password, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING user_id`,
      [username, first_name, last_name, email, password, role]
    );
    res.json({ message: "User registered", user_id: result.rows[0].user_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




export default router;
