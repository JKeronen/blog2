const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const helper = require('./test_helper.js')
const app = require('../app.js')
const Blog = require('../models/postaus')
const User = require('../models/kayttaja')
const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})
  // add user
  let newUser = new User(helper.defaultUser[0])
  await newUser.save()
  let anotherUser = new User(helper.defaultUser[1])
  await anotherUser.save()
    // create token
  const token = jwt.sign({username: newUser.user, id: newUser._id}, process.env.SECRET, {expiresIn : 60*60*5})
  // add blogs

  await Blog.deleteMany({})

  let blogObject = new Blog({...helper.initialBlogs[0], user: newUser.user } )  
  await blogObject.save()

  blogObject = new Blog({...helper.initialBlogs[1], user: anotherUser.user } )    
  await blogObject.save()
})

describe('Inspecting blogs', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('blogs are right counted and JSON-typed', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(2)
    const typedJSON = {'content-type': 'application/json'};  
    expect(response.type).toContain(typedJSON['content-type'])
  })

  test('Id is founded', async () => {
    const response = await api.get('/api/blogs')
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
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    // löytyykö lisäys  
    const updatedBlogs = await helper.blogsInDb()
    expect(updatedBlogs).toHaveLength(helper.initialBlogs.length +1)

    const blogsTitles = updatedBlogs.map(blog => blog.title)
    expect(blogsTitles).toContain('New Blog Title')
  })
  test('Blog can be deleted from database', async () => {
    const blogs = await helper.blogsInDb();
    const lastBlog = blogs[blogs.length-1]
    await api   
      .delete(`/api/blogs/${lastBlog.id}`)
      .expect(204)
    //onko blogi poistunut?  
    const blogsDeleted = await helper.blogsInDb();
    expect(blogsDeleted.length).toBe(1)
  })
  test('Blog can be modified', async () => {
    const blogs = await helper.blogsInDb();
    const lastBlog = blogs[blogs.length-1]
    lastBlog.likes++;
    await api   
      .put(`/api/blogs/${lastBlog.id}`)
      .send(lastBlog)
      .expect(200)
    //onko blogitieto päivittynyt?  
    const blogsUpdated = await helper.blogsInDb();
    expect(blogsUpdated[1].likes).toBe(3)
  })
})

describe('Faulty using is right handled', () => {
  test('New blog without "likes" value', async () => {
    
    const newBlogWithoutLikes = {
      title: 'New Blog Title',
      author: 'Jan Keronen',
      likes:'',
      url: 'newUrl'
    }
    await api
      .post('/api/blogs')
      .send(newBlogWithoutLikes)
      .expect(201)

    // löytyykö lisäys ja onko arvo null (controllers/routes)
    const updatedBlogs = await helper.blogsInDb()
    expect(updatedBlogs).toHaveLength(helper.initialBlogs.length +1)

    const blogsLikes = updatedBlogs.map(blog => blog.likes)
    console.log(blogsLikes)
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
  //await User.deleteMany({})
  mongoose.connection.close()
})