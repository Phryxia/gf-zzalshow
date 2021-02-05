# Simple Safebooru

**Simple Safebooru**(http://zzalshow.krissvector.moe:4577/)는 Safebooru API를 이용하여 손쉽게 이미지를 탐색할 수 있는 토이 프로젝트입니다.



## 왜 만들었나

리액트 공부하려고 만들었습니다.



## 개발환경설정

`node.js`가 필요합니다.

```
npm i
npm run build-test
npm run boot
```

명령어를 입력한 뒤 http://localhost:4577로 들어가면 됩니다.



## 기타 참고사항

~~망할~~ Safebooru API는 CORS 설정 헤더를 보내주지 않기 때문에 브라우저만으로는 구동이 불가능하며, 간단한 API 서버가 필요합니다. `index.js`는 `node.js`와 `express.js`를 활용하여 만든 간단한 서버로, CORS 문제를 해결함과 동시에 XML을 JSON으로 변환해주는 역할을 담당합니다.

### 추천 태그 구현방식

Safebooru에는 태그 API가 공개돼 있지 않습니다. 대신 태그 리스트 페이지(https://safebooru.org/index.php?page=tags&s=list)가 존재하여, 어떤 태그가 어떤 속성을 가지고 있는지 검색할 수 있습니다. 이를 브라우저에서 활용하기 위해, node.js 서버에서 페이지를 직접 내려받은 뒤 JSSoup를 이용하여 파싱한 뒤, JSON으로 관련 정보를 반환하는 API를 직접 제작하였습니다.
