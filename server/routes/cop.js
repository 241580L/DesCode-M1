const express = require('express');
const router = express.Router();
const { CodeOfPractices } = require('../models');
const { upload } = require('../middlewares/upload');
const { validateToken } = require('../middlewares/auth');

// List all COPs (not deleted)
router.get("/", validateToken, async (req, res) => {
    const cops = await CodeOfPractices.findAll({ where: { deleted: false } });
    res.json(cops);
});

// View COP by id
router.get("/:id", validateToken, async (req, res) => {
    const cop = await CodeOfPractices.findByPk(req.params.id);
    if (!cop || cop.deleted) return res.status(404).json({ message: "COP not found" });
    res.json(cop);
});

// Upload new COP
router.post("/upload", validateToken, upload, async (req, res) => {
    if (!req.user.isAdmin) return res.status(403).send("Forbidden");
    const cop = await CodeOfPractices.create({
        name: req.body.name,
        contents: req.file.filename,
        dateUploaded: new Date(),
        dateEdited: new Date(),
    });
    res.json(cop);
});

// Update/replace COP by uploading new PDF
router.put("/:id/upload", validateToken, upload, async (req, res) => {
    if (!req.user.isAdmin) return res.status(403).send("Forbidden");
    const cop = await CodeOfPractices.findByPk(req.params.id);
    if (!cop || cop.deleted) return res.status(404).json({ message: "COP not found" });
    cop.contents = req.file.filename;
    cop.dateEdited = new Date();
    await cop.save();
    res.json(cop);
});

// Soft-delete COP (set deleted true and contents = null)
router.delete("/:id", validateToken, async (req, res) => {
    if (!req.user.isAdmin) return res.status(403).send("Forbidden");
    const cop = await CodeOfPractices.findByPk(req.params.id);
    if (!cop || cop.deleted) return res.status(404).json({ message: "COP not found" });
    cop.deleted = true;
    cop.contents = null;
    await cop.save();
    res.json({ message: "COP soft deleted" });
});

module.exports = router;
