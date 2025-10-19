var express = require('express');
var router = express.Router();
let { Response } = require('../utils/responseHandler')
let Category = require('../schemas/category')
let {Authentication, Authorization} = require('../utils/authHandler')

// GET all categories (view: USER, MOD, ADMIN)
router.get('/', Authentication, Authorization('ADMIN','MOD','USER'), async function(req, res, next) {
  try{
    let categories = await Category.find({isDeleted:false})
    Response(res,200,true,categories)
  }catch(err){
    Response(res,500,false,err)
  }
});

// GET category by id (view: USER, MOD, ADMIN)
router.get('/:id', Authentication, Authorization('ADMIN','MOD','USER'), async function(req, res, next){
  try{
    let category = await Category.findById(req.params.id)
    if(!category || category.isDeleted){
      Response(res,404,false,'ID not found')
      return
    }
    Response(res,200,true,category)
  }catch(err){
    Response(res,500,false,err)
  }
})

// POST create category (create: MOD, ADMIN)
router.post('/', Authentication, Authorization('ADMIN','MOD'), async function(req, res, next){
  try{
    let newCategory = new Category({
      name: req.body.name
    })
    await newCategory.save()
    Response(res,201,true,newCategory)
  }catch(err){
    Response(res,500,false,err)
  }
})

// PUT update category (update: MOD, ADMIN)
router.put('/:id', Authentication, Authorization('ADMIN','MOD'), async function(req, res, next){
  try{
    let category = await Category.findById(req.params.id)
    if(!category || category.isDeleted){
      Response(res,404,false,'ID not found')
      return
    }
    category.name = req.body.name ? req.body.name : category.name
    await category.save()
    Response(res,200,true,category)
  }catch(err){
    Response(res,500,false,err)
  }
})

// DELETE category (delete: ADMIN) - soft delete
router.delete('/:id', Authentication, Authorization('ADMIN'), async function(req, res, next){
  try{
    let category = await Category.findById(req.params.id)
    if(!category || category.isDeleted){
      Response(res,404,false,'ID not found')
      return
    }
    category.isDeleted = true
    await category.save()
    Response(res,200,true,'deleted')
  }catch(err){
    Response(res,500,false,err)
  }
})

module.exports = router;