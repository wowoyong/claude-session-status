# /api-test Command

Generate integration tests and contract tests for API endpoints defined in an OpenAPI specification.

## Usage

```
/api-test [spec-path] [--framework <name>] [--runner <name>] [--output <dir>] [--only <targets>]
```

## Arguments

- `spec-path` (optional): Path to the OpenAPI spec. Default: `api/openapi.yaml`
- `--framework` (optional): Server framework. Auto-detected if omitted.
- `--runner` (optional): Test runner. Options: `vitest`, `jest`. Auto-detected from project dependencies. Default: `vitest`.
- `--output` (optional): Test output directory. Default: `api/__tests__/`
- `--only` (optional): Comma-separated targets. Options: `integration`, `contract`, `helpers`. Default: all.

## Examples

```
/api-test
/api-test --runner jest --only integration
/api-test api/openapi.yaml --framework express --output tests/api/
```

## Behavior

When this command is invoked:

### Step 1: Locate Spec and Generated Code

1. Find and parse the OpenAPI spec (same search logic as `/api-generate`).
2. Check that generated types and schemas exist. If not, suggest running `/api-generate` first.
3. Detect the test runner from `package.json` (vitest or jest).
4. Detect the server framework from `package.json`.

### Step 2: Plan Test Generation

Present a test file manifest:

```
The following test files will be generated:

api/__tests__/
├── integration/
│   ├── books.test.ts       (12 tests: CRUD + error cases)
│   ├── authors.test.ts     (10 tests: CRUD + error cases)
│   └── setup.ts            (test server setup/teardown)
├── contract/
│   ├── books.contract.ts   (response shape validation)
│   └── authors.contract.ts (response shape validation)
└── helpers/
    ├── factories.ts        (test data factory functions)
    ├── auth.ts             (mock auth token generation)
    ├── assertions.ts       (custom test assertions)
    └── db.ts               (test database utilities)

Total: ~22 tests across 4 test files

Proceed? (y/n)
```

### Step 3: Generate Tests

Delegate to the **api-generator agent** with test generation context.

#### Integration Tests

For each endpoint, generate tests covering:

**Happy path tests:**
- `POST /resource` — Creates a resource and returns 201
- `GET /resource` — Lists resources with pagination metadata
- `GET /resource/:id` — Returns a single resource by ID
- `PUT /resource/:id` — Updates a resource and returns 200
- `DELETE /resource/:id` — Deletes a resource and returns 204
- `GET /resource?filter=value` — Filters correctly (if filters are defined)

**Error case tests:**
- `POST /resource` with invalid body — Returns 400 with validation errors
- `GET /resource/:id` with nonexistent ID — Returns 404
- `PUT /resource/:id` with invalid body — Returns 400
- `DELETE /resource/:id` with nonexistent ID — Returns 404
- Any endpoint without auth token — Returns 401 (if auth is required)
- Any endpoint with insufficient permissions — Returns 403 (if roles are defined)

**Test structure:**
```typescript
describe("POST /api/v1/books", () => {
  it("should create a book and return 201", async () => {
    const payload = BookFactory.build();
    const response = await request(app)
      .post("/api/v1/books")
      .set("Authorization", `Bearer ${authToken}`)
      .send(payload)
      .expect(201);

    expect(response.body.data).toMatchObject({
      title: payload.title,
      author: payload.author,
    });
    expect(response.body.data.id).toBeDefined();
  });

  it("should return 400 for invalid request body", async () => {
    const response = await request(app)
      .post("/api/v1/books")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ invalid: true })
      .expect(400);

    expect(response.body.type).toBe("https://httpstatuses.com/400");
    expect(response.body.errors).toBeDefined();
  });
});
```

#### Contract Tests

For each endpoint, validate that the response body conforms to the Zod schema:

```typescript
describe("Contract: GET /api/v1/books", () => {
  it("should return a response matching the BookListResponse schema", async () => {
    const response = await request(app)
      .get("/api/v1/books")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    const result = BookListResponseSchema.safeParse(response.body);
    expect(result.success).toBe(true);
    if (!result.success) {
      console.error("Schema validation errors:", result.error.format());
    }
  });
});
```

#### Test Helpers

**factories.ts** — Factory functions using builder pattern:
```typescript
export const BookFactory = {
  build: (overrides?: Partial<CreateBookRequest>): CreateBookRequest => ({
    title: `Book ${randomSuffix()}`,
    isbn: generateISBN(),
    authorId: randomUUID(),
    ...overrides,
  }),
  buildList: (count: number, overrides?: Partial<CreateBookRequest>) =>
    Array.from({ length: count }, () => BookFactory.build(overrides)),
};
```

**auth.ts** — Mock authentication helpers:
```typescript
export function generateTestToken(claims?: Partial<JWTClaims>): string { ... }
export function generateExpiredToken(): string { ... }
export function generateTokenWithRole(role: string): string { ... }
```

**db.ts** — Database test utilities:
```typescript
export async function resetDatabase(): Promise<void> { ... }
export async function seedDatabase(data: SeedData): Promise<void> { ... }
export async function closeDatabase(): Promise<void> { ... }
```

### Step 4: Post-Generation

1. Print test summary with file paths and test counts.
2. Check if test dependencies are installed (`supertest`, `vitest`/`jest`). Offer to install missing ones.
3. Suggest running: `npx vitest run api/__tests__/` or `npx jest api/__tests__/`.
4. Note: "Integration tests contain TODO placeholders for database setup. Configure your test database before running."

## Output

The command produces the test files listed in the manifest, adapted to the detected test runner and framework.
