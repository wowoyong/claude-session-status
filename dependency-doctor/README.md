# Dependency Doctor

멀티 언어 프로젝트의 의존성 건강 상태를 진단하고 업그레이드를 관리하는 Claude Code 플러그인입니다.

## 개요

`dependency-doctor`는 프로젝트의 모든 의존성을 스캔하여 취약점, 버전 정보, 라이선스 이슈를 종합적으로 진단하고, 안전한 업그레이드 계획을 수립하여 실행하는 Claude Code CLI 플러그인입니다.

## 주요 기능

| 기능 | 설명 |
|------|------|
| 취약점 스캔 | CVE/GHSA 기반 보안 취약점 탐지 및 위험도 평가 |
| 버전 분석 | Patch/Minor/Major 수준의 업데이트 분류 |
| 트리 분석 | 순환 의존성, 중복 패키지, 미사용 패키지 탐지 |
| 라이선스 검사 | GPL 오염, 미확인 라이선스 등 호환성 이슈 탐지 |
| 업그레이드 플래너 | 4단계 티어별 안전한 업그레이드 계획 수립 |
| 자동 실행 | 단계별 업그레이드 실행, 테스트 검증, 롤백 지원 |

## 지원 에코시스템

| 에코시스템 | 매니페스트 | 감사 도구 |
|-----------|-----------|----------|
| npm/yarn/pnpm | `package.json` | `npm audit`, `yarn audit`, `pnpm audit` |
| pip | `requirements.txt`, `pyproject.toml` | `pip-audit` |
| bundler | `Gemfile` | `bundle audit` |
| cargo | `Cargo.toml` | `cargo audit` |
| go | `go.mod` | `govulncheck` |
| composer | `composer.json` | `composer audit` |

## 설치

```bash
cp -r dependency-doctor .claude/plugins/dependency-doctor
```

## 사용법

### 진단

```bash
# 전체 진단
/diagnose

# 특정 에코시스템만
/diagnose --ecosystem npm

# 높은 심각도만
/diagnose --severity high

# 빠른 스캔 (라이선스, 미사용 검사 생략)
/diagnose --skip-license --skip-unused

# JSON 출력
/diagnose --json

# 모노레포 워크스페이스
/diagnose --workspace packages/api
```

### 업그레이드

```bash
# 보안 패치만 적용
/upgrade --security-only

# 안전한 업데이트 (patch + minor)
/upgrade --safe

# 특정 패키지만
/upgrade --package react

# 미리보기
/upgrade --dry-run

# 특정 티어 실행
/upgrade --tier 3

# 마지막 업그레이드 롤백
/upgrade --rollback
```

### 업그레이드 티어

| 티어 | 설명 | 위험도 |
|------|------|--------|
| Tier 1 | 보안 패치 (patch 업데이트) | 없음 |
| Tier 2 | 안전한 업데이트 (minor/patch, 충돌 없음) | 낮음 |
| Tier 3 | 계획적 업그레이드 (major, 코드 변경 필요) | 중-높음 |
| Tier 4 | 보류 (차단됨 또는 대규모 변경 필요) | 높음 |

### 건강 점수

0-100점 기반의 종합 건강 점수를 제공합니다:

```
Base: 100
- Critical 취약점: -15점
- High 취약점: -10점
- Major 버전 뒤처짐: -3점
- 순환 의존성: -5점
- GPL 라이선스 혼재: -5점
- 미사용 의존성: -1점
```

## 플러그인 구조

```
dependency-doctor/
├── .claude-plugin/
│   └── plugin.json               # 플러그인 메타데이터 및 설정
├── skills/
│   └── diagnose/
│       └── SKILL.md              # 전체 진단 워크플로우 (6단계)
├── commands/
│   ├── diagnose.md               # /diagnose 명령어 정의
│   └── upgrade.md                # /upgrade 명령어 정의
├── agents/
│   ├── vulnerability-scanner.md  # 취약점 스캔 에이전트
│   └── upgrade-planner.md        # 업그레이드 계획 에이전트
└── README.md                     # 이 파일
```

## 안전장치

- **읽기 전용 기본값**: `/diagnose`는 파일을 수정하지 않습니다
- **단계별 실행**: 업그레이드는 하나씩 적용하고 매번 테스트합니다
- **즉시 롤백**: 실패한 업그레이드는 즉시 되돌릴 수 있습니다
- **세션 로깅**: 모든 변경 사항이 기록되어 나중에 롤백할 수 있습니다
- **확인 프롬프트**: Major 업그레이드는 항상 명시적 확인을 요청합니다

## 라이선스

MIT License
