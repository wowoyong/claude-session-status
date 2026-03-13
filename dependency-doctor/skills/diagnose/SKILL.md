# Skill: Dependency Doctor - Full Diagnosis

## Description

A comprehensive dependency health diagnosis workflow that scans, analyzes, and produces actionable upgrade plans for multi-language projects.

## Triggers

- `/diagnose` - Run full dependency diagnosis
- `/dep-doctor` - Alias for diagnose
- `/dependency-doctor` - Alias for diagnose

## Workflow

Execute the following phases sequentially. Each phase builds on the results of the previous one. Present findings to the user after each phase before proceeding.

---

### Phase 1: Ecosystem Detection and Dependency Scan

**Goal:** Identify all dependency manifests and lock files in the project.

1. Search the project root and subdirectories for dependency manifest files:
   - `package.json` + `package-lock.json` / `yarn.lock` / `pnpm-lock.yaml` (Node.js/npm)
   - `requirements.txt` / `Pipfile` / `pyproject.toml` / `setup.py` / `setup.cfg` (Python)
   - `Gemfile` / `Gemfile.lock` (Ruby)
   - `Cargo.toml` / `Cargo.lock` (Rust)
   - `go.mod` / `go.sum` (Go)
   - `composer.json` / `composer.lock` (PHP)
   - `pom.xml` / `build.gradle` / `build.gradle.kts` (Java/Kotlin)

2. For each detected manifest, extract:
   - Total number of direct dependencies
   - Total number of dev dependencies
   - Lock file presence and freshness (compare timestamps)
   - Workspace/monorepo detection (lerna.json, pnpm-workspace.yaml, workspaces in package.json)

3. Present a summary table:
   ```
   Ecosystem    | Manifest         | Direct Deps | Dev Deps | Lock File
   -------------|------------------|-------------|----------|----------
   npm          | package.json     | 12          | 8        | Yes (fresh)
   pip          | requirements.txt | 5           | 2        | N/A
   ```

---

### Phase 2: Vulnerability Scanning

**Goal:** Identify known security vulnerabilities in all dependencies.

Delegate to the `vulnerability-scanner` agent for deep analysis.

1. For **npm/Node.js** projects:
   - Run `npm audit --json` (or `yarn audit --json` / `pnpm audit --json`)
   - Parse severity levels: critical, high, moderate, low
   - Extract CVE identifiers and advisory URLs
   - Check if `npm audit fix` can resolve issues automatically

2. For **Python** projects:
   - Run `pip-audit --format=json` if available, otherwise parse `pip list --outdated --format=json`
   - Cross-reference with PyPI advisory database
   - Check for known vulnerable version ranges

3. For **Ruby** projects:
   - Run `bundle audit check` if bundler-audit is available
   - Parse output for CVE references

4. For **other ecosystems**:
   - Use `cargo audit` for Rust
   - Use `go vuln check` or `govulncheck` for Go
   - Use `composer audit` for PHP

5. Present vulnerability report:
   ```
   VULNERABILITY REPORT
   ====================

   CRITICAL (action required immediately):
   - lodash@4.17.15 - CVE-2021-23337 (Prototype Pollution)
     Fix: upgrade to >=4.17.21
     Advisory: https://github.com/advisories/GHSA-...

   HIGH:
   - axios@0.21.1 - CVE-2021-3749 (ReDoS)
     Fix: upgrade to >=0.21.2

   Summary: 2 critical, 1 high, 3 moderate, 0 low
   ```

---

### Phase 3: Outdated Dependency Detection

**Goal:** Identify all outdated dependencies and classify update types.

1. For **npm** projects:
   - Run `npm outdated --json` to get current, wanted, and latest versions
   - Classify each outdated package:
     - **Patch**: x.y.Z changes (bug fixes, safe to update)
     - **Minor**: x.Y.0 changes (new features, generally safe)
     - **Major**: X.0.0 changes (breaking changes, requires analysis)

2. For **Python** projects:
   - Run `pip list --outdated --format=json`
   - Compare installed vs latest versions

3. For **Ruby** projects:
   - Run `bundle outdated --parseable`

4. For **other ecosystems**:
   - `cargo outdated` for Rust
   - `go list -m -u all` for Go
   - `composer outdated --format=json` for PHP

5. Present outdated dependency report grouped by severity:
   ```
   OUTDATED DEPENDENCIES
   =====================

   Major Updates (breaking changes likely):
   - react: 17.0.2 -> 18.2.0 (1 major version behind)
   - webpack: 4.46.0 -> 5.88.0 (1 major version behind)

   Minor Updates (new features, generally safe):
   - express: 4.17.1 -> 4.18.2

   Patch Updates (bug fixes, safe):
   - lodash: 4.17.20 -> 4.17.21
   ```

---

### Phase 4: Dependency Tree Analysis

**Goal:** Detect structural problems in the dependency tree.

1. **Circular dependency detection:**
   - For npm: analyze `npm ls --all --json` output for circular references
   - For Python: analyze import graphs using manifest data
   - Flag any circular dependency chains

2. **Duplicate package detection:**
   - For npm: run `npm ls --all --json` and detect multiple versions of the same package
   - Report which top-level dependencies cause version duplication
   - Estimate bundle size impact of duplicates

3. **Unused dependency detection:**
   - For npm: cross-reference package.json dependencies with actual imports in source code
     - Scan `src/`, `lib/`, `app/` directories for `require()` and `import` statements
     - Check for usage in config files (webpack, babel, eslint, jest, etc.)
     - Check for bin scripts and CLI tool usage
   - For Python: cross-reference requirements with actual imports
   - **Important:** Some dependencies are used indirectly (plugins, peer deps, type definitions). Flag these as "potentially unused" rather than "definitely unused"

4. **License compatibility check:**
   - Extract license information from each dependency
   - Flag potentially problematic licenses:
     - GPL/AGPL in non-GPL projects (copyleft contamination risk)
     - SSPL in commercial projects
     - Unknown/missing licenses
   - Present license distribution:
     ```
     LICENSE DISTRIBUTION
     ====================
     MIT: 45 packages
     ISC: 12 packages
     Apache-2.0: 8 packages
     BSD-3-Clause: 3 packages
     GPL-3.0: 1 package (WARNING)
     Unknown: 2 packages (WARNING)
     ```

5. Present structural health report:
   ```
   DEPENDENCY TREE HEALTH
   ======================
   Circular Dependencies: 0 detected
   Duplicate Packages: 3 (estimated +120KB bundle impact)
   Potentially Unused: 2 packages (ts-node, @types/jest - verify manually)
   License Issues: 1 GPL package in MIT project
   ```

---

### Phase 5: Upgrade Plan Generation

**Goal:** Produce a prioritized, safe upgrade plan.

Delegate to the `upgrade-planner` agent for detailed planning.

1. **Priority scoring** - score each upgrade by:
   - Security severity (critical=100, high=75, moderate=50, low=25)
   - How far behind current version is (major versions behind * 20)
   - Number of dependents in the project (widely used = higher priority)
   - Ease of upgrade (patch=easy, minor=moderate, major=complex)

2. **Safe upgrade order:**
   - Group upgrades into tiers:
     - **Tier 1 - Immediate:** Security fixes that can be applied with no breaking changes
     - **Tier 2 - Quick wins:** Patch and minor updates with no peer dependency conflicts
     - **Tier 3 - Planned:** Major updates requiring code changes
     - **Tier 4 - Deferred:** Major updates with extensive breaking changes or blocked by other upgrades
   - Within each tier, order by dependency graph (update leaf dependencies first)
   - Identify peer dependency conflicts that would block certain upgrades

3. **Breaking change analysis** for major upgrades:
   - Read CHANGELOG.md or release notes from package repositories
   - Identify specific breaking changes relevant to the project's usage
   - Estimate migration effort (lines of code affected, number of files)

4. **Generate actionable plan:**
   ```
   UPGRADE PLAN
   ============

   Tier 1 - Immediate Security Fixes (estimated: 5 minutes)
   ---------------------------------------------------------
   1. lodash 4.17.15 -> 4.17.21
      Command: npm install lodash@4.17.21
      Risk: None (patch update, security fix)
      Test: Run existing test suite

   2. axios 0.21.1 -> 0.21.4
      Command: npm install axios@0.21.4
      Risk: None (patch update, security fix)
      Test: Run existing test suite

   Tier 2 - Quick Wins (estimated: 15 minutes)
   ---------------------------------------------
   3. express 4.17.1 -> 4.18.2
      Command: npm install express@4.18.2
      Risk: Low (minor update)
      Test: Run existing test suite, check API routes

   Tier 3 - Planned Upgrades (estimated: 2-4 hours)
   --------------------------------------------------
   4. react 17.0.2 -> 18.2.0
      Command: npm install react@18.2.0 react-dom@18.2.0
      Risk: High (major update)
      Breaking changes:
        - ReactDOM.render() deprecated, use createRoot()
        - Automatic batching behavior changed
        - Strict mode double-rendering in dev
      Files affected: ~15 files
      Migration guide: https://react.dev/blog/2022/03/08/react-18-upgrade-guide
      Test: Full test suite + manual UI testing

   Tier 4 - Deferred
   ------------------
   5. webpack 4.46.0 -> 5.88.0
      Blocked by: babel-loader compatibility
      Recommendation: Defer until babel-loader@9+ is stable
   ```

---

### Phase 6: Interactive Execution (if user approves)

**Goal:** Execute approved upgrades with verification.

1. Ask the user which tiers they want to execute
2. For each approved upgrade:
   a. Create a checkpoint (note current versions)
   b. Execute the upgrade command
   c. Run the project's test suite (`npm test`, `pytest`, `bundle exec rspec`, etc.)
   d. If tests pass: confirm success and move to next upgrade
   e. If tests fail:
      - Show test failure output
      - Ask user whether to:
        - Attempt to fix the issue
        - Rollback this specific upgrade
        - Stop all upgrades
   f. After all upgrades, run a final full test suite

3. Generate a summary of completed upgrades:
   ```
   UPGRADE SUMMARY
   ===============
   Completed: 5/7 upgrades
   Skipped: 1 (webpack - deferred)
   Rolled back: 1 (react - test failures in ComponentX)

   Security vulnerabilities fixed: 3/3
   Dependencies updated: 4
   ```

---

## Output Format

Always present results using clear section headers, tables where appropriate, and actionable commands. Use severity indicators:
- `[CRITICAL]` - Immediate action required
- `[HIGH]` - Should be addressed soon
- `[MODERATE]` - Plan to address
- `[LOW]` - Nice to have
- `[INFO]` - Informational only

## Error Handling

- If a package manager command is not available, inform the user and suggest installation
- If a lock file is missing, warn about potential version inconsistencies
- If running in a monorepo, process each workspace independently
- If network access is limited, fall back to local-only analysis (lock file parsing)

## Important Notes

- Never modify dependency files without explicit user approval
- Always show the full command before executing it
- Preserve the user's package manager preference (npm vs yarn vs pnpm)
- For monorepos, ask which workspaces to analyze or analyze all
- All vulnerability data should reference specific CVE/GHSA identifiers when available
