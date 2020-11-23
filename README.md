# OpenAPI Spec HTTP Client

Feed it a JSON Spec, it will spit out a lightweight HTTP client!

[![license][license-img]][license-url]
[![release][release-img]][release-url]
[![super linter][super-linter-img]][super-linter-url]
[![test][test-img]][test-url]
[![semantic][semantic-img]][semantic-url]

## Why

While there are plenty of *"code generators"* for OpenAPI, they create a lot of "garbage" code that you may not need,
and there while there are others that follow a similar path of this library, they still attempt to do too much! *(like request validation before sending)*

This library does not concern itself with anything other than constructing an HTTP request and sending it!

<details>
  <summary>FAQ</summary>

-   **Why no validation?**  
    You should rely on validation & sanitation at the source of truth: The OpenAPI server itself!

</details>

## What

Some feature highlights:

-   Zero dependencies!
-   Lightweight
-   Node.js and Browser ready *(browser support coming soon)*
-   Automatic methods creation
-   Path Templating

## Usage

``` js
const spec = require('./petstore.json')
const API = require('oas-request')(spec)

// define root server url
const client = new API('https://httpbin.org')

// auto generated methods matching your OAS operationIds
await client.listPets(options)
await client.createPets(options)
await client.showPetById(options)
```

#### Yaml Support?

<details>
  <summary>This package does not support OAS Yaml format, but you can easily convert to JSON before calling `oas-rqeuest`</summary>

###### using [`js-yaml`][]

``` js
const yaml = require('js-yaml')
const fs   = require('fs')

const spec = yaml.safeLoad(fs.readFileSync('openapi.yml', 'utf8'))


const API = require('oas-request')(spec)
```

###### using [`apidevtools/swagger-cli`][]

``` bash
npx apidevtools/swagger-cli bundle spec/openapi.yml --outfile spec.json
```

</details>

### Options

Each generated method accepts an `options` object with the following properties:

| name          | type     | required | description          |
|---------------|----------|----------|----------------------|
| **`body`**    | `Object` | ❌        | HTTP request body    |
| **`headers`** | `Object` | ❌        | HTTP request headers |
| **`params`**  | `Object` | ❌        | Path parameters      |
| **`query`**   | `Object` | ❌        | Query String         |

## Examples

###### OAS 3.x

``` js
{
  "/pets/{petId}": {
    "get": {
      "operationId": "getPetById",
      ...
    },
    "put": {
      "operationId": "updatePetById",
      ...
    }
  }
}
```

###### Your App

``` js
const spec = require('./petstore.json')
const API = require('oas-request')(spec)

// define root server url
const client = new API('https://httpbin.org')

// auto generated methods matching your OAS operationIds
await client.getPetById({
  params: { petId: 'my-pet' }
})

await client.updatePetById({
  params: { petId: 'my-pet' },
  body: {
    name: "ruby",
    isGoodDog: true
  }
})
```

###### HTTP Requests

``` http
GET /pets/my-pet HTTP/1.1
Host: httpbin.org
Accept: application/json
```

``` http
PUT /pets/my-pet HTTP/1.1
Host: httpbin.org
Accept: application/json
Content-Type: application/json

{ "name": "ruby", "isGoodDog": true }
```

### Security

The API maybe protected by mechanism such as an API key, JWT Token, or simple Bearer tokens.

The library supports the following security options.

- HTTP Authorization Header `http`
  - Bearer (Implemented)
    - JWT
  - Basic (Not implemented)
- API keys in headers, query string or cookies `apiKey`
  - Headers (Implemented)
  - Query string (Implemented)
  - Cookies (Not implemented)
- OAuth 2 (Not implemented)
- OpenID Connect Discovery (Not implemented)

Security tokens can be defined as a global configuration

``` js
const spec = require('./petstore.json')
const API = require('oas-request')(spec)

// define root server url
const client = new API('https://httpbin.org', { 
  secret: 'secret', 
  jwt: { 
    exp: '5m',
    payload: {}
  }
})

// Assuming if `getPetById` has per method security defined, 
// or a global security stanza exists in the OAS.

// This will call the endpoint with the secret configured from the API constructor.
await client.getPetById({
  params: { petId: 'my-pet' }
})

// However, you have the option to override the security options per method as well.
await client.getPetById({
  params: { petId: 'my-pet' },
  secret: 'per-method-secret', 
  jwt: { 
    exp: '10m',
    payload: {}
  }
})
```

#### JWT

The library assumes that the API is protected with at most a single security method.
If you need complex security methods, submit a PR.

[`js-yaml`]: https://www.npmjs.com/package/js-yaml
[`apidevtools/swagger-cli`]: https://www.npmjs.com/package/@apidevtools/swagger-cli

----
> Author: [Ahmad Nassri](https://www.ahmadnassri.com/) &bull;
> Twitter: [@AhmadNassri](https://twitter.com/AhmadNassri)

[license-url]: LICENSE
[license-img]: https://badgen.net/github/license/ahmadnassri/node-oas-request

[release-url]: https://github.com/ahmadnassri/node-oas-request/releases
[release-img]: https://badgen.net/github/release/ahmadnassri/node-oas-request

[super-linter-url]: https://github.com/ahmadnassri/node-oas-request/actions?query=workflow%3Asuper-linter
[super-linter-img]: https://github.com/ahmadnassri/node-oas-request/workflows/super-linter/badge.svg

[test-url]: https://github.com/ahmadnassri/node-oas-request/actions?query=workflow%3Atest
[test-img]: https://github.com/ahmadnassri/node-oas-request/workflows/test/badge.svg

[semantic-url]: https://github.com/ahmadnassri/node-oas-request/actions?query=workflow%3Arelease
[semantic-img]: https://badgen.net/badge/📦/semantically%20released/blue
