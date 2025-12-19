const router = require("express").Router();
const db = require("../config/db");
const multer = require("multer");

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (_, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.post("/", upload.single("image"), (req, res) => {
    const { title, category, description } = req.body;
    const image = req.file ? req.file.filename : (req.body.image || null);

    db.query(
        "INSERT INTO sectors (title, category, description, image, is_active) VALUES (?, ?, ?, ?, ?)",
        [title, category, description, image, true],
        (err) => {
            if (err) return res.status(400).json({ success: false, message: err.message });
            res.json({ success: true });
        }
    );
});

router.get("/", (_, res) => {
    db.query("SELECT * FROM sectors", (err, rows) => {
        if (err) return res.status(500).json([]);
        const enhancedRows = rows.map(r => ({
            ...r,
            // Compatibility: frontend expects 'isVisible' but DB has 'is_active'
            isVisible: r.is_active === 1,
            image: r.image && !r.image.startsWith('http') && !r.image.startsWith('data:')
                ? `/uploads/${r.image}`
                : r.image
        }));
        res.json(enhancedRows);
    });
});

// Get Single Sector
router.get("/:id", (req, res) => {
    db.query("SELECT * FROM sectors WHERE id = ?", [req.params.id], (err, rows) => {
        if (err || rows.length === 0) return res.status(404).json({ success: false, message: "Sector not found" });
        const s = rows[0];
        s.isVisible = s.is_active === 1;
        s.image = s.image && !s.image.startsWith('http') && !s.image.startsWith('data:') ? `/uploads/${s.image}` : s.image;
        res.json({ success: true, data: s });
    });
});

// Update Sector (Full Edit)
router.put("/:id", upload.single("image"), (req, res) => {
    const { title, category, description, isVisible } = req.body;
    const id = req.params.id;

    db.query("SELECT * FROM sectors WHERE id = ?", [id], (err, rows) => {
        if (err || rows.length === 0) return res.status(404).json({ success: false, message: "Sector not found" });

        const oldImage = rows[0].image;
        const image = req.file ? req.file.filename : oldImage;

        // Handle isVisible toggling or keeping existing
        // If isVisible is passed, update it. If not (e.g. just text edit), maybe keep it?
        // Usually edit form sends all data.
        let is_active = rows[0].is_active;
        if (isVisible !== undefined) {
            is_active = (isVisible === 'true' || isVisible === true || isVisible === 1) ? 1 : 0;
        }

        db.query(
            "UPDATE sectors SET title = ?, category = ?, description = ?, image = ?, is_active = ? WHERE id = ?",
            [title, category, description, image, is_active, id],
            (err) => {
                if (err) return res.status(400).json({ success: false, message: err.message });
                res.json({ success: true, message: "Sector updated successfully" });
            }
        );
    });
});

router.delete("/:id", (req, res) => {
    db.query("DELETE FROM sectors WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(400).json({ success: false });
        res.json({ success: true });
    });
});

module.exports = router;
