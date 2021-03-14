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

        const API = require('oas-request')(spec)
        ```

        ###### using [`apidevtools/swagger-cli`](https://www.npmjs.com/package/@apidevtools/swagger-cli)
        
        ```bash
        npx apidevtools/swagger-cli bundle spec/openapi.yml --outfile spec.json
        ```
      </details>

  </details>

## What

Some feature highlights:

- Zero dependencies!
- Lightweight
- Node.js and Browser ready _(browser support coming soon)_
- Automatic methods creation
- Path Templating

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
const API = require('oas-request')(spec)

// define root server url
const client = new API({
  server: 'http://petstore.swagger.io/v1'
})

// or use one from the OpenAPI Specification
const client = new API({
  server: {
    url: spec.servers[0].url
    // populate values for server (see OpenAPI Specification #4.7.5)
    variables: {
      version: 'v2'
    }
  }
})

// auto generated methods match OpenAPI Specification "operationId"
await client.listPets()
await client.createPets()
await client.showPetById()
```

### `API(clientOptions)`

Construct a new instance of the api client, returns an Object with auto generated method names matching each of the unique OpenAPI Specification [`operationId`][operation-id]

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
const spec = require('./spec.json')
const API = require('oas-request')(spec)

// define root server url
const client = new API({ server: 'http://petstore.swagger.io/v1' })

// auto generated methods match OpenAPI Specification "operationId"
await client.listPets()
await client.createPets()
await client.showPetById()
```

</details>

#### `clientOptions`

| property      | type            | required | description                                                                      |
| ------------- | --------------- | -------- | -------------------------------------------------------------------------------- |
| **`server`**  | `String｜Object` | ✔        | Root server url, or [`Server Object`](#server-object)                            |
| **`headers`** | `Object`        | ✖        | Global HTTP request headers _(used with every request)_                          |
| **`query`**   | `Object`        | ✖        | Global Query String _(used with every request)_                                  |
| **`params`**  | `Object`        | ✖        | Global [Path Templating][path-templating] parameters _(used with every request)_ |

##### `ServerObject`

> _**⚠️ Note**: This is not the same as OpenAPI Specification's [Server Object][server-object], though it's similarly structured_

| property        | type     | required | description                                           |
| --------------- | -------- | -------- | ----------------------------------------------------- |
| **`url`**       | `String` | ✔        | Root server url                                       |
| **`variables`** | `Object` | ✖        | Key-value pairs for  server URL template substitution |

### `__Operation__(requestOptions)`

Operation method names are generated from the unique OpenAPI Specification [`operationId`][operation-id]

#### `requestOptions`

Each generated method accepts a `requestOptions` object with the following properties:

| name          | type     | required | description                                                                                       |
| ------------- | -------- | -------- | ------------------------------------------------------------------------------------------------- |
| **`body`**    | `Object` | ✖        | HTTP request body                                                                                 |
| **`headers`** | `Object` | ✖        | HTTP request headers _(inherits from [`clientOptions`](#clientoptions))_                          |
| **`query`**   | `Object` | ✖        | Query String _(inherits from [`clientOptions`](#clientoptions))_                                  |
| **`params`**  | `Object` | ✖        | [Path Templating][path-templating] parameters _(inherits from [`clientOptions`](#clientoptions))_ |

## Full Example

```js
const spec = require('./petstore.json')
const API = require('oas-request')(spec)

// send to httpbin so we can inspect the result
const client = new API({
  server: 'http://petstore.swagger.io/v1',
  headers: {
    'user-agent': 'my-awsome-api-client',
    'x-special-header': 'sent-with-every-request'
  }
})

await client.listPets({
  query: {
    limit: 100
  }
})

await client.getPetById({
  params: { petId: 'my-pet' }
  headers: {
    'x-additional-header': 'this operation needs this'
  }
})

await client.updatePetById({
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
