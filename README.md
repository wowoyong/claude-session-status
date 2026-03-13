# claude-session-status

[Claude Code](https://claude.ai/code) CLI용 경량 상태표시줄 패키지입니다.

현재 경로, 모델명, 토큰 사용량, 컨텍스트 사용률, 잔여량을 한눈에 확인할 수 있습니다.

```
📁 ~/WebstormProjects  🤖 Opus 4.6  📊 ↑8.5K ↓1.2K  ██████░░░░ 62%  🔋 38%
```

## 주요 기능

| 구분 | 설명 |
|------|------|
| 📁 경로 | 현재 작업 디렉토리 (홈 디렉토리는 `~`로 축약) |
| 🤖 모델 | 현재 사용 중인 Claude 모델명 |
| 📊 토큰 | 입력(↑) / 출력(↓) 토큰 수 (K/M 단위 자동 변환) |
| 프로그레스 바 | 컨텍스트 윈도우 사용률 (초록/노랑/빨강 색상) |
| 🔋 잔여량 | 컨텍스트 윈도우 남은 비율 |

## 설치

```bash
npm install -g claude-session-status
```

## 설정

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

## 작동 방식

Claude Code가 세션 데이터를 JSON 형태로 상태표시줄 커맨드의 stdin에 전달합니다. 이 도구는 JSON을 파싱하여 ANSI 컬러로 포맷팅된 한 줄의 텍스트를 stdout으로 출력합니다.

### 색상 구분

프로그레스 바는 컨텍스트 사용률에 따라 색상이 변합니다:

- **초록** (0~50%) — 여유 있음
- **노랑** (51~75%) — 주의 필요
- **빨강** (76~100%) — 부족함

## 요구 사항

- Node.js 18 이상
- Claude Code CLI

## 라이선스

MIT
