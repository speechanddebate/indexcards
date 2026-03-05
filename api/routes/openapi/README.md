# IndexCards Openapi

Indexcards uses an [OpenAPI 3.1](https://swagger.io/specification/) document to define it's endpoints. This document is used to:
- communicate the structure of the API to our community
- serve a scalar instance at `/v1/reference` to aid in development of the api.
- generate code on the schmats frontend for interacting with the api. (see schemats docs for more info).

The 10,000ft view is that we take the `.openapi = {...}` from each route, and, together with the other information defined in `/api/routes/openapi`, build a single document served at `/v1`.

Below are some standards to follow when defining your route.

## OpenAPI Standard

Use [OpenAPI 3.1](https://swagger.io/specification/) conventions in endpoint definitions and shared schemas.

## Where Definitions Live

- Endpoint operation snippets live with their corresponding routers. The definition for a route should live directly on the route in question.
- Shared schemas and response objects live in this `openapi` area.
- Build the generated OpenAPI document with:

```bash
npm run build:openapi
```
> [!NOTE]
> this also runs on `npm run build` && `npm run dev`

## Required For Every Operation

Each operation MUST include:

- `operationId` (unique and stable)
- `description`
- relevant `tags` (use existing tags when possible; avoid duplicates)
- complete `responses` with schema references and practical examples

## Orval-Focused Rules

These are the most important rules for frontend generation and mocks:

1. **Keep `operationId` stable.**
- Orval uses this as the generated method name.
- Changing it is a frontend breaking change.

2. **Declare `required` explicitly at the object level.**
- Non-required fields are treated as optional and can become `undefined` in mocks.

3. **Model nullability intentionally.**
- If a field can be null, declare it (`nullable: true` or OpenAPI 3.1 equivalent such as `type: ['string', 'null']`).
- Do not rely on consumers guessing from examples.

4. **Use `readOnly`/`writeOnly` when schemas are reused.**
- Example: `id` should be `readOnly` in create/update request contexts.

5. **Provide realistic examples.**
- Include examples for response bodies, nested arrays, and enums/labels.

6. **Set `additionalProperties` intentionally.**

- Use `additionalProperties: false` when object shape is strict.
- Leave it open only when extra keys are truly expected.