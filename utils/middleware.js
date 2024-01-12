const logger = require('./logger')
const User = require('../models/kayttaja')
const jwt = require('jsonwebtoken')
// Itse tehdyt middlewaret
const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('Authorization:  ', request.headers.authorization)
  next()
}
const tokenExtractor = (request, response, next) => {
  const authorization = request.headers.authorization
  if (authorization && authorization.startsWith('bearer ')) {
    request.token = authorization.replace('bearer ', '')
  } 
  next()
}
const userExtractor = (request, response, next) => {
  const userIdentity = jwt.verify(request.token, process.env.SECRET)
  request.user = User.findById(userIdentity.id)
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name ===  'JsonWebTokenError') {
    return response.status(400).json({ error: 'token missing or invalid' })
  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({
      error: 'token expired'
    })
  } 
  next(error)
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor
}