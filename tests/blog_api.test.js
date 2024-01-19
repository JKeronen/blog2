const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const helper = require('./test_helper.js')
const app = require('../app.js')
const Blog = require('../models/postaus')
const User = require('../models/kayttaja')
const { isNaN } = require('lodash')
const api = supertest(app)

const user = {
  username: helper.defaultUser[0].username,
  name: helper.defaultUser[0].name,
  password: helper.defaultUser[0].password
}
// token is stored to use for all tests
let token
beforeAll(async() => {
  // clear users and blogs fron db
  await User.deleteMany({})
  await Blog.deleteMany({})
});
// TESTS START HERE
describe('Register a new user', () => {
  test('User can be registered', async () => {
    
    await api
    .post('/api/users')
    .send(user)
    .expect(201)
  })
  test('If username already exist', async () => {
    const newUser = {
      username: helper.defaultUser[1].username,
      name: helper.defaultUser[1].name,
      password: helper.defaultUser[1].password
    }
    await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
  })
  test('Login with username and password', async () => {
    const user = {
      username: helper.defaultUser[0].username,
      password: helper.defaultUser[0].password
    }
    const response = await api
    .post('/api/login')
    .send(user)
    .expect(200)

    token = response.body.token
  })
})

describe('Inspecting blogs', () => {
  
  test('blogs can be sent to database', async () => {
    // Add two blogs to db 
    const blog1 = await api.post('/api/blogs').set("Authorization", `bearer ${token}`).send(helper.initialBlogs[0])
    const blog2 = await api.post('/api/blogs').set("Authorization", `bearer ${token}`).send(helper.initialBlogs[1])
    expect(200)
    expect(blog2.body).toBeDefined();
  })
  test('blogs are returned as json', async () => {
    await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('blogs are right counted and JSON-typed', async () => {
    const response = await api.get('/api/users')
    expect(response.body[0].blogs).toHaveLength(2)
    const typedJSON = {'content-type': 'application/json'};  
    expect(response.type).toContain(typedJSON['content-type'])
  })

  test('Id is founded', async () => {
    const response = await api.get('/api/users')
    expect(response.body[0].id).toBeDefined();
  })
})

describe('Blogs can be edit', () => {
  test('New blog can be added to database', async () => {
    
    const newBlog = {
      title: 'New Blog Title',
      author: 'Jan Keronen',
      url: 'newUrl',
      likes: 100
    }
    await api
      .post('/api/blogs').set("Authorization", `bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    // is blog added to db?  
    const updatedBlogs = await helper.blogsInDb()
    expect(updatedBlogs).toHaveLength(helper.initialBlogs.length +1)

    const blogsTitles = updatedBlogs.map(blog => blog.title)
    expect(blogsTitles).toContain('New Blog Title')
  })
  test('Blog can be deleted from database', async () => {
    const blogs = await helper.blogsInDb();
    const lastBlog = blogs[blogs.length-1]
    await api   
      .delete(`/api/blogs/${lastBlog.id}`).set("Authorization", `bearer ${token}`)
      .expect(204)
    //is blog removed?  
    const blogsDeleted = await helper.blogsInDb();
    expect(blogsDeleted.length).toBe(2)
  })
  test('Blog can be modified', async () => {
    const blogs = await helper.blogsInDb();
    const lastBlog = blogs[blogs.length-1]
    lastBlog.likes++;
    await api   
      .put(`/api/blogs/${lastBlog.id}`).set("Authorization", `bearer ${token}`)
      .send(lastBlog)
      .expect(200)
    //is blog updated?  
    const blogsUpdated = await helper.blogsInDb();
    expect(blogsUpdated[1].likes).toBe(3)
  })
})

describe('Faulty using is right handled', () => {
  test('New blog without "likes" value', async () => {
    
    const newBlogWithoutLikes = {
      title: 'New Blog Title',
      author: 'Jan Keronen',
      url: 'newUrl'
    }
    const response = await api
      .post('/api/blogs').set("Authorization", `bearer ${token}`)
      .send(newBlogWithoutLikes)
      .expect(201)

    // löytyykö lisäys ja onko arvo null (controllers/routes)
    const updatedBloglist = await helper.blogsInDb()
    const blogsIds = updatedBloglist.map(blog => blog.id)
    expect(blogsIds).toContain(response.body.id)

    const blogsLikes = updatedBloglist.map(blog => blog.likes)
    expect(blogsLikes).not.toContain(null)
  })

  test('Incorrect blog gives fault message', async () => {

    const newIncorrectBlog = {
      author: 'Matti Meikäläinen',
      likes: 1
    }
    await api
      .post('/api/blogs')
      .send(newIncorrectBlog)
      .expect(400)
  })
})
afterAll(async() => { 
  mongoose.connection.close()
})