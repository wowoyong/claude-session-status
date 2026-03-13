# claude-session-status

[Claude Code](https://claude.ai/code) CLI용 상태표시줄과 개발 워크플로우 플러그인 모음입니다.

## 구성

이 저장소는 **코어 상태표시줄 패키지**와 **5개의 Claude Code 플러그인**으로 구성되어 있습니다.

```
claude-session-status/
├── src/                        # 코어: 상태표시줄 패키지
├── api-lifecycle/              # 플러그인: API 설계 → 코드 생성 → 테스트
├── architecture-enforcer/      # 플러그인: 아키텍처 규칙 검증
├── dependency-doctor/          # 플러그인: 의존성 건강 진단
├── migration-assistant/        # 플러그인: 프레임워크 마이그레이션
└── monorepo-manager/           # 플러그인: 모노레포 워크플로우
```

---

## 코어: 상태표시줄

현재 경로, 모델명, 토큰 사용량, 컨텍스트 사용률을 한눈에 보여주는 경량 상태표시줄입니다.

```
📁 ~/WebstormProjects  🤖 Opus 4.6  📊 ↑8.5K ↓1.2K  ██████░░░░ 62%  🔋 38%
```

| 구분 | 설명 |
|------|------|
| 📁 경로 | 현재 작업 디렉토리 (홈 디렉토리는 `~`로 축약) |
| 🤖 모델 | 현재 사용 중인 Claude 모델명 |
| 📊 토큰 | 입력(↑) / 출력(↓) 토큰 수 (K/M 단위 자동 변환) |
| 프로그레스 바 | 컨텍스트 윈도우 사용률 (초록/노랑/빨강 색상) |
| 🔋 잔여량 | 컨텍스트 윈도우 남은 비율 |

### 설치

```bash
npm install -g claude-session-status
```

### 설정

`~/.claude/settings.json`에 추가:

```json
{
  "statusLine": {
    "type": "command",
    "command": "claude-session-status"
  }
}
```

설치 없이 바로 사용하려면:

```json
{
  "statusLine": {
    "type": "command",
    "command": "npx -y claude-session-status@latest"
  }
}
```

### 색상 구분

프로그레스 바는 컨텍스트 사용률에 따라 색상이 변합니다:

- **초록** (0~50%) — 여유 있음
- **노랑** (51~75%) — 주의 필요
- **빨강** (76~100%) — 부족함

---

## 플러그인

각 플러그인은 독립적으로 설치하여 사용할 수 있습니다. `.claude/plugins/` 디렉토리에 복사하거나 `.claude/settings.json`에 경로를 추가하세요.

### 설치 방법 (공통)

```bash
# 방법 1: 플러그인 디렉토리에 복사
cp -r <plugin-name> .claude/plugins/<plugin-name>

# 방법 2: settings.json에 경로 추가
{
  "plugins": [
    "./<plugin-name>"
  ]
}
```

---

### API Lifecycle

자연어 요구사항에서 프로덕션 코드까지, End-to-End API 설계 및 개발 도구입니다.

| 커맨드 | 설명 |
|--------|------|
| `/api-design` | 자연어 → OpenAPI 3.1 스펙 설계 |
| `/api-generate` | 스펙 → TypeScript 타입, 핸들러, 클라이언트 SDK 생성 |
| `/api-test` | 통합 테스트, 계약 테스트 생성 |

지원 프레임워크: Express, Fastify, Hono, NestJS

[상세 문서 →](./api-lifecycle/README.md)

---

### Architecture Enforcer

모듈 경계, 레이어 의존성, 네이밍 컨벤션을 검증하는 아키텍처 규칙 강제 도구입니다.

| 커맨드 | 설명 |
|--------|------|
| `/arch-init` | `.arch-rules.json` 대화형 초기화 |
| `/arch-check` | 아키텍처 규칙 위반 검사 |

지원 언어: TypeScript, JavaScript, Python, Java, Go, Rust
지원 아키텍처: Layered, Hexagonal, Modular, DDD

[상세 문서 →](./architecture-enforcer/README.md)

---

### Dependency Doctor

멀티 언어 프로젝트의 의존성 건강 상태를 진단하고 업그레이드를 관리합니다.

| 커맨드 | 설명 |
|--------|------|
| `/diagnose` | 취약점, 버전, 라이선스 종합 진단 |
| `/upgrade` | 티어별 안전한 업그레이드 실행 |

지원 에코시스템: npm, pip, bundler, cargo, go, composer

[상세 문서 →](./dependency-doctor/README.md)

---

### Migration Assistant

프레임워크 및 라이브러리 마이그레이션을 자동으로 분석하고 실행합니다.

| 커맨드 | 설명 |
|--------|------|
| `/migrate` | 마이그레이션 분석 및 실행 |
| `/migrate --analyze` | 분석만 실행 (변경 없음) |

지원 마이그레이션 예시: React 18→19, Next.js Pages→App Router, Express→Hono, Webpack→Vite, Jest→Vitest 등

[상세 문서 →](./migration-assistant/README.md)

---

### Monorepo Manager

모노레포 워크플로우를 관리합니다.

| 커맨드 | 설명 |
|--------|------|
| `/workspace-add` | 새 패키지/앱 추가 |
| `/affected` | 변경 영향 분석 |

지원 도구: Turborepo, Nx, Lerna, pnpm/Yarn/npm workspaces

[상세 문서 →](./monorepo-manager/README.md)

---

## 플러그인 구조

모든 플러그인은 동일한 아키텍처를 따릅니다:

```
<plugin>/
├── .claude-plugin/
│   └── plugin.json       # 메타데이터, 스킬/커맨드/에이전트 등록
├── skills/
│   └── <skill>/
│       └── SKILL.md      # 전체 워크플로우 정의
├── commands/
│   └── <command>.md      # 사용자 커맨드 정의
├── agents/
│   └── <agent>.md        # AI 에이전트 상세 명세
└── README.md             # 플러그인 문서
```

| 컴포넌트 | 역할 |
|----------|------|
| **plugin.json** | 플러그인 이름, 버전, 등록된 스킬/커맨드/에이전트 |
| **SKILL.md** | 전체 워크플로우 오케스트레이션 (에이전트 조합) |
| **commands/*.md** | `/command` 형태의 사용자 인터페이스 정의 |
| **agents/*.md** | 특화된 분석/실행 에이전트의 상세 동작 명세 |

## 요구 사항

- Node.js 18 이상
- Claude Code CLI

## 라이선스

MIT
