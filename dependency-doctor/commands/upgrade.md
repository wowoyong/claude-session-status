# Command: /upgrade

## Usage

```
/upgrade [options]
```

## Options

- `--tier <number>` - Execute only a specific tier (1, 2, 3, or 4)
- `--package <name>` - Upgrade a single specific package
- `--security-only` - Only apply security-related upgrades (Tier 1)
- `--safe` - Only apply patch and minor upgrades (Tier 1 + Tier 2)
- `--all` - Apply all tiers (will prompt for confirmation on Tier 3+)
- `--dry-run` - Show what would be upgraded without making changes
- `--no-test` - Skip test verification after each upgrade (not recommended)
- `--rollback` - Rollback the last upgrade session
- `--ecosystem <name>` - Limit upgrades to a specific ecosystem

## Description

Execute dependency upgrades based on the diagnosis plan. This command should typically be run after `/diagnose` has generated an upgrade plan.

If no prior diagnosis exists, the command will automatically run a diagnosis first.

## Prerequisites

- A diagnosis should have been run first via `/diagnose`
- The project should have a working test suite for verification
- Git working directory should be clean (uncommitted changes will trigger a warning)

## Workflow

### Pre-flight Checks

1. Verify git working directory is clean (warn if not)
2. Check that a diagnosis report exists (run one if not)
3. Detect the project's test command:
   - npm: looks for `test` script in package.json
   - Python: looks for pytest, unittest, or tox configuration
   - Ruby: looks for rspec, minitest configuration
   - Rust: `cargo test`
   - Go: `go test ./...`
4. Confirm upgrade plan with the user before proceeding

### Execution Flow

For each upgrade in the approved plan:

```
Step 1: Show upgrade details
  Package: lodash
  Current: 4.17.15
  Target:  4.17.21
  Type:    Patch (security fix)
  Command: npm install lodash@4.17.21

Step 2: Execute upgrade command

Step 3: Run test suite
  Command: npm test
  Result:  PASS (47 tests, 0 failures)

Step 4: Confirm and proceed
  [OK] lodash upgraded successfully
  Proceeding to next upgrade...
```

### On Test Failure

If tests fail after an upgrade:

1. Display the test failure output (first 50 lines)
2. Present options:
   - **Fix**: Attempt to analyze and fix the test failure
   - **Rollback**: Revert this specific upgrade and continue with others
   - **Stop**: Rollback this upgrade and stop all remaining upgrades
3. If "Fix" is chosen:
   - Analyze test failure output
   - Identify likely causes (API changes, removed methods, renamed exports)
   - Suggest code changes
   - Apply changes with user approval
   - Re-run tests
4. If "Rollback" is chosen:
   - Restore the previous version of the package
   - Verify tests pass again
   - Mark upgrade as "skipped" and continue

### Rollback Mechanism

Each upgrade session records a rollback manifest:

```json
{
  "session": "2024-01-15T10:30:00Z",
  "upgrades": [
    {
      "package": "lodash",
      "ecosystem": "npm",
      "from": "4.17.15",
      "to": "4.17.21",
      "status": "completed",
      "command": "npm install lodash@4.17.21",
      "rollback": "npm install lodash@4.17.15"
    }
  ]
}
```

Running `/upgrade --rollback` will:
1. Show the last upgrade session details
2. Ask which upgrades to rollback (all or specific packages)
3. Execute rollback commands in reverse order
4. Run tests to verify rollback succeeded

## Examples

Apply only security fixes:
```
/upgrade --security-only
```

Apply all safe updates (patch + minor):
```
/upgrade --safe
```

Upgrade a single package:
```
/upgrade --package react
```

Preview what would change:
```
/upgrade --dry-run
```

Execute Tier 3 upgrades (major versions):
```
/upgrade --tier 3
```

Rollback last upgrade session:
```
/upgrade --rollback
```

## Safety Measures

1. **Git check**: Warns if there are uncommitted changes before starting
2. **One at a time**: Upgrades are applied one package at a time, not in bulk
3. **Test verification**: Tests run after each individual upgrade
4. **Instant rollback**: Any failed upgrade can be immediately reverted
5. **Session logging**: All changes are recorded for later rollback
6. **Confirmation prompts**: Major upgrades (Tier 3+) always require explicit confirmation
7. **Dependency order**: Upgrades are applied in dependency-graph order (leaves first) to avoid intermediate broken states

## Peer Dependency Handling

When an upgrade triggers peer dependency warnings:

1. Identify all affected peer dependencies
2. Check if peer deps can be co-upgraded
3. If yes: upgrade the package and its peers together
4. If no: warn the user and suggest deferring the upgrade

Example:
```
Upgrading react@17 -> react@18 requires:
  - react-dom@17 -> react-dom@18 (co-upgrade)
  - @testing-library/react@12 -> @testing-library/react@14 (co-upgrade)
  - react-router-dom@5 -> compatible (no change needed)

Proceed with co-upgrade of 3 packages? [y/N]
```

## Post-Upgrade Report

After all upgrades complete, a summary is displayed:

```
UPGRADE SESSION COMPLETE
========================
Duration: 3 minutes 42 seconds

Completed: 5 upgrades
  - lodash 4.17.15 -> 4.17.21 (security fix)
  - axios 0.21.1 -> 0.21.4 (security fix)
  - express 4.17.1 -> 4.18.2 (minor update)
  - uuid 8.3.2 -> 9.0.0 (major update)
  - dotenv 10.0.0 -> 16.3.1 (major update)

Skipped: 1
  - react 17.0.2 -> 18.2.0 (test failures - deferred)

Rolled back: 0

Security vulnerabilities fixed: 3
Test suite: PASSING (142 tests)

Next steps:
  - Review the react 18 migration guide for deferred upgrade
  - Run /diagnose to verify current health status
```

## Related Commands

- `/diagnose` - Run dependency health diagnosis first
- `/diagnose --json` - Get machine-readable diagnosis for automation
