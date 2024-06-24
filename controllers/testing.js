const testRouter = require('express').Router()
const Blog = require('../models/postaus')
const User = require('../models/kayttaja')

testRouter.post('/reset', async (request, response) => {
  await Blog.deleteMany({})
  await User.deleteMany({})
  response.status(204).end()
})

module.exports = testRouter