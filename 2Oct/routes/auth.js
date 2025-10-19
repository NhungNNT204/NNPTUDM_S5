var express = require('express');
var router = express.Router();
let users = require('../schemas/users');
let roles = require('../schemas/roles');
let bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken')


router.post('/register', async function(req, res, next) {
  let role = await roles.findOne({name:"USER"});
  role = role._id;
  let newUser = new users({
    username:req.body.username,
    email:req.body.email,
    password:req.body.password,
    role:role
  })
  await newUser.save();
  res.send({
      success:true,
      data:"dang ki thanh cong"
    })
});
router.post('/login', async function(req, res, next) {
  let username = req.body.username;
  let password = req.body.password;
  let user = await users.find({
    username:username
  })
  if(user.length==0){
    res.status(404).send({
      success:true,
      data:"user khong ton tai"
    })
    return;
  }else{
    let result = bcrypt.compareSync(password,user[0].password);
    if(result){
    res.send({
      success:true,
      data:jwt.sign({
        _id:user[0]._id,
        exp:Date.now()+15*60*1000
      },"NNPTUD")
    })
    }else{
      res.send({
      success:true,
      data:"user sai password"
    })
    }
  }
});

router.get('/me',function(req, res, next){
  let token = req.headers.authorization;
  if(jwt.verify(token,"NNPTUD")){
    console.log(jwt.decode(token));
  }
})

module.exports = router;
