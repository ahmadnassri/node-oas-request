## Why

While there are plenty of _"code generators"_ for OpenAPI, they create a lot of "garbage" code that you may not need,
and there while there are others that follow a similar path of this library, they still attempt to do too much! _(like request validation before sending)_

This library does not concern itself with anything other than constructing an HTTP request and sending it!

<details>
  <summary>FAQ</summary>
  
  - **Why no validation?**  
    You should rely on validation & sanitation at the source of truth: The OpenAPI server itself!

</details>

## What

Some feature highlights:

  - Zero dependencies!
  - Lightweight
  - Node.js and Browser ready _(browser support coming soon)_
  - Automatic methods creation
  - Path Templating

## Usage

```js
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

  ###### using [`js-yaml`](https://www.npmjs.com/package/js-yaml)

  ```js
  const yaml = require('js-yaml')
  const fs   = require('fs')
  
  const spec = yaml.safeLoad(fs.readFileSync('openapi.yml', 'utf8'))


  const API = require('oas-request')(spec)
  ```

  ###### using [`apidevtools/swagger-cli`](https://www.npmjs.com/package/@apidevtools/swagger-cli)
  
  ```bash
  npx apidevtools/swagger-cli bundle spec/openapi.yml --outfile spec.json
  ```
</details>

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

```js
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

```js
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

```http
GET /pets/my-pet HTTP/1.1
Host: httpbin.org
Accept: application/json
```

```http
PUT /pets/my-pet HTTP/1.1
Host: httpbin.org
Accept: application/json
Content-Type: application/json

{ "name": "ruby", "isGoodDog": true }
```
