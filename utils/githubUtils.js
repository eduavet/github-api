const { request, GraphQLClient } =  require('graphql-request');

const API_URL = 'https://api.github.com/graphql';

const Utils = {};
module.exports = Utils;

Utils.getRepos = (accessToken, reply) => {
  const client = new GraphQLClient(API_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const repos = [];

  const fetchPages = (endCursor) => {
    const query = `{
      viewer {
        repositories(first: 100${endCursor ? `, after: "${endCursor}"` : '' }, affiliations: OWNER) {
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

Utils.getOrgs = (accessToken, reply) => {
  const client = new GraphQLClient(API_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const orgs = [];

  const fetchPages = (endCursor) => {
    const query = `{
      viewer {
        login
        repositories(first: 100, affiliations: [ORGANIZATION_MEMBER, OWNER]${endCursor ? `, after: "${endCursor}"` : '' }) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              name
              id
              owner {
                login
              }
            }
          }
        }
      }
    }`;

    client.request(query)
      .then(data => {
        orgs.push(data.viewer.login)
        const { edges } = data.viewer.repositories;
        const { hasNextPage } = data.viewer.repositories.pageInfo;
        edges.forEach(edge => {
          if (!orgs.includes(edge.node.owner.login)) {
            orgs.push(edge.node.owner.login)
          }
        });
        if (!hasNextPage) {
          reply({orgs});
        } else {
          fetchPages(data.viewer.repositories.pageInfo.endCursor)
        }
      })
      .catch(console.error)
  }
  return fetchPages();
}

Utils.getBranches = (accessToken, repo, reply) => {
  const client = new GraphQLClient(API_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const branches = [];

  const query = `{
      viewer {
        repository(name: "${repo}") {
          refs(first: 100, refPrefix:"refs/heads/") {
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
