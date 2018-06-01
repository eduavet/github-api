require('dotenv').config();
const HapiSwagger = require('hapi-swagger')
const Hapi = require('hapi')
const Inert = require('inert')
const Vision = require('vision')

const routes = require('./routes')
const Pack = require('./package.json')


const swaggerOptions = {
  info: {
    'title': Pack.name,
    'version': Pack.version
  }
  ,documentationPath:'/'
  ,jsonEditor:true
  ,schemes : [ "http", "https" ]
}

const server = new Hapi.Server()

server.connection({
  port: +process.env.PORT || 3000,
  labels:['tcp']
})

server.register([
  Inert,
  Vision,
  {
    register:HapiSwagger
    ,options:swaggerOptions
  },
  ], err => {
  if (err) {
    throw err
  }
})

server.start(err => {
  if (err) {
    throw err
  } else {
    console.log('Server running at:', server.info.uri)
  }
})
routes.forEach( route => server.route(route) )
