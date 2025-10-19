var express = require('express');
var router = express.Router();
let roleSchema = require('../schemas/roles')

/* GET users listing. */
router.get('/', async function(req, res, next) {
  try {
    const q = req.query.q || req.query.search || '';
    const filter = { isDeleted: false };
    if (q) filter.name = new RegExp(q, 'i');
    const roles = await roleSchema.find(filter);
    res.send({ success: true, data: roles });
  } catch (err) {
    res.status(500).send({ success: false, error: err.message || err });
  }
});
router.get('/:id', async function(req, res, next) {
  try {
    let role = await roleSchema.findById(req.params.id);
    if (!role || role.isDeleted) return res.status(404).send({ success: false, error: 'Role not found' });
    res.send({ success: true, data: role });
  } catch (error) {
    res.status(404).send({
      success:false,
      data:error
    })
  }
 
});

// get role by name
router.get('/by-name/:name', async function(req, res, next) {
  try {
    const name = req.params.name;
    const role = await roleSchema.findOne({ name: name, isDeleted: false });
    if (!role) return res.status(404).send({ success: false, error: 'Role not found' });
    res.send({ success: true, data: role });
  } catch (err) {
    res.status(500).send({ success: false, error: err.message || err });
  }
});

// update role
router.put('/:id', async function(req, res, next) {
  try {
    let role = await roleSchema.findById(req.params.id);
    if (!role || role.isDeleted) return res.status(404).send({ success: false, error: 'Role not found' });
    role.name = req.body.name ? req.body.name : role.name;
    role.description = req.body.description ? req.body.description : role.description;
    await role.save();
    res.send({ success: true, data: role });
  } catch (err) {
    res.status(400).send({ success: false, error: err.message || err });
  }
});

// soft delete role
router.delete('/:id', async function(req, res, next) {
  try {
    let role = await roleSchema.findById(req.params.id);
    if (!role || role.isDeleted) return res.status(404).send({ success: false, error: 'Role not found' });
    role.isDeleted = true;
    await role.save();
    res.send({ success: true, data: 'Role soft-deleted' });
  } catch (err) {
    res.status(400).send({ success: false, error: err.message || err });
  }
});

router.post('/', async function(req, res, next) {
  let newRole = new roleSchema({
    name:req.body.name
  })
  await newRole.save();
  res.send({
      success:true,
      data:newRole
    })
});

module.exports = router;
