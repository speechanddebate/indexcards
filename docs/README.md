## Indexcards

- [Testing](./testing.md)
- [Project Dependencies](./dependencies.md)
- [Auth](./auth.md)
- [OpenAPI](/api/routes/openapi/README.md)

# Adding a new Path

## defining the route

When adding a new path to the API, start by defining your endpoint in the router tree. Routes are defined in `api/routers/v?/*` The file structure of `routes/` should mirror the path structure of the endpoints.

Routes are defined in the following manner:

``` js
router.route('/:fooId').get(controller.getBarByFooId).openapi = {
	path: "/bar/byFoo/{fooId}"
//... rest of the open api definition
};

```

> [!IMPORTANT]
> The path parameter is what the openapi generator uses to link this definition to the endpoint. It is critical this is supplied and in the correct format (:fooId => {fooId}).

- `router.route('/:fooId')` defines the location of the route.
- `.get(controller.controller.getBarByFooId)` defines what controller method to call. This can take multiple functions. for example, if a route should be protected by some auth middleware you can do `.get(someAuthFunction, controller.controller.getBarByFooId)`. Auth can also be applied to all routes on a router by doing `router.use(someAuthFunction)` at the top of the router.

- `.openapi = {...}` this defines the openapi definition for the endpoint. see the [OpenApi](/api/routes/openapi/README.md) README for more details.

> [!IMPORTANT]
> The OpenApi doc is how the frontend gets type information when calling endpoints. Make sure the type information is accurate. We may use libraries like [Zod](Zod.dev) to automate and validate this relationship, but for now these definitions must be made manually.

## Creating the controller

The controller is responsible for parsing and validating the request and building the response object. Simpler data access functions should be contained in a [Repo Function](#repo-functions), while heavier business logic should be in a [service function](#service-functions).

The controller should call repo and service functions as needed to construct a response matching the openapi spec created earlier.

```js
async function getBarByFooId(req, res) {
	//get the search query from the query params
	const { fooId } = req.query;
	if (!fooId) throw new BadRequest(req, res, 'FooId is required');

	const bar = await barRepo.getByFooId(fooId);
	if (!bar) return NotFound(req,res,`no bar found with fooId ${fooId}`);

	//map the result if the full object should not be returned. This is what should match the openapi spec!
	return res.json({
		id: bar.id,
		fooId: bar.fooId
	});
};
```
>[!NOTE]
> It the future it will likely be unnessicary to include such verbose request and response validation in the controller if something like [Zod](zode.dev) is implemented. But for now, it is.

## Repo Functions
Repo functions live in the `/api/repos` directory and are responsible for all interactions with the database. Repo modules should mirror the database tables with few exceptions (settings tables being the biggest). Due to the complex nature of data access patterns, and performance requirements, a lot of data functions may be in raw SQL. Every effort should be made to create reuseable and configurable functions and to document the response structure of these functions.

A repo function should be placed in the most relevant "parent table" module. for example, a getBarByFooId function should go in barRepo not fooRepo.

Every effort should be made to reuse/ modify an existing repo function to support your new use case. Create new functions only when it is not possible to reuse/modify an existing method without creating illegible code or terrible performance.

> [!NOTE]
> Many of these functions will be cached in the future. Part of the reason to contain them in a repo is to enable caching. The parameters passed into a function should be thought of as a 'key' for this data -- for a given combination of parameters, the result should always be the same.

## Service Functions

Service functions contain the business logic of tabroom.  Examples will include "Pairing a powermatched debate round" or "Compute the seeds in order for speech event." These functions should be ignorant to the request and try to minimize external dependencies.
