const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require('fs');
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());
// Serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// MySQL Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/projects", require("./routes/project.routes"));
app.use("/api/sectors", require("./routes/sector.routes"));
app.use("/api/contact", require("./routes/contact.routes"));
app.use("/api/dashboard", require("./routes/dashboard.routes"));

// Root & Admin
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
    const adminPath = path.resolve(__dirname, 'public', 'admin.html');
    fs.readFile(adminPath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error loading admin page');
        res.send(data);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
