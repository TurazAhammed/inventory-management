require('dotenv').config();
const express = require('express');
const cors = require('cors');

const pool = require('./db');

const inventoryRouter = require('./routes/inventory');
const salesRouter = require('./routes/sales');
const summaryRouter = require('./routes/summary');
const authRouter = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/inventory', inventoryRouter);
app.use('/api/sales', salesRouter);
app.use('/api/summary', summaryRouter);
app.use('/api/auth', authRouter);


// app.get("/", (req, res) => {
//   res.send("Backend is alive");
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Inventory backend listening on ${PORT}`));
