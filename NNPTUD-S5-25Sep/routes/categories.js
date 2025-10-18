var express = require('express');
var router = express.Router();
let categoryModel = require('../schemas/category')

// List categories
router.get('/', async function(req, res, next) {
  try {
    let cats = await categoryModel.find({});
    res.send({ success: true, data: cats });
  } catch (error) {
    res.status(500).send({ success: false, data: error });
  }
});

// Get by id
router.get('/:id', async function(req, res, next) {
  try {
    let cat = await categoryModel.findById(req.params.id);
    if (!cat) return res.status(404).send({ success: false, data: 'Not found' });
    res.send({ success: true, data: cat });
  } catch (error) {
    res.status(500).send({ success: false, data: error });
  }
});

// Create
router.post('/', async function(req, res, next) {
  try {
    let newCat = new categoryModel({ name: req.body.name });
    await newCat.save();
    res.send({ success: true, data: newCat });
  } catch (error) {
    res.status(400).send({ success: false, data: error });
  }
});

// Update
router.put('/:id', async function(req, res, next) {
  try {
    let updated = await categoryModel.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });
    if (!updated) return res.status(404).send({ success: false, data: 'Not found' });
    res.send({ success: true, data: updated });
  } catch (error) {
    res.status(400).send({ success: false, data: error });
  }
});

// Delete
router.delete('/:id', async function(req, res, next) {
  try {
    let deleted = await categoryModel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).send({ success: false, data: 'Not found' });
    res.send({ success: true, data: deleted });
  } catch (error) {
    res.status(500).send({ success: false, data: error });
  }
});

module.exports = router;
