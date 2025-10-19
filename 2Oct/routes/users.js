var express = require('express');
var router = express.Router();
let users = require('../schemas/users');
let roles = require('../schemas/roles');

/* GET users listing. */
router.get('/', async function(req, res, next) {
  try {
    // support search by username or fullName (contains)
    const q = req.query.q || req.query.search || '';
    const filter = { isDeleted: false };
    if (q) {
      const regex = new RegExp(q, 'i');
      filter.$or = [{ username: regex }, { fullName: regex }];
    }
    const allUsers = await users.find(filter).populate({ path: 'role', select: 'name' });
    res.send({ success: true, data: allUsers });
  } catch (err) {
    res.status(500).send({ success: false, error: err.message || err });
  }
});
// get by username (specific route must come before /:id)
router.get('/by-username/:username', async function(req, res, next) {
  try {
    const username = req.params.username;
    const user = await users.findOne({ username: username, isDeleted: false }).populate({ path: 'role', select: 'name' });
    if (!user) return res.status(404).send({ success: false, error: 'User not found' });
    res.send({ success: true, data: user });
  } catch (err) {
    res.status(500).send({ success: false, error: err.message || err });
  }
});

router.get('/:id', async function(req, res, next) {
  try {
    let getUser = await users.findById(req.params.id).populate({ path: 'role', select: 'name' });
    if (!getUser || getUser.isDeleted) {
      return res.status(404).send({ success: false, error: 'User not found' });
    }
    res.send({ success: true, data: getUser });
  } catch (error) {
     res.status(400).send({ success: false, error: error.message || error });
  }
});

router.post('/', async function(req, res, next) {
  try {
    let roleName = req.body.role ? req.body.role : "USER";
    let roleDoc = await roles.findOne({ name: roleName });
    if (!roleDoc) return res.status(400).send({ success: false, error: 'Role not found' });
    let newUser = new users({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      role: roleDoc._id
    });
    await newUser.save();
    res.send({ success: true, data: newUser });
  } catch (err) {
    res.status(400).send({ success: false, error: err.message || err });
  }
});

// activate user by matching username and email -> set status = true
router.post('/activate', async function(req, res, next) {
  try {
    const { email, username } = req.body;
    if (!email || !username) return res.status(400).send({ success: false, error: 'email and username are required' });
    let user = await users.findOne({ email: email, username: username, isDeleted: false });
    if (!user) return res.status(404).send({ success: false, error: 'User not found or data mismatch' });
    user.status = true;
    await user.save();
    res.send({ success: true, data: 'User activated' });
  } catch (err) {
    res.status(500).send({ success: false, error: err.message || err });
  }
});
router.put('/:id', async function(req, res, next) {
  try {
    let user = await users.findById(req.params.id);
    if (!user || user.isDeleted) return res.status(404).send({ success: false, error: 'User not found' });
    user.email = req.body.email ? req.body.email : user.email;
    user.fullName = req.body.fullName ? req.body.fullName : user.fullName;
    user.password = req.body.password ? req.body.password : user.password;
    if (req.body.role) user.role = req.body.role;
    await user.save();
    res.send({ success: true, data: user });
  } catch (err) {
    res.status(400).send({ success: false, error: err.message || err });
  }
});

// soft delete user
router.delete('/:id', async function(req, res, next) {
  try {
    let user = await users.findById(req.params.id);
    if (!user || user.isDeleted) return res.status(404).send({ success: false, error: 'User not found' });
    user.isDeleted = true;
    await user.save();
    res.send({ success: true, data: 'User soft-deleted' });
  } catch (err) {
    res.status(400).send({ success: false, error: err.message || err });
  }
});

module.exports = router;
