# Indexcards Auth
## Available Authentication Methods
Indexcards supports two main ways of authenticating to the API, Cookie auth and bearer token.

All user authentication is handled under `/auth` routes for example `/auth/login` and `/auth/register`.

TODO: add more details on how each of these work


## Internal Auth
This section describes auth as it is relevant to a developer working on indexcards.

# Auth flow
## Authentication
When a request comes in to indexcards, it first passes through the [<b>Authentication Middleware</b>](/api/middleware/authentication.js). where, if the user supplied credentials, they are validated and a couple of bits or information are attached to the request:
- `req.person`: the person who is making the request
- `req.session`: if this is a cookie session, attach the session
- `req.actor`: more on this in Authorization ( not yet but probably should be attached in authentication)

If credentials are provided and are invalid, the request will fail even if it is a public endpoint.

## Authorization
Authorization is a much more complicated process as it doesn't just rely on *who* you are, but *what* your relationship is to the requested data is, and even more complicated, what that data's relationship is to other data! As such we have abstracted the process of determining how a user can preform an action from needing to be defined on each route and the route must only specify **what** action permission is needed for.

##### Simple Auth
some authorization checks really are that simple and rely only on information about the *who* of a request. For these, [`Authorization.js`](/api/middleware/authorization/authorization.js) provides some simple checks like `.isSiteAdmin` or `.requireLogin`

### RBAC
For the rest of Authorization the decisions, information is needed about *who* is making the request, *what* they are requesting and *how* different permissions grant or deny certain access. For this, an api was created to allow a caller to ask "can this `actor` preform this `action` on this `resource`?" without worrying about the myriad of different ways that can be true. This is accomplished with 2 main concepts you need to know about when making a new route, `actors` and `auth contexts`.

### Actors
actors define who or what is acting on a request and provide methods for checking authorization.
>[!NOTE]
> Why actor and not person? not every operation may be initiated by a person, automated process may call the same functions or be limited to specific scopes. An actor object provides this flexibility. 

an Actor looks like this: 
```js
	req.actor =  {
		person: req.person, //if the actor is a person, who is it
		type: 'person', //what kind of actor, used to differentiate automated processes from people
		can: (resource, action, resourceId) => (),  // a function that returns a boolean on if the requested action is allowed
		assert: (resource, action, resourceId) => (),, //same as can but will throw on invalid operation
		allowedIds: (resource, action) => (),  //returns a list of resource Ids where the actor is allowed to preform the requested action on that resource WITHIN THE LOADED AUTH CONTEXT (more on what that mean later)
	};
```

for example, if you wanted to check if an actor had the ability to `read` an `event` with Id `eventId` you would call:
```js
await actor.can('event','read',eventId);
``` 
similarly, if you wanted to get all events that an actor could read (for a given authContext) you would do:
```js
await actor.allowedIds('event','read');
```
actors get attached to a request and can be passed into relevant service functions if they will need to do more fine-grained auth decision making. 

### requireAccess Helper
a common scenario is protecting an entire endpoint behind a certain action. for this you can use `requireAccess()` in the route definition as a middleware. for example:
```js
router.route('/:tournId').get(requireAccess('tourn', 'read'), tournController.getTourn)...
```
would require the actor to have read permissions on the tourn in question.
> [!NOTE]
> requireAccess works by literally taking the name of the resource (in this case 'tourn') and looking for a resource + Id path param to determine the target. as such it is required that the resource Id be both in the path and in the correct form.

## What is Auth Context?
So what the hell is this 'AuthContext' you keep talking about? simply put, the authContext is the collection of permissions that are loaded and evaluated when making authorization decisions. Think of it this way, a person may have hundreds of permissions across different tourns, chapters, circuits, etc and only a subset of those will be relevant for a given request It would also be extremely inefficient to have to look these up every time, so, the AuthContext is a way of specifying **what** permissions get loaded and evaluated for a given request. 

>[!NOTE]
> you will likely never have to worry about determining the auth context when creating route in an established tree ( under `/tab/tourns` for instance) but it is still extremely important to understand that you are not evaluating ALL of an actors permissions when making a request, but only the ones loaded into `req.auth.perms`.

more information on Auth context and creating new ones can be found in the [Implementation Details](#implementation-details) section.

# Implementation Details

These are details about *how* the RBAC system works. they are not necessary to understand to protect your new routes. but can help provide more context for how the whole system works.

TODO: actually write it

## Auth Context
functions that create and attach AuthContexts are found in [`authContext.js`](/api//middleware//authorization/authContext.js). Currently there is only one, `loadTournAuthContext(req, res, next, tournId)`.

an auth context loader works by attaching items to the `req.auth.perms` array in this format.
```js
req.auth.perms = {
	scope, //the 'scope' of the permission ie tourn, category, event, chapter etc
	id,    // the Id of that particular resource. ie if scope was tourn, this would be the tournId
	role,  // the role granted at this scope ir tabber, owner, reader etc
}
```

## checkAccess(resource, action, target, person, perms)
This is the workhorse of the whole process. It takes the who, what, and where and makes and authorization decision.

this is probably the most confusing part of the whole system and could benefit from some refinement. The benefit however is that this is a single interface to make a boolean determination on access meaning it can be completely rewritten without changing the caller and it is highly testable as it is a synchronous with rigid inputs.

## building targets
It would be inefficient to build the entire parent-child relationship of permissions on every request. It would also be inefficient to do it again for multiple checks within a single request. Therefore the building of the parent-child relationships is done on demand and the result of a certain level is cached. meaning that if we needed to build the tree for an event and then later needed to check permissions on the same event or the parent tourn, we wouldn't need another db call.

## Roles, actions, and parents oh my!
stuff about how roles and actions and parent relationships should be defined and how they work.