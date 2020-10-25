# OpenAPI Spec HTTP Client

Feed it a JSON Spec, it will spit out a lightweight HTTP client\!

[![license][license-img]][license-url]
[![release][release-img]][release-url]
[![super linter][super-linter-img]][super-linter-url]
[![test][test-img]][test-url]
[![semantic][semantic-img]][semantic-url]

## Why

While there are plenty of *"code generators"* for OpenAPI, they create a lot of "garbage" code that you may not need,
and there while there are others that follow a similar path of this library, they still attempt to do too much\! *(like request validation before sending)*

This library does not concern itself with anything other than constructing an HTTP request and sending it\!

<details>
  <summary>FAQ</summary>
  
  - **Why no validation?**  
    You should rely on validation & sanitation at the source of truth: The OpenAPI server itself!

</details>

## What

Some feature highlights:

  - Zero dependencies\!
  - Lightweight
  - Node.js and Browser ready *(browser support coming soon)*
  - Automatic methods creation
  - Path Templating

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

### Options

Each generated method accepts an `options` object with the following properties:

| name          | type     | required | description          |
| ------------- | -------- | -------- | -------------------- |
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
