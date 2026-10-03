const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());

require('dotenv').config();
// Loads variables from the .env file into process.env

app.use(express.json());
// Converts JSON request bodies into JavaScript objects accessible through req.body

const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

// GET ALL EXPENSES
app.get("/api/expenses", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                id,
                title,
                amount::float8,
                category,
                to_char(date, 'YYYY-MM-DD') AS date
            FROM expenses
        `);

        return res.status(200).json(result.rows);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
});


// GET ONE EXPENSE
app.get("/api/expenses/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(404).json({
                error: "ID must be a positive integer"
            });
        }

        const result = await pool.query(`
            SELECT
                id,
                title,
                amount::float8,
                category,
                to_char(date, 'YYYY-MM-DD') AS date
            FROM expenses
            WHERE id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "ID does not exist"
            });
        }

        return res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
});


// POST EXPENSE
app.post("/api/expenses", async (req, res) => {
    try {
        const valid_categories=["Food","Entertainment","Other","Transport","Bills"];
        const title = req.body.title;
        const amount = Number(req.body.amount);
        const category = req.body.category;
        const date = req.body.date;

        if (!title || !category || !date || Number.isNaN(amount)) {
            return res.status(400).json({
                error: "All inputs must exist"
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                error: "Amount must be greater than 0"
            });
        }
        if(!valid_categories.includes(category))
        {
            return res.status(400).json({
                error:"Invalid Category"
            })
        }

        const result = await pool.query(
            `INSERT INTO expenses (title, amount, category, date)
             VALUES ($1, $2, $3, $4)
             RETURNING
            id,
            title,
            amount::float8,
            category,
            to_char(date, 'YYYY-MM-DD') AS date`,
            [title, amount, category, date]
        );

        return res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
});


// PUT EXPENSE
app.put("/api/expenses/:id", async (req, res) => {
    try {
        const valid_categories=["Food","Entertainment","Other","Transport","Bills"];
        const id = Number(req.params.id);
        const title = req.body.title;
        const amount = Number(req.body.amount);
        const category = req.body.category;
        const date = req.body.date;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(404).json({
                error: "ID must be a positive integer"
            });
        }

        if (!title || !category || !date || Number.isNaN(amount) || amount <= 0) {
            return res.status(400).json({
                error: "Invalid expense data"
            });
        }

        if(!valid_categories.includes(category))
        {
            return res.status(400).json({
                error:"Invalid Category"
            })
        }

        const result = await pool.query(
            `UPDATE expenses
                SET title = $2,
                 amount = $3,
                 category = $4,
                 date = $5
             WHERE id = $1
             RETURNING
            id,
            title,
            amount::float8,
            category,
            to_char(date, 'YYYY-MM-DD') AS date`,
            [id, title, amount, category, date]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Expense not found"
            });
        }

        return res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
});


// DELETE EXPENSE
app.delete("/api/expenses/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(404).json({
                error: "ID must be a positive integer"
            });
        }

        const result = await pool.query(
            "DELETE FROM expenses WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Expense not found"
            });
        }

        return res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});