# 🧩 슬라이딩 퍼즐 마스터

이 문서는 [README.md](README.md)의 한국어 번역입니다.

React로 구축된 현대적이고 상호작용적인 4x4 슬라이딩 퍼즐 게임입니다. 이미지 업로드, 카메라 촬영, 실시간 리더보드, 소셜 인증을 제공합니다.

## ✨ 기능

### 🎮 핵심 게임 기능
- **4x4 슬라이딩 퍼즐**: 부드러운 애니메이션의 클래식 메커닉
- **사용자 정의 이미지**: 사진을 업로드하거나 카메라로 촬영
- **빠른 시작**: 즉시 플레이할 수 있는 샘플 이미지 제공
- **지능형 셔플**: 항상 해결 가능한 퍼즐 생성
- **컴퓨터 해결사**: AI가 퍼즐을 자동으로 해결하는 모습 확인
- **사운드 효과**: 이동 및 완료 시 오디오 피드백

### 🏆 경쟁 및 소셜
- **실시간 리더보드**: 실시간으로 갱신되는 글로벌 순위
- **점수 시스템**: 완료 시간과 이동 횟수를 기반으로 점수 계산
- **사용자 인증**: 이메일, Google, GitHub 로그인 지원
- **플레이어 프로필**: 진행 상황과 업적 추적

### 📱 현대적 UX
- **반응형 디자인**: 데스크톱과 모바일에서 모두 작동
- **카메라 통합**: 브라우저에서 직접 사진 촬영
- **드래그 앤 드롭**: 간편한 이미지 업로드
- **교육 모드**: 셔플 알고리즘 작동 방식 학습
- **게임 통계**: 이동 및 시간에 대한 자세한 기록

## 🚀 라이브 데모

[슬라이딩 퍼즐 마스터 플레이하기](your-deployment-url-here)

## 🛠 기술 스택

- **프론트엔드**: React, Tailwind CSS, Lucide Icons
- **백엔드**: Supabase(데이터베이스, 인증, Edge Functions)
- **배포**: Vercel/Netlify 지원
- **인증**: OAuth 공급자를 사용하는 Supabase Auth
- **상태 관리**: React Hooks
- **이미지 처리**: Canvas API

## 📦 프로젝트 구조

```
├── components/           # React 컴포넌트
│   ├── ui/              # 재사용 가능한 UI 컴포넌트(shadcn/ui)
│   ├── GameScreen.tsx   # 메인 게임 인터페이스
│   ├── AuthModal.tsx    # 인증 모달
│   └── ...
├── supabase/            # 백엔드 함수
│   └── functions/
│       └── server/      # API용 Edge 함수
├── hooks/               # 커스텀 React 훅
├── utils/               # 유틸리티 함수
└── styles/              # 전역 CSS 및 Tailwind 설정
```

## 🔧 설정 방법

### 필요 사항
- Node.js 18+와 npm
- Supabase 계정
- GitHub OAuth 앱(선택 사항)
- Google OAuth 앱(선택 사항)

### 1. 리포지토리 클론
```bash
git clone https://github.com/alfpooh/ImageSlidingGame.git
cd ImageSlidingGame
npm install
```

### 2. Supabase 설정
1. [supabase.com](https://supabase.com)에서 새 프로젝트를 생성합니다.
2. 프로젝트 URL과 anon 키를 복사합니다.
3. `/utils/supabase/info.tsx`에 자격 증명을 업데이트합니다:

```typescript
export const projectId = 'your-project-id'
export const publicAnonKey = 'your-anon-key'
```

### 3. 데이터베이스 설정
이 앱은 자동으로 생성되는 단순한 키-값 저장 테이블을 사용하므로 별도의 데이터베이스 설정이 필요 없습니다.

### 4. Edge 함수 배포
```bash
# Supabase CLI 설치
npm install -g supabase

# Supabase 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref your-project-id

# 함수 배포
supabase functions deploy
```

### 5. OAuth 설정(선택 사항)

#### GitHub OAuth
1. GitHub Settings → Developer settings → OAuth Apps로 이동합니다.
2. 새 OAuth 앱을 생성하고 다음을 설정합니다:
   - Authorization callback URL: `https://your-project.supabase.co/auth/v1/callback`
3. Supabase Auth 설정에 자격 증명을 추가합니다.

#### Google OAuth
1. [Google Cloud Console](https://console.cloud.google.com)로 이동합니다.
2. OAuth 2.0 자격 증명을 생성합니다.
3. 승인된 리디렉션 URI를 추가합니다: `https://your-project.supabase.co/auth/v1/callback`
4. Supabase Auth 설정에 자격 증명을 추가합니다.

### 6. 환경 변수
`.env.local` 파일을 생성하고 다음을 추가합니다:
```bash
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### 7. 개발 서버 실행
```bash
npm start
```

## 🚀 배포

### Vercel(권장)
1. GitHub 리포지토리를 Vercel에 연결합니다.
2. Vercel 대시보드에서 환경 변수를 추가합니다.
3. push 시 자동으로 배포됩니다.

### Netlify
1. 리포지토리를 Netlify에 연결합니다.
2. 빌드 명령: `npm run build`
3. 배포 디렉터리: `build`
4. 환경 변수를 추가합니다.

## 🎮 플레이 방법

1. **이미지 선택**: 직접 업로드하거나 빠른 시작 이미지를 선택합니다.
2. **퍼즐 해결 시작**: 빈 칸과 맞닿은 타일을 클릭하여 이동합니다.
3. **퍼즐 완성**: 조각을 올바른 위치로 배치하여 원본 이미지를 완성합니다.
4. **경쟁**: 최고 기록이 글로벌 리더보드에 표시됩니다.

### 프로 팁
- 모서리와 가장자리부터 맞춰 보세요.
- 여러 이동을 미리 계획하세요.
- 컴퓨터 해결사를 활용하여 최적 전략을 학습하세요.
- 디테일이 뚜렷한 이미지를 선택하면 더 쉽게 풀 수 있습니다.

## 🔨 게임 메커니즘

### 셔플 알고리즘
- Fisher‑Yates 셔플과 풀이 가능성 검증을 사용합니다.
- 생성된 모든 퍼즐은 항상 해결 가능합니다.
- 모든 게임에서 공정한 난이도를 유지합니다.

### 점수 시스템
- **시간 요소**: 더 빨리 완료할수록 높은 점수를 얻습니다.
- **이동 효율**: 이동 횟수가 적을수록 보너스 점수를 얻습니다.
- **리더보드**: 최고의 시간과 이동 수 조합이 기록됩니다.

### 컴퓨터 해결사
- 셔플 및 사용자 이동을 역추적합니다.
- 최적의 해결 전략을 시각적으로 보여줍니다.
- 퍼즐 메커니즘을 이해하기 위한 학습 도구입니다.

## 🤝 기여

1. 리포지토리를 포크합니다.
2. 기능 브랜치를 생성합니다: `git checkout -b feature/amazing-feature`
3. 변경 사항을 커밋합니다: `git commit -m 'Add amazing feature'`
4. 브랜치를 푸시합니다: `git push origin feature/amazing-feature`
5. Pull Request를 생성합니다.

## 📝 라이선스

이 프로젝트는 MIT 라이선스로 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.

## 🙏 감사의 말

- **Pexels**: 빠른 시작용 샘플 이미지
- **Shadcn/ui**: 아름다운 UI 컴포넌트
- **Lucide**: 깔끔하고 일관된 아이콘
- **Supabase**: 백엔드 인프라
- **React 커뮤니티**: 훌륭한 생태계

## 📞 지원

- 🐛 **버그 신고**: [GitHub Issues](https://github.com/alfpooh/ImageSlidingGame/issues)
- 💡 **기능 제안**: [GitHub Discussions](https://github.com/alfpooh/ImageSlidingGame/discussions)
- 📧 **연락처**: [Your Email](mailto:your-email@example.com)

## 🔄 변경 로그

### v1.0.0 (현재)
- ✅ 기본 슬라이딩 퍼즐 메커닉
- ✅ 이미지 업로드 및 카메라 촬영
- ✅ 실시간 리더보드
- ✅ 다중 제공자 인증
- ✅ 시각화가 포함된 컴퓨터 해결사
- ✅ 교육용 컴포넌트
- ✅ 반응형 디자인

---

**React와 Supabase로 사랑을 담아 제작했습니다**
