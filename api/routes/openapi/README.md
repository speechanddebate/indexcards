# Indexcards OpenAPI Standards

Indexcards uses an [OpenAPI 3.1](https://swagger.io/specification/) document to define its endpoints. This document is used to:
- communicate the structure of the API to our community
- serve a scalar instance at `/v1/reference` to aid in development of the api.
- generate code on the schmats frontend for interacting with the api. (see schemats docs for more info).

The 10,000ft view is that we take the `.openapi = {...}` from each route, and, together with the other information defined in [`/api/routes/openapi`](/api/routes/openapi/), build a single document served at `/v1`.

Below are some standards to follow when defining your route.

# Defining the Endpoint
There are a couple of things the should be defined on each endpoint:

#### `path`
The full path after the version identifier with path parameters replaced. If the endpoint can be called at `/v1/foo/:barId` the path should be `path: 'foo/{barId}`

	> [!WARN]
	> This is not actually put in the openapi document but it is how the generator function builds the document. If this is not present, the generator will skip this endpoint
#### `OperationId` 
The programmatic name of the operation, used to generate code on the frontend. The operationId should match the path in the following form. If the path is `/tab/foo/{fooId}/bars` then the operationId should be `tabFooBars`.
#### `summary` 
A human readable name for the operation. Likely a non-camelCase version of the operationId.
- **`description:`** This can be a longer form explanation of the endpoint.
#### `tags`
Tags are how endpoints are organized in scalar
#### `parameters`
The parameters the endpoint accepts.

	>[!NOTE]
	> The path parameters for each route are automatically added and do not need to be specified.
#### `responses`
The various response types for an endpoint

A good example of what a openapi definition can look like are:
```js

router.route('/:personId').get(controller.getParadigmByPersonId).openapi = {
	path: '/rest/paradigms/{personId}',
	summary: 'Get paradigm details by person ID',
	operationId: 'getParadigm',
	tags: ['Paradigms'],
	responses: {
		200: {
			description: 'Paradigm details for the specified person ID',
			content: {
				'application/json': {
					schema: {'$ref': '#/components/schemas/ParadigmDetails'},
				},
			},
		},
		404: { $ref: '#/components/responses/NotFound' },
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
};
```
If more detail is needed on what a valid spec looks like, consult the openapi 3.1 specification.

## Where Definitions Live

- Endpoint operation snippets live with their corresponding routers. The definition for a route should live directly on the route in question.
```js
router.route('/:personId').get(controller.getParadigmByPersonId).openapi = {
	//openapi definition
};
```
- Shared schemas and response objects live in this `openapi` area.
- Build the generated OpenAPI document with:


```bash
npm run build:openapi
```

## Schemas
Schemas are defined by attaching a Zod object to various locations in the `.openapi = {...}` block. the request schemas can additionally be validated on each request by callid the `ValidateRequest`middleware on the endpoint like so:
```js
router.route('/foo').post(ValidateRequest, postFoo).openapi = {...};
```
this will parse against the schemas defined for the params and body, returning 400 if they fails.

### defining param schemas
to validate request params, attach a zod schema to `requestParams`in the openapi block and call ValidateRequest like so 
```js
router.route('/:fooId').get(ValidateRequest, c.getFoo).openapi = {
	path: '/rest/foos/{fooId}',
	//...
	requestParams: {
		path: z.object({ circuitId: z.coerce.number().positive() }),
	},
	//...
};
```
Note: The path and query params are seperate objects under the schema. This must be adhered to to work properly.

To define a route with a zod schema, the response definition would look like this:
```js
	responses: {
		200: {
			description: 'Foo details',
			content: {
				'application/json': {
					schema: fooSchema,
				},
			},
		},
		...
```
with fooSchema being the imported Zod schema. This schema then gets converted to the openapi def at buildtime via [zod-openapi](https://www.npmjs.com/package/zod-openapi). If using a zod schema, the response should be parsed in the controller to ensure adherence. The are some unsupported Zod methods that should be avoided, see [the docs](https://zod.dev/json-schema#ztojsonschema) for more info.

### Zod notes

adding `.meta({...})` to a schema/fields allows adding openapi metadata. For example, to add a description to a fields do 
```js 
	foo: z.string().meta({
		description: 'this is a description of the foo field',
	}),
```
zod schemas will default to being converted to inline definitions, if you would like it to be created as a model (it is a reusable schema), ad an Id to the metadata of the schema.
```js
export const fooSchema = z.object({
	...
}).meta({
	//the id will be the name of the model
	id: 'Foo',
});
```

#### nullability 

Zod and OpenAPI make a distinction between `null` and `undefined`. consult the table below to determine which one to use.

| Zod method   | in `required: []`?         | `type: null`?         | Can be `undefined`? | Can be `null`? |
|--------------|----------------------------|:---------------------:|:------------------:|:-------------:|
| .optional()  | ❌ (not required)           | ❌ (unless also nullable) | ✅                | ❌ (unless also nullable) |
| .nullable()  | ✅ (required)               | ✅                    | ❌                 | ✅            |
| .nullish()   | ❌ (not required)           | ✅                    | ✅                 | ✅            |
| none         | ✅ (required)               | ❌                    | ❌                 | ❌            |

## Orval-Focused Rules

These are the most important rules for frontend generation and mocks:

1. **Keep `operationId` stable.**
- Orval uses this as the generated method name.
- Changing it is a frontend breaking change.

2. **Declare `required` explicitly at the object level.**
- Non-required fields are treated as optional and can become `undefined` in mocks.

3. **Model nullability intentionally.**
- If a field can be null, declare it (`type: ['string', 'null']`).
- Do not rely on consumers guessing from examples.

4. **Use `readOnly`/`writeOnly` when schemas are reused.**
- Example: `id` should be `readOnly` in create/update request contexts.

5. **Provide realistic examples.**
- Include examples for response bodies, nested arrays, and enums/labels.

6. **Set `additionalProperties` intentionally.**

- Use `additionalProperties: false` when object shape is strict.
- Leave it open only when extra keys are truly expected.

