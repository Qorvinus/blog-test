'use strict'

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;

const { BlogPost } = require('../models');
const { app, runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');

chai.use(chaiHttp);

function seedBlogData() {
  console.info('seeding blog post data');
  const seedData = [];
  for (let i = 1; i <= 10; i++) {
    seedData.push(generateBlogData());
  }
  return BlogPost.insertMany(seedData);
}

function generateBlogData() {
  return {
    author: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName()
    },
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraph()
  };
}

function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('Blogposts API resource', function() {

  before(function() {
    return runServer(TEST_DATABASE_URL);
  })

  beforeEach(function() {
    return seedBlogData();
  })

  afterEach(function() {
    return tearDownDb();
  })

  after(function() {
    return closeServer();
  })

  describe('GET endpoint', function() {
    it('Should return all existing blog posts', function() {
      return chai.request(app)
        .get('/posts')
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.lengthOf.at.least(1);
        })
        .catch(err => {
          if(err instanceof chai.AssertionError) {
            throw err;
          };
        });
    });
  });

  describe('POST endpoint', function() {
    it('Should create a new post', function() {
      const newPost = {
        author: {
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName()
        },
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraph()
      }

      return chai.request(app)
        .post('/posts')
        .send(newPost)
        .then(res => {
          expect(res).to.have.status(201);
          expect(res.body).to.be.a('object');
          expect(res.body.title).to.be.equal(newPost.title);
          expect(res.body.content).to.be.equal(newPost.content);
        })
        .catch(err => {
          if(err instanceof chai.AssertionError) {
            throw err;
          };
        });
    });
  });

  describe('DELETE endpoint', function() {
    it('Should delete a post with a given id', function() {
      return BlogPost.findOne()
        .then(post => {
          return chai.request(app)
            .delete(`/posts/${post.id}`);
        })
        .then(res => {
          expect(res).to.have.status(204);
        })
        .catch(err => {
          if(err instanceof chai.AssertionError) {
            throw err;
          };
        });
    });
  });

  describe('PUT endpoint', function() {
    const updatedPost = {
      author: {
        firstName: 'Billy',
        lastName: 'Thorn'
      },
      title: 'Updated title',
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    }

    it('Should update a post', function() {
      return BlogPost.findOne()
        .then(post => {
          updatedPost.id = post.id;

          return chai.request(app)
            .put(`/posts/${post.id}`)
            .send(updatedPost)
        })
        .then(res => {
          expect(res).to.have.status(204);
        })
        .catch(err => {
          if(err instanceof chai.AssertionError) {
            throw err;
          };
        });
    });
  });


})
