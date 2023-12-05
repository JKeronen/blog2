const Blog = require('../models/postaus')

const initialBlogs = [
  {
    title: 'HTML is easy',
    author: 'Jimmy',
    url: 'https://fullstackopen.com/osa4/backendin_testaaminen',
    likes: 0
  },
  {
    title: 'HTML is not easy',
    author: 'Jack',
    url: 'https://fullstackopen.com/osa4/backendin_testaaminen',
    likes: 2
  }
]

const nonExistingId = async () => {
  const blog = new Blog({ title: 'willremovethissoon', author: 'Lisa Simpson' })
  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

module.exports = {
  initialBlogs, nonExistingId, blogsInDb
}