# Command: /diagnose

## Usage

```
/diagnose [options]
```

## Options

- `--ecosystem <name>` - Limit scan to a specific ecosystem (npm, pip, bundler, cargo, go, composer)
- `--severity <level>` - Minimum severity to report (critical, high, moderate, low). Default: low
- `--skip-vuln` - Skip vulnerability scanning phase
- `--skip-unused` - Skip unused dependency detection
- `--skip-license` - Skip license compatibility check
- `--json` - Output results in JSON format
- `--workspace <path>` - Target a specific workspace in a monorepo

## Description

Run a comprehensive dependency health diagnosis on the current project. This command triggers the full diagnosis workflow defined in the `diagnose` skill.

## Workflow

The diagnosis runs through these phases:

1. **Ecosystem Detection** - Finds all dependency manifests (package.json, requirements.txt, Gemfile, etc.)
2. **Vulnerability Scan** - Checks all dependencies against known CVE databases
3. **Outdated Detection** - Identifies dependencies behind their latest versions
4. **Tree Analysis** - Detects circular deps, duplicates, unused packages, and license issues
5. **Upgrade Plan** - Generates a prioritized, tiered upgrade plan

## Examples

Full diagnosis of entire project:
```
/diagnose
```

Scan only npm dependencies with high+ severity:
```
/diagnose --ecosystem npm --severity high
```

Quick scan without license and unused checks:
```
/diagnose --skip-license --skip-unused
```

Target a specific monorepo workspace:
```
/diagnose --workspace packages/api
```

## Behavior

- The command is **read-only** by default. It will NOT modify any files.
- If vulnerabilities are found, it will suggest running `/upgrade` to apply fixes.
- Results are displayed incrementally as each phase completes.
- If a package manager CLI is missing, the command will warn and skip that ecosystem.

## Phase Details

### Vulnerability Scanning

Uses native audit tools for each ecosystem:
- npm: `npm audit --json`
- yarn: `yarn audit --json`
- pnpm: `pnpm audit --json`
- pip: `pip-audit --format=json`
- bundler: `bundle audit check`
- cargo: `cargo audit`
- go: `govulncheck ./...`
- composer: `composer audit --format=json`

Each vulnerability is reported with:
- Package name and installed version
- CVE/GHSA identifier
- Severity level
- Fix version (if available)
- Advisory URL

### Outdated Detection

Classifies outdated packages into:
- **Patch** updates: Bug fixes, safe to auto-update
- **Minor** updates: New features, generally safe
- **Major** updates: Breaking changes, requires migration planning

### Tree Analysis

Checks for:
- Circular dependencies in the dependency graph
- Duplicate packages (same package, different versions in the tree)
- Potentially unused dependencies (not imported in source code)
- License compatibility issues (GPL in MIT projects, unknown licenses)

### Upgrade Plan

Generates a tiered plan:
- **Tier 1**: Immediate security fixes (patch-level)
- **Tier 2**: Quick wins (safe minor/patch updates)
- **Tier 3**: Planned major upgrades
- **Tier 4**: Deferred upgrades (blocked or high-effort)

## Output

The diagnosis produces a structured report with:
- Summary statistics (total deps, outdated count, vulnerability count)
- Detailed findings for each phase
- Actionable upgrade plan with commands
- Health score (0-100) based on all factors

### Health Score Calculation

```
Base score: 100
- Each critical vulnerability: -15
- Each high vulnerability: -10
- Each moderate vulnerability: -5
- Each major version behind: -3
- Each circular dependency: -5
- Each GPL license in non-GPL project: -5
- Each unknown license: -3
- Each unused dependency: -1
```

## Related Commands

- `/upgrade` - Execute the generated upgrade plan
- `/diagnose --json` - Get machine-readable output for CI integration
