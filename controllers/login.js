const loginRouter = require('express').Router()
const User = require('../models/kayttaja')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

loginRouter.post('/', async (request, response) => {
    const { username, password } = request.body
  
    const user = await User.findOne({ username })
    const passwordCorrect = user === null
      ? false
      : await bcrypt.compare(password, user.passwordHash)
    console.log(passwordCorrect)
    if (!(user || passwordCorrect)) {
      return response.status(401).json({
        error: 'invalid username or password'
      })
    }
  
    const userForToken = {
      username: user.username,
      id: user._id,
    }
    // token expires in five hour '5h'
    const token = jwt.sign(userForToken, process.env.SECRET, {expiresIn : 60*60*5})
  
    response
      .status(200)
      .json({ token: token, username: user.username, name: user.name })
  })
  
  module.exports = loginRouter