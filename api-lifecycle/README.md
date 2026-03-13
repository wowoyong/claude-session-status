# API Lifecycle

자연어 요구사항에서 프로덕션 코드까지, End-to-End API 설계 및 개발을 지원하는 Claude Code 플러그인입니다.

## 개요

`api-lifecycle`은 API 설계부터 코드 생성, 테스트, 문서화까지 전체 API 라이프사이클을 관리하는 Claude Code CLI 플러그인입니다. 자연어로 요구사항을 입력하면 OpenAPI 3.1 스펙을 설계하고, 이를 기반으로 TypeScript 코드를 자동 생성합니다.

## 주요 기능

| 기능 | 설명 |
|------|------|
| API 설계 | 자연어 요구사항 → OpenAPI 3.1 스펙 자동 생성 |
| 코드 생성 | 타입, Zod 스키마, 라우트 핸들러, 클라이언트 SDK 생성 |
| 테스트 생성 | 통합 테스트, 계약 테스트, 테스트 헬퍼 자동 생성 |
| 프레임워크 지원 | Express, Fastify, Hono, NestJS 자동 감지 및 지원 |

## 설치

```bash
# 프로젝트 루트에서
cp -r api-lifecycle .claude/plugins/api-lifecycle
```

또는 `.claude/settings.json`에 플러그인 경로를 추가합니다:

```json
{
  "plugins": [
    "./api-lifecycle"
  ]
}
```

## 사용법

### 커맨드

```bash
# API 설계 (자연어 → OpenAPI 스펙)
/api-design 도서 관리 REST API: 책, 저자, 리뷰. JWT 인증. 커서 페이지네이션.

# 코드 생성 (OpenAPI 스펙 → TypeScript 코드)
/api-generate
/api-generate --framework hono --only types,schemas

# 테스트 생성
/api-test
/api-test --runner vitest --only integration
```

### 5단계 워크플로우

```
Phase 1: 요구사항 수집
├── 리소스, 인증, 페이지네이션 등 확인
└── 대화형으로 누락 항목 질문

Phase 2: 스펙 설계 & 검증
├── schema-designer 에이전트가 OpenAPI 3.1 생성
├── 베스트 프랙티스 검증
└── 사용자 리뷰 및 수정

Phase 3: 코드 생성
├── TypeScript 타입, Zod 스키마
├── 프레임워크별 라우트 핸들러
├── 미들웨어 (인증, 검증, 에러 핸들링)
└── 타입이 적용된 클라이언트 SDK

Phase 4: 테스트 생성
├── 통합 테스트 (Happy path + Error cases)
├── 계약 테스트 (응답 스키마 검증)
└── 테스트 헬퍼 (팩토리, 인증, DB)

Phase 5: 문서 생성
└── API 레퍼런스, 퀵 스타트, 에러 가이드
```

## 설계 원칙

- **OpenAPI 3.1** (JSON Schema 호환)
- **UUID v4** 리소스 ID
- **RFC 7807** Problem Details 에러 응답
- **ISO 8601** 날짜/시간 형식
- **camelCase** JSON 프로퍼티 기본값
- **커서 기반 페이지네이션** 기본값

## 플러그인 구조

```
api-lifecycle/
├── .claude-plugin/
│   └── plugin.json            # 플러그인 메타데이터 및 설정
├── skills/
│   └── api-design/
│       └── SKILL.md           # 전체 API 라이프사이클 워크플로우
├── commands/
│   ├── api-design.md          # /api-design 명령어 정의
│   ├── api-generate.md        # /api-generate 명령어 정의
│   └── api-test.md            # /api-test 명령어 정의
├── agents/
│   ├── schema-designer.md     # OpenAPI 스펙 설계 에이전트
│   └── api-generator.md       # 코드 생성 에이전트
└── README.md                  # 이 파일
```

## 라이선스

MIT License
