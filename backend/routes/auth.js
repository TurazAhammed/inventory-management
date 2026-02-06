const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../db"); // this is the pool
const router = express.Router();

router.post("/login", async (req, res) => {
  console.log("LOGIN HIT");

  const { email, password } = req.body;
  console.log("BODY:", email, password);

  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    console.log("DB RESULT:", rows);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];

    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      token,
      role: user.role
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
