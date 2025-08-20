// server/routes/cop.js
const express = require('express');
const router = express.Router();
const { CodeOfPractices, User } = require('../models');
const { upload, uploadErrorHandler } = require('../middlewares/upload');
const { validateToken } = require('../middlewares/auth');
const { wiz } = require('../utils');

router.get("/", validateToken, async (req,res) => {
  try {
    const cops = await CodeOfPractices.findAll({
      where: { deleted: false },
      include: [
        { model: User, as: "Uploader", attributes: ["id", "name"] },
        { model: User, as: "Editor", attributes: ["id", "name"] }
      ]
    });
    res.json(cops);
  } catch(err) {
    wiz(err, "Error fetching list of Code of Practices:");
    res.status(500).json({ error:"Failed to fetch Code of Practices." });
  }
});

router.get("/:id", validateToken, async (req, res) => {
  try {
    const cop = await CodeOfPractices.findByPk(req.params.id, {
      include: [
        { model: User, as: "Uploader", attributes: ["id", "name"] },
        { model: User, as: "Editor", attributes: ["id", "name"] }
      ]
    });

    if (!cop || cop.deleted) {
      return res.status(404).json({ message: "COP not found" });
    }

    res.json(cop);
  } catch (err) {
    wiz(err, `Error fetching Code of Practice #${req.params.id}`);
    res.status(500).json({ error: "Failed to fetch Code of Practice." });
  }
});


router.post("/upload", validateToken, upload.single('file'), uploadErrorHandler, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).send("Forbidden");
    if (!req.file) return res.status(400).json({ message: "No file provided" });

    const cop = await CodeOfPractices.create({
      name: req.body.name,
      contents: req.file.filename,
      uploader: req.user.id,
      editor: req.user.id,//editor#1=uploader
      dateUploaded: new Date(),
      dateEdited: new Date(),
    });

    res.json(cop);
  } catch (err) {
    wiz(err, "Error uploading new Code of Practice:");
    res.status(500).json({ error: "Failed to upload Code of Practice." });
  }
});

router.put("/:id/upload", validateToken, upload.single('file'), uploadErrorHandler, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).send("Forbidden");
    const cop = await CodeOfPractices.findByPk(req.params.id);
    if (!cop || cop.deleted) return res.status(404).json({ message: "COP not found" });
    if (!req.file) return res.status(400).json({ message: "No file provided" });

    cop.contents = req.file.filename;
    cop.editor = req.user.id;
    cop.dateEdited = new Date();
    await cop.save();

    res.json(cop);
  } catch (err) {
    wiz(err, `Error replacing Code of Practice file for ID #${req.params.id}:`);
    res.status(500).json({ error: "Failed to replace Code of Practice file." });
  }
});

router.delete("/:id", validateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).send("Forbidden");
    const cop = await CodeOfPractices.findByPk(req.params.id);
    if (!cop || cop.deleted) return res.status(404).json({ message: "COP not found" });
    
    cop.deleted = true;
    cop.contents = null;
    await cop.save();

    res.json({ message: "COP soft deleted" });
  } catch (err) {
    wiz(err, `Error soft deleting Code of Practice #${req.params.id}:`);
    res.status(500).json({ error: "Failed to delete Code of Practice." });
  }
});

module.exports = router;
