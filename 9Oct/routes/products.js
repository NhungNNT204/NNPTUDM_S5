var express = require('express');
var router = express.Router();
let { Response } = require('../utils/responseHandler')
let Product = require('../schemas/product')
let {Authentication, Authorization} = require('../utils/authHandler')

// GET all products (view: USER, MOD, ADMIN)
router.get('/', Authentication, Authorization('ADMIN','MOD','USER'), async function(req, res, next) {
  try{
    let products = await Product.find({isDeleted:false}).populate('category','name')
    Response(res,200,true,products)
  }catch(err){
    Response(res,500,false,err)
  }
});

// GET product by id (view: USER, MOD, ADMIN)
router.get('/:id', Authentication, Authorization('ADMIN','MOD','USER'), async function(req, res, next){
  try{
    let product = await Product.findById(req.params.id).populate('category','name')
    if(!product || product.isDeleted){
      Response(res,404,false,'ID not found')
      return
    }
    Response(res,200,true,product)
  }catch(err){
    Response(res,500,false,err)
  }
})

// POST create product
// POST create product (create: MOD, ADMIN)
router.post('/', Authentication, Authorization('ADMIN','MOD'), async function(req, res, next){
  try{
    let newProduct = new Product({
      name: req.body.name,
      price: req.body.price,
      category: req.body.category
    })
    await newProduct.save()
    Response(res,201,true,newProduct)
  }catch(err){
    Response(res,500,false,err)
  }
})

// PUT update product (update: MOD, ADMIN)
router.put('/:id', Authentication, Authorization('ADMIN','MOD'), async function(req, res, next){
  try{
    let product = await Product.findById(req.params.id)
    if(!product || product.isDeleted){
      Response(res,404,false,'ID not found')
      return
    }
    product.name = req.body.name ? req.body.name : product.name
    product.price = typeof req.body.price !== 'undefined' ? req.body.price : product.price
    product.category = req.body.category ? req.body.category : product.category
    await product.save()
    Response(res,200,true,product)
  }catch(err){
    Response(res,500,false,err)
  }
})

// DELETE product (delete: ADMIN) - soft delete
router.delete('/:id', Authentication, Authorization('ADMIN'), async function(req, res, next){
  try{
    let product = await Product.findById(req.params.id)
    if(!product || product.isDeleted){
      Response(res,404,false,'ID not found')
      return
    }
    product.isDeleted = true
    await product.save()
    Response(res,200,true,'deleted')
  }catch(err){
    Response(res,500,false,err)
  }
})

module.exports = router;