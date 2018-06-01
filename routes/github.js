const Api = require('../api');
const Joi = require('joi');
const routes = [];


routes.push({
  method: 'GET',
  path: '/github/login',
  config: {
    tags: ['api', 'mut', 'github'],
    handler: Api.github.login,
  },
});

routes.push({
  method: 'GET',
  path: '/github/code',
  config: {
    tags: ['api', 'mut', 'github'],
    handler: Api.github.code,
  },
});

routes.push({
  method: 'GET',
  path: '/github/repos',
  config: {
    tags: ['api', 'mut', 'github'],
    handler: Api.github.repos,
  },
});

routes.push({
  method: 'GET',
  path: '/github/repo-branches',
  config: {
    tags: ['api', 'mut', 'github'],
    handler: Api.github.repoBranches,
  },
});

routes.push({
  method: 'POST',
  path: '/github/create-hook',
  config: {
    tags: ['api', 'mut', 'github'],
    handler: Api.github.createHook,
  },
});

routes.push({
  method: 'DELETE',
  path: '/github/delete-hook/{id}',
  config: {
    tags: ['api', 'mut', 'github'],
    handler: Api.github.deleteHook,
    validate: {
      params: {
        id: Joi.number().required()
      },
    },
  },
});

module.exports = routes;
