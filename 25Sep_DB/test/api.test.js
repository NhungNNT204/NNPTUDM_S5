const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;

let mongoServer;

before(async function() {
  this.timeout(20000);
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

after(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

describe('API soft-delete tests', function(){
  let categoryId;
  let productId;

  it('should create a category', async function(){
    const res = await request(app)
      .post('/categories')
      .send({ name: 'test-cat' })
      .expect(200);
    expect(res.body.success).to.be.true;
    expect(res.body.data).to.have.property('_id');
    categoryId = res.body.data._id;
  });

  it('should create a product', async function(){
    const res = await request(app)
      .post('/products')
      .send({ name: 'test-product', price: 10, description: 'x', category: categoryId })
      .expect(200);
    expect(res.body.success).to.be.true;
    productId = res.body.data._id;
  });

  it('list endpoints should include created items', async function(){
    const catRes = await request(app).get('/categories').expect(200);
    expect(catRes.body.success).to.be.true;
    expect(catRes.body.data).to.be.an('array').that.is.not.empty;

    const prodRes = await request(app).get('/products').expect(200);
    expect(prodRes.body.success).to.be.true;
    expect(prodRes.body.data).to.be.an('array').that.is.not.empty;
    // check populate: product.category should be an object with name
    const first = prodRes.body.data[0];
    expect(first).to.have.property('category');
    expect(first.category).to.be.an('object');
    expect(first.category).to.have.property('name');
  });

  it('soft-delete category then ensure it is not listed', async function(){
    await request(app).delete(`/categories/${categoryId}`).expect(200);
    const catRes = await request(app).get('/categories').expect(200);
    expect(catRes.body.data.find(c=>c._id===categoryId)).to.be.undefined;
  });

  it('soft-delete product then ensure it is not listed', async function(){
    await request(app).delete(`/products/${productId}`).expect(200);
    const prodRes = await request(app).get('/products').expect(200);
    expect(prodRes.body.data.find(p=>p._id===productId)).to.be.undefined;
  });

  it('get product with invalid id should return 400 with error code', async function(){
    const res = await request(app).get('/products/invalid-id').expect(400);
    expect(res.body).to.have.property('success', false);
    expect(res.body).to.have.nested.property('error.code', 'INVALID_ID');
  });

  it('get category with invalid id should return 400 with error code', async function(){
    const res = await request(app).get('/categories/invalid-id').expect(400);
    expect(res.body).to.have.property('success', false);
    expect(res.body).to.have.nested.property('error.code', 'INVALID_ID');
  });
});

describe('Comments CRUD + soft-delete', function(){
  let commentId;

  it('should create a comment', async function(){
    const res = await request(app)
      .post('/comments')
      .send({ text: 'hello comment', postId: 'post-1' })
      .expect(200);
    expect(res.body.success).to.be.true;
    expect(res.body.data).to.have.property('_id');
    commentId = res.body.data._id;
  });

  it('should list comments and include created one', async function(){
    const res = await request(app).get('/comments').expect(200);
    expect(res.body.success).to.be.true;
    expect(res.body.data).to.be.an('array');
    expect(res.body.data.find(c=>c._id===commentId)).to.not.be.undefined;
  });

  it('should get comment by id', async function(){
    const res = await request(app).get(`/comments/${commentId}`).expect(200);
    expect(res.body.success).to.be.true;
    expect(res.body.data).to.have.property('_id');
  });

  it('should update comment', async function(){
    const res = await request(app)
      .put(`/comments/${commentId}`)
      .send({ text: 'updated comment', postId: 'post-2' })
      .expect(200);
    expect(res.body.success).to.be.true;
    expect(res.body.data.text).to.equal('updated comment');
  });

  it('should soft-delete comment and ensure it is not listed', async function(){
    await request(app).delete(`/comments/${commentId}`).expect(200);
    const res = await request(app).get('/comments').expect(200);
    expect(res.body.data.find(c=>c._id===commentId)).to.be.undefined;
  });
});
