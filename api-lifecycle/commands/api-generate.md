# /api-generate Command

Generate TypeScript types, route handlers, validation schemas, client SDK, and documentation from an OpenAPI specification.

## Usage

```
/api-generate [spec-path] [--framework <name>] [--output <dir>] [--only <targets>]
```

## Arguments

- `spec-path` (optional): Path to the OpenAPI spec file. Default: `api/openapi.yaml`
- `--framework` (optional): Target framework. Options: `express`, `fastify`, `hono`, `nestjs`. Auto-detected from project dependencies if omitted.
- `--output` (optional): Output directory. Default: `api/`
- `--only` (optional): Comma-separated list of generation targets. Options: `types`, `handlers`, `schemas`, `client`, `docs`, `router`. Default: all.

## Examples

```
/api-generate
/api-generate api/openapi.yaml --framework hono
/api-generate --only types,schemas
/api-generate --framework nestjs --output src/api/
```

## Behavior

When this command is invoked:

### Step 1: Locate and Parse the Spec

1. Look for the OpenAPI spec at the provided path or default location (`api/openapi.yaml`).
2. If not found, check alternative locations: `openapi.yaml`, `swagger.yaml`, `api/swagger.yaml`, `docs/openapi.yaml`.
3. If still not found, tell the user: "No OpenAPI spec found. Run /api-design first to create one."
4. Parse and validate the spec. Report any structural errors.

### Step 2: Detect Framework

If `--framework` is not provided:

1. Read `package.json` to detect installed frameworks:
   - `express` → Express
   - `fastify` → Fastify
   - `hono` → Hono
   - `@nestjs/core` → NestJS
2. If multiple frameworks are found, ask the user to choose.
3. If none are found, ask the user which framework to use and offer to install it.

### Step 3: Plan Generation

Present a file manifest to the user:

```
The following files will be generated:

api/
├── types/
│   ├── index.ts          (re-exports all types)
│   ├── entities.ts       (entity/model types)
│   ├── requests.ts       (request DTO types)
│   ├── responses.ts      (response DTO types)
│   └── common.ts         (shared types: pagination, errors)
├── schemas/
│   ├── index.ts          (re-exports all schemas)
│   ├── books.schema.ts   (Zod schemas for book operations)
│   └── authors.schema.ts (Zod schemas for author operations)
├── routes/
│   ├── index.ts          (route aggregator)
│   ├── books.ts          (book route handlers)
│   └── authors.ts        (author route handlers)
├── client/
│   ├── index.ts          (API client class)
│   └── types.ts          (client configuration types)
├── middleware/
│   ├── error-handler.ts  (global error handling)
│   ├── validate.ts       (request validation middleware)
│   └── auth.ts           (authentication middleware stub)
├── docs/
│   ├── API.md            (endpoint reference)
│   └── GETTING_STARTED.md(quick start guide)
└── router.ts             (main router setup)

Proceed? (y/n)
```

Mark files that already exist with `[EXISTS - will be overwritten]` or `[EXISTS - will be merged]`.

### Step 4: Generate Code

Delegate to the **api-generator agent** with:
- The parsed OpenAPI spec
- The target framework
- The output directory
- The list of targets to generate

#### Generation Details by Target

**types**: Generate TypeScript interfaces and type aliases.
- One interface per schema component
- Union types for enums
- Generic pagination wrapper type
- Strict null checking compatible

**schemas**: Generate Zod validation schemas.
- Mirror the TypeScript types exactly
- Include `.describe()` calls with descriptions from the spec
- Include transform/refinement for complex validations
- Export both the schema and its inferred type

**handlers**: Generate route handlers specific to the framework.
- Express: `RequestHandler` functions with typed `req.params`, `req.body`, `req.query`
- Fastify: Route handlers with JSON Schema for serialization
- Hono: Handlers using `c.req.json()`, `c.json()` patterns
- NestJS: Controller classes with decorators (`@Get`, `@Post`, etc.)
- Include TODO comments for business logic
- Include proper error throwing

**client**: Generate a typed API client.
- Class-based client with method per operation
- Full TypeScript generics for request/response types
- Configurable via constructor (baseURL, headers, interceptors)
- Built on fetch API (no external dependencies)
- Error handling with typed API errors

**docs**: Generate Markdown documentation.
- Full endpoint reference with curl examples
- Getting started guide
- Authentication guide (if auth is defined)
- Error reference

**router**: Generate the main router/app setup file.
- Import and wire all route handlers
- Apply middleware in correct order
- Export the configured app/router

### Step 5: Post-Generation

After all files are written:

1. Print a summary of generated files with line counts.
2. If the framework is not installed, offer to run `npm install <framework>`.
3. If Zod is not installed, offer to run `npm install zod`.
4. Suggest next steps:
   - "Run /api-test to generate tests for these endpoints."
   - "Fill in the TODO comments in route handlers with your business logic."
   - "Run `npx tsc --noEmit` to verify type correctness."

## Output

The command produces the files listed in the manifest above, adapted to the chosen framework.
