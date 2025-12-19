const router = require("express").Router();
const db = require("../config/db");

router.get("/stats", (req, res) => {
    // Simple aggregated stats query
    // Since we are async/callback based, we nest or use promise wrapper. simpler to just mock separate queries for now or do parallel.
    // We'll return dummy stats or attempt count
    db.query("SELECT (SELECT COUNT(*) FROM projects) as projects, (SELECT COUNT(*) FROM sectors) as sectors", (err, result) => {
        if (err || !result) return res.json({ success: true, data: { projects: 0, sectors: 0 } });
        res.json({ success: true, data: result[0] });
    });
});

module.exports = router;
