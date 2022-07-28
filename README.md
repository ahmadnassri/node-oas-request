# OpenAPI Spec HTTP Client

Feed it a JSON Spec, it will spit out a lightweight HTTP client!

[![license][license-img]][license-url]
[![release][release-img]][release-url]
[![semantic][semantic-img]][semantic-url]

## Why

While there are plenty of *"code generators"* for OpenAPI Specification, they create a lot of "garbage" code that you may not need,
and there while there are others that follow a similar path of this library, they still attempt to do too much! *(like request validation before sending)*

This library does not concern itself with anything other than constructing an HTTP request and sending it!

<details>
  <summary><strong>FAQ</strong></summary>

-   **Why no validation?**  
    You should rely on validation & sanitation at the source of truth: *The API server itself!*

-   **YAML Support?**  
    This package **does not** natively support OpenAPI Specification YAML format, but you can easily convert to JSON before calling `oas-rqeuest`

      <details>
        <summary>Example</summary>

    ###### using [`YAML`][]

    ``` js
    const YAML = require('yaml')
    const { readFile } = require('fs/promises')

    const file = await readFile('openapi.yml', 'utf8')

    const spec = YAML.parse(file)

    const OASRequest = require('oas-request')(spec)
    ```

    ###### using [`apidevtools/swagger-cli`][]

    ``` bash
    npx apidevtools/swagger-cli bundle spec/openapi.yml --outfile spec.json
    ```

      </details>

    </details>

## What

Some feature highlights:

-   Automatic methods creation
-   Path Templating
-   uses [`cross-fetch`][] for all HTTP operations

## Usage

<details>
  <summary><em>e.g. <code>petstore.json</code></em></summary>

``` json
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

``` js
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

``` js
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

Construct a new instance of the API request, returns an Object with auto generated method names matching each of the unique OpenAPI Specification [`operationId`][]

<details>
<summary><em>Example</em></summary>

###### `spec.json`

``` json
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

``` js
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

| property      | type             | required | default           | description                                                             |
|---------------|------------------|----------|-------------------|-------------------------------------------------------------------------|
| **`client`**  | `Function`       | ✗        | [`unfetch`][]     | a Function that executes the HTTP request. *(see [`clientFunction`][])* |
| **`server`**  | `String｜Object` | ✗        | `spec.servers[0]` | Root server url String, or [`Server Object`][]                          |
| **`headers`** | `Object`         | ✗        | `{}`              | Global HTTP request headers *(used with every request)*                 |
| **`query`**   | `Object`         | ✗        | `{}`              | Global Query String *(used with every request)*                         |
| **`params`**  | `Object`         | ✗        | `{}`              | Global [Path Templating][] parameters *(used with every request)*       |

##### `clientFunction`

a `Function` with the signature: `Function(url, requestOptions)` to execute the HTTP request, the default built-in function uses [`cross-fetch`][], you can customize the client to use whatever HTTP library you prefer.

> **⚠️ Note**:
>
> -   `url` is an instance of [`URL`][]
> -   `options.query` will be processed to construct the `url`, then deleted.
> -   `options.params` will be processed and used in Path Templating, then deleted.

<details>
<summary><em>Example: always assume JSON</em></summary>

``` js
const spec = require('./petstore.json')
const fetch = require('cross-fetch')
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

``` js
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

> ***⚠️ Note**: This is not the same as OpenAPI Specification's [Server Object][], though it's similarly structured*

| property        | type     | required | description                                          |
|-----------------|----------|----------|------------------------------------------------------|
| **`url`**       | `String` | ✓        | Root server url                                      |
| **`variables`** | `Object` | ✗        | Key-value pairs for server URL template substitution |

### `__Operation__(requestOptions)`

-   Operation method names are generated from the unique OpenAPI Specification [`operationId`][]
-   Operations method will return with a call to the specified [`Client Function`][]

#### `requestOptions`

The `requestOptions` Objects maps to [Fetch `init` parameter][] with some special considerations:

-   `method` will always be set based on the OpenAPI Specification method for this operation
-   `query` is a special property used to construct the final URL
-   `params` is a special property used to construct the final URL Path *(Path Templating)*

## Full Example

``` js
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

  [`YAML`]: https://www.npmjs.com/package/yaml
  [`apidevtools/swagger-cli`]: https://www.npmjs.com/package/@apidevtools/swagger-cli
  [`cross-fetch`]: https://github.com/lquixada/cross-fetch
  [`operationId`]: http://spec.openapis.org/oas/v3.0.3#operation-object
  [`unfetch`]: #clientFunction
  [`clientFunction`]: #clientfunction
  [`Server Object`]: #serverobject
  [Path Templating]: http://spec.openapis.org/oas/v3.0.3#path-templating
  [`URL`]: https://developer.mozilla.org/en-US/docs/Web/API/URL
  [Server Object]: http://spec.openapis.org/oas/v3.0.3#server-object
  [`Client Function`]: clientFunction
  [Fetch `init` parameter]: https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters

----
> Author: [Ahmad Nassri](https://www.ahmadnassri.com/) &bull;
> Twitter: [@AhmadNassri](https://twitter.com/AhmadNassri)

[license-url]: LICENSE
[license-img]: https://badgen.net/github/license/ahmadnassri/node-oas-request

[release-url]: https://github.com/ahmadnassri/node-oas-request/releases
[release-img]: https://badgen.net/github/release/ahmadnassri/node-oas-request

[semantic-url]: https://github.com/ahmadnassri/node-oas-request/actions?query=workflow%3Arelease
[semantic-img]: https://badgen.net/badge/📦/semantically%20released/blue
