# /api-design Command

Design an OpenAPI 3.1 specification from natural language requirements.

## Usage

```
/api-design [description]
```

## Arguments

- `description` (optional): A natural language description of the API to design. If omitted, the command enters interactive mode and asks clarifying questions.

## Examples

```
/api-design A REST API for a bookstore: manage books, authors, reviews. JWT auth. Cursor pagination.
/api-design E-commerce product catalog with categories, search, and filtering
/api-design
```

## Behavior

When this command is invoked:

### Step 1: Gather Requirements

If a description is provided, extract as much as possible from it. Then ask the user to confirm or fill in any gaps for the following:

1. **Resources**: What entities/resources does this API manage? (e.g., users, products, orders)
2. **Operations**: What operations per resource? Default to full CRUD + list unless specified.
3. **Authentication**: What auth model? Options: none, API key, JWT Bearer, OAuth2. Default: JWT Bearer.
4. **Response format**: Envelope (`{ data, meta, errors }`) or direct? Default: envelope.
5. **Error format**: RFC 7807 Problem Details or custom? Default: RFC 7807.
6. **Pagination**: Cursor-based, offset-based, or keyset? Default: cursor-based.
7. **Versioning**: URL path (`/v1/`), header, or none? Default: URL path.
8. **Naming convention**: camelCase or snake_case for JSON fields? Default: camelCase.
9. **ID format**: UUID, CUID, nanoid, auto-increment? Default: UUID.

### Step 2: Design the Spec

Delegate to the **schema-designer agent** with the gathered requirements.

The agent produces a complete OpenAPI 3.1 YAML specification including:
- Info block with title, description, version
- Server URLs (localhost for development)
- Security schemes
- Reusable components (schemas, parameters, responses)
- All endpoints with full request/response definitions
- Examples for every operation

### Step 3: Review

Present the designed spec to the user as a summary table:

```
| Method | Path              | Summary                  | Auth |
|--------|-------------------|--------------------------|------|
| GET    | /api/v1/books     | List books (paginated)   | Yes  |
| POST   | /api/v1/books     | Create a new book        | Yes  |
| GET    | /api/v1/books/:id | Get book by ID           | Yes  |
| PUT    | /api/v1/books/:id | Update a book            | Yes  |
| DELETE | /api/v1/books/:id | Delete a book            | Yes  |
```

Ask: "Does this look correct? Would you like to add, remove, or modify any endpoints?"

### Step 4: Save

Save the validated OpenAPI spec to the project:

- Check if `api/` directory exists; if not, create it
- Write to `api/openapi.yaml`
- If the file already exists, show a diff and ask before overwriting
- Print: "OpenAPI spec saved to api/openapi.yaml. Run /api-generate to generate code from this spec."

## Output

The command produces:
- `api/openapi.yaml` — The complete OpenAPI 3.1 specification

## Follow-up Commands

After designing the spec, suggest:
- `/api-generate` — Generate TypeScript types, route handlers, client SDK
- `/api-test` — Generate integration and contract tests
