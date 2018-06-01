# GitHub api tool

#### 1. Send to GitHub auth

`GET /github/login`

Redirects here where user can login and grant the required permissions
```
https://github.com/login/oauth/authorize?client_id=${client}&redirect_uri=${redirect}&scope=${scope}&state=${state}
```

#### 2. Receive GitHub auth code

`GET /github/code`

Auth code arrives at this point after login and granting permission. Code is then used to exchange for an access token
```
POST https://github.com/login/oauth/access_token?client_id=${client}&client_secret=${secret}&code=${code}
```

#### 3. Get user repos

`GET /github/repos`

Makes GitHub GraphQL query

```
viewer {
  repositories(first: 30, affiliations: OWNER) {
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
```
If response has next page, repeat by adding `endCursor` to query
```
repositories(first: 30, after: ${endCursor}, affiliations: OWNER)
```

#### 4. Get repo branches

`GET /github/repo-branches`

Makes GitHub GraphQL query

```
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
```

#### 5. Create repo webhook

`POST /github/create-hook`

Request GitHub api to create webhook.

```
fetch(`https://api.github.com/repos/${USERNAME}/${REPOSITORY}/hooks`, {
    method: 'POST',
    body: `{
    "name": "web",
    "config": {
      "url": ${URL_TO_PING_ON_CHANGE},
      "content_type": "json"
    }
  }`,
    headers: {
      'Authorization': `Bearer ${process.env.TOKEN}`,
      'Content-Type': 'application/json'
    }
  })
```

#### 6. Delete repo webhook

`DELETE /github/delete-hook`

Request GitHub api to delete webhook.

```
fetch(`https://api.github.com/repos/${USERNAME}/{REPOSITORY}/hooks/${HOOK_ID}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${process.env.TOKEN}`,
      'Content-Type': 'application/json'
    }
  })
```
