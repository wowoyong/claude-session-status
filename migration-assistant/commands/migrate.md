# Command: /migrate

## Description

프레임워크/라이브러리 마이그레이션을 분석하고 실행합니다.

## Usage

```
/migrate [source] [target] [options]
```

## Arguments

| Argument | Description | Example |
|----------|-------------|---------|
| `source` | 마이그레이션할 프레임워크/라이브러리 (생략 시 자동 감지) | `react`, `next`, `express`, `webpack` |
| `target` | 마이그레이션 대상 버전 또는 프레임워크 | `19`, `app-router`, `hono`, `vite` |

## Options

| Option | Description |
|--------|-------------|
| `--analyze` | 분석 단계만 실행 (변경 없음) |
| `--plan` | 분석 + 계획 단계까지만 실행 (변경 없음) |
| `--continue` | 이전에 중단된 마이그레이션 재개 |
| `--dry-run` | 실제 변경 없이 변경될 내용만 미리보기 |

## Examples

```
/migrate                        # 전체 분석 후 가능한 마이그레이션 제안
/migrate react 19               # React를 19 버전으로 마이그레이션
/migrate next app-router        # Next.js Pages Router → App Router
/migrate express hono           # Express에서 Hono로 전환
/migrate typescript             # JavaScript → TypeScript 전환
/migrate webpack vite           # Webpack에서 Vite로 전환
/migrate jest vitest            # Jest에서 Vitest로 전환
/migrate --analyze              # 분석만 실행
/migrate react 19 --dry-run     # 변경 사항 미리보기
```

## Behavior

This command triggers the `migrate` skill which follows a 4-phase workflow:

1. **Analysis** — Scans the codebase to detect the current tech stack, framework versions, and project structure.
2. **Research** — Searches for official migration guides, breaking changes, and known issues for the target migration.
3. **Planning** — Creates a detailed step-by-step migration plan and presents it for user approval.
4. **Execution** — Executes the approved plan step by step, verifying each change before proceeding.

The command always creates a git checkpoint before making any changes, so you can safely rollback if needed.

## Notes

- 마이그레이션 실행 전 항상 사용자 승인을 요청합니다
- 각 단계 실행 후 빌드/테스트 검증을 수행합니다
- 실패 시 자동으로 중단하고 원인을 분석합니다
- `git stash` 또는 checkpoint 커밋으로 롤백이 가능합니다
