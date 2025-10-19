var express = require('express');
var router = express.Router();
let productModel = require('../schemas/product')
let { isValidObjectId, errorResponse } = require('../utils/validators')



/* GET users listing. */
router.get('/', async function(req, res, next) {
  try {
    // only return non-deleted products and populate category
    let products = await productModel.find({ isDelete: false }).populate('category')
    res.send({ success: true, data: products });
  } catch (error) {
    res.status(500).send({ success: false, data: error.message || error });
  }
});
router.get('/:id', async function(req, res, next) {
  try {
    if(!isValidObjectId(req.params.id)) return res.status(400).send(errorResponse('INVALID_ID','Invalid id'))
    let item = await productModel.findById(req.params.id).populate('category');
    if(!item || item.isDelete){
      return res.status(404).send(errorResponse('NOT_FOUND','Not found'))
    }
    res.send({ success: true, data: item });
  } catch (error) {
    res.status(400).send(errorResponse('ERROR', error.message || error));
  }
});
router.post('/', async function(req,res,next){
  try {
    let newItem = new productModel({
      name: req.body.name,
      price:req.body.price,
      description:req.body.description,
      category:req.body.category
    })
    await newItem.save()
    res.send({
      success: true,
      data:newItem
    })
  } catch (error) {
    res.status(400).send({ success: false, data: error.message || error });
  }
})
router.put('/:id', async function(req,res,next){
  try {
    if(!isValidObjectId(req.params.id)) return res.status(400).send(errorResponse('INVALID_ID','Invalid id'))
    let updatedItem = await productModel.findByIdAndUpdate(
      req.params.id,
      {
        name:req.body.name,
        price:req.body.price,
        description:req.body.description,
        category:req.body.category
      },{
        new:true
      }
    )
    if(!updatedItem) return res.status(404).send({ success:false, data:'Not found' })
    res.send({ success: true, data: updatedItem })
  } catch (error) {
    res.status(400).send(errorResponse('ERROR', error.message || error))
  }

  // let item = await productModel.findById(req.params.id);
  // item.name = req.body.name?req.body.name:item.name;
  // item.price = req.body.price?req.body.price:item.price;
  // item.description = req.body.description?req.body.description:item.description;
  // item.category = req.body.category?req.body.category:item.category;
  // await item.save();
  // res.send({
  //   success: true,
  //   data:item
  // })  
})

// soft-delete: set isDelete to true
router.delete('/:id', async function(req, res, next){
  try {
    let item = await productModel.findByIdAndUpdate(
      req.params.id,
      { isDelete: true },
      { new: true }
    )
    if(!item) return res.status(404).send({ success:false, data:'Not found' })
    res.send({ success:true, data:item })
  } catch (error) {
    res.status(500).send({ success:false, data:error })
  }
})

module.exports = router;

