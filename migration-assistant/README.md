# Migration Assistant

프레임워크 및 라이브러리 마이그레이션을 자동으로 분석하고 실행하는 Claude Code 플러그인입니다.

## 개요

`migration-assistant`는 코드베이스의 프레임워크, 라이브러리, 빌드 도구 등을 안전하게 마이그레이션할 수 있도록 도와주는 Claude Code CLI 플러그인입니다. 현재 기술 스택을 자동으로 감지하고, 공식 마이그레이션 가이드를 조사한 뒤, 단계별 마이그레이션 계획을 수립하여 실행합니다.

## 지원하는 마이그레이션

| 카테고리 | 마이그레이션 예시 |
|---------|-----------------|
| 프레임워크 업그레이드 | React 18 → 19, Next.js 14 → 15, Vue 2 → 3 |
| 라우터 전환 | Next.js Pages Router → App Router, React Router v5 → v6 |
| 서버 프레임워크 | Express → Hono, Express → Fastify |
| 언어 전환 | JavaScript → TypeScript |
| 빌드 도구 | Webpack → Vite, CRA → Vite |
| 패키지 매니저 | npm → pnpm, npm → bun |
| CSS | styled-components → Tailwind, CSS Modules → Tailwind |
| 테스트 | Jest → Vitest, Enzyme → React Testing Library |
| ORM | Sequelize → Prisma, TypeORM → Drizzle |
| 기타 | Breaking change가 있는 모든 패키지 버전 업그레이드 |

## 설치

Claude Code 프로젝트의 플러그인 디렉토리에 이 저장소를 복사합니다:

```bash
# 프로젝트 루트에서
cp -r migration-assistant .claude/plugins/migration-assistant
```

또는 `.claude/settings.json`에 플러그인 경로를 추가합니다:

```json
{
  "plugins": [
    "./migration-assistant"
  ]
}
```

## 사용법

### 기본 사용

```bash
# 전체 분석 후 가능한 마이그레이션 제안
/migrate

# 특정 대상으로 마이그레이션
/migrate react 19
/migrate next app-router
/migrate express hono
/migrate typescript
/migrate webpack vite
```

### 옵션

```bash
# 분석만 실행 (코드 변경 없음)
/migrate --analyze

# 분석 + 계획까지만 (코드 변경 없음)
/migrate --plan

# 변경 사항 미리보기 (실제 변경 없음)
/migrate react 19 --dry-run

# 중단된 마이그레이션 재개
/migrate --continue
```

## 작동 방식

### 4단계 워크플로우

```
Phase 1: 분석 (Analysis)
├── 기술 스택 자동 감지
├── 프로젝트 구조 파악
└── 사용자에게 분석 결과 보고

Phase 2: 조사 (Research)
├── 공식 마이그레이션 가이드 검색
├── Breaking changes 목록화
└── 영향받는 파일 및 패턴 파악

Phase 3: 계획 (Planning)
├── 단계별 마이그레이션 계획 수립
├── 위험도 평가
└── 사용자 승인 요청

Phase 4: 실행 (Execution)
├── Git 체크포인트 생성
├── 단계별 변경 실행
├── 각 단계 검증 (빌드, 테스트)
└── 최종 마이그레이션 요약 보고
```

### 안전장치

- **사전 승인**: 모든 변경은 사용자 승인 후 실행됩니다
- **Git 체크포인트**: 실행 전 `pre-migration-*` 태그를 생성하여 언제든 롤백 가능합니다
- **단계별 검증**: 각 단계 실행 후 빌드/테스트를 통해 검증합니다
- **실패 시 중단**: 문제 발생 시 즉시 중단하고 원인을 분석합니다
- **롤백 안내**: 문제 발생 시 롤백 명령어를 안내합니다

## 플러그인 구조

```
migration-assistant/
├── .claude-plugin/
│   └── plugin.json          # 플러그인 메타데이터 및 설정
├── skills/
│   └── migrate/
│       └── SKILL.md         # 마이그레이션 스킬 정의 (전체 워크플로우)
├── commands/
│   └── migrate.md           # /migrate 명령어 정의
├── agents/
│   ├── migration-analyzer.md  # 코드베이스 분석 에이전트
│   └── migration-executor.md  # 마이그레이션 실행 에이전트
├── README.md                # 이 파일
└── LICENSE                  # MIT 라이선스
```

### 각 파일의 역할

| 파일 | 역할 |
|------|------|
| `plugin.json` | 플러그인 이름, 버전, 스킬/커맨드/에이전트 등록 정보 |
| `SKILL.md` | 마이그레이션 전체 워크플로우 정의 (분석 → 조사 → 계획 → 실행) |
| `migrate.md` | `/migrate` 명령어의 사용법, 인자, 옵션 정의 |
| `migration-analyzer.md` | 코드베이스 스캔, 기술 스택 감지, 마이그레이션 범위 평가 |
| `migration-executor.md` | 단계별 코드 변경 실행, 검증, 실패 처리, 요약 보고 |

## 예시 시나리오

### React 18 → 19 마이그레이션

```
사용자: /migrate react 19

[Phase 1: 분석]
현재 React 18.2.0이 감지되었습니다.
- 총 45개의 컴포넌트 파일
- forwardRef 사용: 8개 파일
- ReactDOM.render 사용: 1개 파일
- useContext 사용: 12개 파일

[Phase 2: 조사]
React 19 주요 변경사항:
- forwardRef 제거 (ref가 props로 전달)
- use() 훅 추가
- ref cleanup 함수 지원
- ...

[Phase 3: 계획]
Step 1: package.json 의존성 업데이트
Step 2: ReactDOM.render → createRoot 전환
Step 3: forwardRef → ref prop 전환 (8개 파일)
Step 4: 테스트 파일 업데이트
Step 5: 빌드 및 전체 테스트 검증

이 계획을 승인하시겠습니까? (y/n)

[Phase 4: 실행]
Step 1/5: package.json 업데이트... OK
Step 2/5: createRoot 전환... OK
...
```

## 제한사항

- 모노레포의 경우 각 패키지를 개별적으로 마이그레이션해야 할 수 있습니다
- 매우 커스터마이징된 빌드 설정은 수동 검토가 필요할 수 있습니다
- 비공개 또는 사내 라이브러리의 마이그레이션은 공식 가이드가 없으므로 제한적입니다
- 실행 중 네트워크 접근이 필요합니다 (마이그레이션 가이드 조사)

## 라이선스

MIT License - 자세한 내용은 [LICENSE](./LICENSE) 파일을 참조하세요.
