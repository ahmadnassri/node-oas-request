## Why

While there are plenty of _"code generators"_ for OpenAPI Specification, they create a lot of "garbage" code that you may not need,
and there while there are others that follow a similar path of this library, they still attempt to do too much! _(like request validation before sending)_

This library does not concern itself with anything other than constructing an HTTP request and sending it!

<details>
  <summary><strong>FAQ</strong></summary>
  
  - **Why no validation?**  
    You should rely on validation & sanitation at the source of truth: _The API server itself!_

- **YAML Support?**  
      This package **does not** natively support OpenAPI Specification YAML format, but you can easily convert to JSON before calling `oas-rqeuest`

    <details>
      <summary>Example</summary>

  ###### using [`YAML`](https://www.npmjs.com/package/yaml)

  ```js
  const YAML = require('yaml')
  const { readFile } = require('fs/promises')

  const file = await readFile('openapi.yml', 'utf8')

  const spec = YAML.parse(file)

  const OASRequest = require('oas-request')(spec)
  ```

  ###### using [`apidevtools/swagger-cli`](https://www.npmjs.com/package/@apidevtools/swagger-cli)

  ```bash
  npx apidevtools/swagger-cli bundle spec/openapi.yml --outfile spec.json
  ```

    </details>

  </details>

## What

Some feature highlights:

- Automatic methods creation
- Path Templating
- uses [`isomorphic-unfetch`] for all HTTP operations

## Usage

<details>
  <summary><em>e.g. <code>petstore.json</code></em></summary>

```json
{
  "openapi": "3.0.0",
  "info": {
    "version": "1.0.0",
    "title": "Swagger Petstore"
  },
  "servers": [
    {
      "url": "http://petstore.swagger.io/{version}",
      "variables": {
        "version": {
          "description": "api version",
          "default": "v1"
        }
      }
    }
  ],
  "paths": {
    "/pets": {
      "get": {
        "operationId": "listPets",
        "parameters": [
          {
            "name": "limit",
            "in": "query",
            "description": "How many items to return at one time (max 100)",
            "required": false,
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "A paged array of pets",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Pets"
                }
              }
            }
          }
        }
      },
      "post": {
        "operationId": "createPets",
        "responses": {
          "201": {
            "description": "Null response"
          }
        }
      }
    },
    "/pets/{petId}": {
      "get": {
        "operationId": "showPetById",
        "parameters": [
          {
            "name": "petId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Expected response to a valid request",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Pet"
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "Pet": {
        "type": "object",
        "required": [
          "id",
          "name"
        ],
        "properties": {
          "id": {
            "type": "integer",
            "format": "int64"
          },
          "name": {
            "type": "string"
          },
          "tag": {
            "type": "string"
          }
        }
      },
      "Pets": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/Pet"
        }
      }
    }
  }
}
```

</details>

<br/>

```js
const spec = require('./petstore.json')
const OASRequest = require('oas-request')(spec)

// define root server url
const request = new OASRequest({
  server: 'http://petstore.swagger.io/v1'
})

// or use one from the OpenAPI Specification
const request = new OASRequest({
  server: {
    url: spec.servers[0].url
    // populate values for server (see OpenAPI Specification #4.7.5)
    variables: {
      version: 'v2'
    }
  }
})

// auto generated methods match OpenAPI Specification "operationId"
await request.listPets()
await request.createPets()
await request.showPetById()
```

<details>
<summary><em>Advanced Usage</em></summary>

```js
const spec = require('./petstore.json')
const OASRequest = require('oas-request')(spec)

// always use JSON headers
const request = new OASRequest({
  server: 'http://petstore.swagger.io/v1'
  headers: {
    'accept': 'application/json',
    'content-type': 'application/json'
  }
})

// POST with JSON
const body = JSON.stringify(body)
const response = await request.createPets({ body })
const data = await response.json()

console.log(data)
```

</details>

### `new OASRequest(APIOptions)`

Construct a new instance of the API request, returns an Object with auto generated method names matching each of the unique OpenAPI Specification [`operationId`][operation-id]

<details>
<summary><em>Example</em></summary>

###### `spec.json`

```json
{
  ...
  "paths": {
    "/pets": {
      "get": {
        "operationId": "listPets",
        ...
      },
      "post": {
        "operationId": "createPets",
        ...
      }
    },
    "/pets/{petId}": {
      "get": {
        "operationId": "showPetById",
        ...
      }
    }
  }
}
```

###### `app.js`

```js
const spec = require('./petstore.json')
const OASRequest = require('oas-request')(spec)

// define root server url
const request = new OASRequest({ server: 'http://petstore.swagger.io/v1' })

// auto generated methods match OpenAPI Specification "operationId"
await request.listPets()
await request.createPets()
await request.showPetById()
```

</details>

#### `APIOptions`

| property      | type            | required | default                      | description                                                                            |
| ------------- | --------------- | -------- | ---------------------------- | -------------------------------------------------------------------------------------- |
| **`client`**  | `Function`      | ✗        | [`unfetch`](#clientFunction) | a Function that executes the HTTP request. _(see [`clientFunction`](#clientfunction))_ |
| **`server`**  | `String｜Object` | ✗        | `spec.servers[0]`            | Root server url String, or [`Server Object`](#serverobject)                            |
| **`headers`** | `Object`        | ✗        | `{}`                         | Global HTTP request headers _(used with every request)_                                |
| **`query`**   | `Object`        | ✗        | `{}`                         | Global Query String _(used with every request)_                                        |
| **`params`**  | `Object`        | ✗        | `{}`                         | Global [Path Templating][path-templating] parameters _(used with every request)_       |

##### `clientFunction`

a `Function` with the signature: `Function(url, requestOptions)` to execute the HTTP request, the default built-in function uses [`isomorphic-unfetch`], you can customize the client to use whatever HTTP library you prefer.

> **⚠️ Note**: 
>
> - `url` is an instance of [`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL)
> - `options.query` will be processed to construct the `url`, then deleted.
> - `options.params` will be processed and used in Path Templating, then deleted.

<details>
<summary><em>Example: always assume JSON</em></summary>

```js
const spec = require('./petstore.json')
const fetch = require('isomorphic-unfetch')
const OASRequest = require('oas-request')(spec)

const request = new OASRequest({
  client: async function (url, options) {
    const response = await fetch(url, {
      ...options,

      // always set body to JSON
      body: JSON.stringify(options.body),

      headers: {
        ...options.headers,
        // always set headers to JSON
        ...{
          'accept': 'application/json',
          'content-type': 'application/json'
        }
      }
    })

    // always parse body as JSON
    response.data = await response.json()

    return response
  }
})

const response = await request.createPet({
  body { 
    id: 1,
    name: 'Ruby'
  }
})

console.log(response.data)
```

</details>

<details>
<summary><em>Example: using <code>axios</code></summary>

```js
const spec = require('./petstore.json')
const axios = require('axios')
const OASRequest = require('oas-request')(spec)

const request = new OASRequest({
  client: async function (URL, options) {
    return axios({ 
      ...options, 
      maxRedirects: 10,
      url: URL.toString(),
      httpsAgent: new https.Agent({ keepAlive: true })
    })
  }
})

const response = await request.createPet({
  data: { 
    id: 1,
    name: 'Ruby'
  },
  timeout: 1000
})
```

</details>

##### `ServerObject`

> _**⚠️ Note**: This is not the same as OpenAPI Specification's [Server Object][server-object], though it's similarly structured_

| property        | type     | required | description                                           |
| --------------- | -------- | -------- | ----------------------------------------------------- |
| **`url`**       | `String` | ✓        | Root server url                                       |
| **`variables`** | `Object` | ✗        | Key-value pairs for  server URL template substitution |

### `__Operation__(requestOptions)`

- Operation method names are generated from the unique OpenAPI Specification [`operationId`][operation-id]
- Operations method will return with a call to the specified [`Client Function`](clientFunction)

#### `requestOptions`

The `requestOptions` Objects maps to [Fetch `init` parameter](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters) with some special considerations:

- `method` will always be set based on the OpenAPI Specification method for this operation
- `query` is a special property used to construct the final URL
- `params` is a special property used to construct the final URL Path _(Path Templating)_

## Full Example

```js
const spec = require('./petstore.json')
const API = require('oas-request')(spec)

// send to httpbin so we can inspect the result
const request = new OASRequest({
  server: 'http://petstore.swagger.io/v1',
  headers: {
    'user-agent': 'my-awsome-api-client',
    'x-special-header': 'sent-with-every-request'
  }
})

await request.listPets({
  query: {
    limit: 100
  }
})

await request.getPetById({
  params: { petId: 'my-pet' }
  headers: {
    'x-additional-header': 'this operation needs this'
  }
})

await request.updatePetById({
  params: { petId: 'my-pet' },
  body: {
    name: "ruby",
    isGoodDog: true
  }
})
```

[server-object]: http://spec.openapis.org/oas/v3.0.3#server-object

[path-templating]: http://spec.openapis.org/oas/v3.0.3#path-templating

[operation-id]: http://spec.openapis.org/oas/v3.0.3#operation-object

[`isomorphic-unfetch`]: https://www.npmjs.com/package/isomorphic-unfetch
