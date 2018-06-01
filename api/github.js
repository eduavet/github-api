const fetch = require('node-fetch');
const { request, GraphQLClient } =  require('graphql-request');

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
  return getRepos(process.env.TOKEN, reply);
}

Github.repoBranches = (request, reply) => {
  const repo = "Reaction-game";
  return getBranches(process.env.TOKEN, repo, reply);
}

Github.createHook = (request, reply) => {
  const body = {
    "name": "web",
    "config": {
      "url": "http://testing-heroku-mut.herokuapp.com/receive",
      "content_type": "json"
    }
  };

  fetch(`https://api.github.com/repos/eduavet/empty-repo-3/hooks`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Authorization': `Bearer ${process.env.TOKEN}`,
      'Content-Type': 'application/json'
    }
  })
    .then(console.log)
    // .then(reply)
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

const getRepos = (accessToken, reply) => {
  const client = new GraphQLClient(API_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const repos = [];

  const fetchPages = (endCursor) => {
    const query = `{
      viewer {
        repositories(first: 30${endCursor ? `, after: "${endCursor}"` : '' }, affiliations: OWNER) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              name
              id
            }
          }
        }
      }
    }`;

    client.request(query)
      .then(data => {
        const { edges } = data.viewer.repositories;
        const { hasNextPage } = data.viewer.repositories.pageInfo;
        edges.forEach(edge => repos.push(edge.node));
        if (!hasNextPage) {
          reply({repos});
        } else {
          fetchPages(data.viewer.repositories.pageInfo.endCursor)
        }
      })
      .catch(console.error)
  }
  return fetchPages();
}

const getBranches = (accessToken, repo, reply) => {
  const client = new GraphQLClient(API_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const branches = [];

  const query = `{
      viewer {
        repository(name: "${repo}") {
          refs(first: 30, refPrefix:"refs/heads/") {
            edges {
              node {
                name
              }
            }
          }
        }
      }
    }`;

  client.request(query)
    .then(data => {
      const { edges } = data.viewer.repository.refs;
      edges.forEach(edge => branches.push(edge.node));
      reply({branches});
    })
    .catch(console.error)
}

module.exports = Github;
