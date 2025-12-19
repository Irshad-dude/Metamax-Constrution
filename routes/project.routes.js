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
        "INSERT INTO projects (title, category, description, image) VALUES (?, ?, ?, ?)",
        [title, category, description, image],
        (err, result) => {
            if (err) return res.status(400).json({ success: false, message: err.message });
            res.json({ success: true, message: "Project created" });
        }
    );
});

router.get("/", (_, res) => {
    db.query("SELECT * FROM projects ORDER BY created_at DESC", (err, rows) => {
        if (err) return res.status(500).json([]);
        // Transform rows for frontend if necessary (add /uploads/ prefix)
        const enhancedRows = rows.map(r => ({
            ...r,
            // If image doesn't start with http/data, assume it's local
            image: r.image && !r.image.startsWith('http') && !r.image.startsWith('data:')
                ? `/uploads/${r.image}`
                : r.image
        }));
        res.json(enhancedRows);
    });
});

// Get Single Project
router.get("/:id", (req, res) => {
    db.query("SELECT * FROM projects WHERE id = ?", [req.params.id], (err, rows) => {
        if (err || rows.length === 0) return res.status(404).json({ success: false, message: "Project not found" });
        const p = rows[0];
        // Normalize Image URL
        p.image = p.image && !p.image.startsWith('http') && !p.image.startsWith('data:') ? `/uploads/${p.image}` : p.image;
        res.json({ success: true, data: p });
    });
});

// Update Project
router.put("/:id", upload.single("image"), (req, res) => {
    const { title, category, description } = req.body;
    const id = req.params.id;

    // First check if project exists and get old image to optionally delete (cleanup omitted for now but good practice)
    db.query("SELECT * FROM projects WHERE id = ?", [id], (err, rows) => {
        if (err || rows.length === 0) return res.status(404).json({ success: false, message: "Project not found" });

        const oldImage = rows[0].image;
        // If new file uploaded, use it. Else use existing.
        // Note: Frontend might send 'image' string if not changed, need to handle that? 
        // Multer handles file. If no file, we keep oldImage.
        const image = req.file ? req.file.filename : oldImage;

        db.query(
            "UPDATE projects SET title = ?, category = ?, description = ?, image = ? WHERE id = ?",
            [title, category, description, image, id],
            (err) => {
                if (err) return res.status(400).json({ success: false, message: err.message });
                res.json({ success: true, message: "Project updated successfully" });
            }
        );
    });
});

router.delete("/:id", (req, res) => {
    db.query("DELETE FROM projects WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(400).json({ success: false });
        res.json({ success: true });
    });
});

module.exports = router;
