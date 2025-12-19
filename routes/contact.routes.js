const router = require("express").Router();
const db = require("../config/db");

router.post("/", (req, res) => {
    const { name, email, topic, message } = req.body;

    db.query(
        "INSERT INTO contact_messages (name, email, topic, message) VALUES (?, ?, ?, ?)",
        [name, email, topic, message],
        (err) => {
            if (err) return res.status(400).json({ success: false });
            res.json({ success: true, message: "Message received" });
        }
    );
});

router.get("/", (_, res) => {
    db.query("SELECT * FROM contact_messages ORDER BY created_at DESC", (err, rows) => {
        if (err) return res.status(500).json([]);
        res.json(rows);
    });
});

module.exports = router;
