var express = require('express');
var router = express.Router();
let commentModel = require('../schemas/comment');
let { isValidObjectId, errorResponse } = require('../utils/validators')

// list (not deleted)
router.get('/', async function(req, res, next) {
  try {
    let items = await commentModel.find({ isDelete: false });
    res.send({ success: true, data: items });
  } catch (error) {
    res.status(500).send({ success: false, data: error.message || error });
  }
});

// get by id
router.get('/:id', async function(req, res, next) {
  try {
    if(!isValidObjectId(req.params.id)) return res.status(400).send(errorResponse('INVALID_ID','Invalid id'))
    let item = await commentModel.findById(req.params.id);
    if(!item || item.isDelete) return res.status(404).send(errorResponse('NOT_FOUND','Not found'))
    res.send({ success:true, data:item })
  } catch (error) {
    res.status(400).send(errorResponse('ERROR', error.message || error))
  }
});

// create
router.post('/', async function(req, res, next){
  try {
    let newItem = new commentModel({ text: req.body.text, postId: req.body.postId });
    await newItem.save();
    res.send({ success:true, data: newItem });
  } catch (error) {
    res.status(400).send({ success:false, data: error.message || error })
  }
});

// update
router.put('/:id', async function(req, res, next){
  try {
    if(!isValidObjectId(req.params.id)) return res.status(400).send(errorResponse('INVALID_ID','Invalid id'))
    let updated = await commentModel.findByIdAndUpdate(req.params.id, { text: req.body.text, postId: req.body.postId }, { new:true });
    if(!updated) return res.status(404).send(errorResponse('NOT_FOUND','Not found'))
    res.send({ success:true, data: updated })
  } catch (error) {
    res.status(400).send(errorResponse('ERROR', error.message || error))
  }
});

// soft-delete
router.delete('/:id', async function(req, res, next){
  try {
    if(!isValidObjectId(req.params.id)) return res.status(400).send(errorResponse('INVALID_ID','Invalid id'))
    let item = await commentModel.findByIdAndUpdate(req.params.id, { isDelete:true }, { new:true });
    if(!item) return res.status(404).send(errorResponse('NOT_FOUND','Not found'))
    res.send({ success:true, data:item })
  } catch (error) {
    res.status(500).send(errorResponse('ERROR', error.message || error))
  }
});

module.exports = router;
