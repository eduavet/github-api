const fs = require('fs');
const fetch = require('node-fetch');
const { request, GraphQLClient } =  require('graphql-request');
const download = require('download');
const Utils = require('../utils/githubUtils.js');

const API_URL = 'https://api.github.com/graphql';
const Github = {}

Github.login = (request, reply) => {
  const client = process.env.CLIENT;
  const redirect = 'http://localhost:3000/github/code';
  const state = Math.random().toString(36);
  const scope = 'repo write:repo_hook'
  reply.redirect(`https://github.com/login/oauth/authorize?client_id=${client}&redirect_uri=${redirect}&scope=${scope}&state=${state}`);
}

Github.code = (request, reply) => {
  const { code } = request.query;
  const client = process.env.CLIENT;
  const secret = process.env.SECRET;

  fetch(`https://github.com/login/oauth/access_token?client_id=${client}&client_secret=${secret}&code=${code}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json'
    }
  })
    .then(token => {
      token.buffer()
        .then(response => {
          const accessToken = JSON.parse(response.toString()).access_token;
          process.env.TOKEN = accessToken;
          reply(accessToken);
        })
        .catch(console.error);
    })
    .catch(console.error);
}

Github.repos = (request, reply) => {
  return Utils.getRepos(process.env.TOKEN, reply);
}

Github.repoBranches = (request, reply) => {
  const { repo } = request.payload;
  return Utils.getBranches(process.env.TOKEN, repo, reply);
}

Github.repoDownload = (request, reply) => {
  const { username, repo } = request.payload;
  const url = `https://api.github.com/repos/${username}/${repo}/tarball`
  return download(url, 'downloads')
    .then(() => reply('downloaded'))
    .catch(console.error);
}

Github.organizations = (request, reply) => {
  return Utils.getOrgs(process.env.TOKEN, reply);
}

Github.createHook = (request, reply) => {
  const { username, repo, url } = request.payload;
  const body = {
    "name": "web",
    "config": {
      "url": url,
      "content_type": "json"
    }
  };

  fetch(`https://api.github.com/repos/${username}/${repo}/hooks`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Authorization': `Bearer ${process.env.TOKEN}`,
      'Content-Type': 'application/json',
    }
  })
    .then(response => response.json())
    .then(reply)
    .catch(console.error);
}

Github.deleteHook = (request, reply) => {
  fetch(`https://api.github.com/repos/eduavet/empty-repo-3/hooks/${request.params.id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${process.env.TOKEN}`,
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      const { status } = response;
      if (status === 204) {
        reply().code(status);
      } else if (status === 404) {
        reply('Not Found').code(status);
      } else reply(response);
    })
    .catch(console.error);
}

module.exports = Github;
