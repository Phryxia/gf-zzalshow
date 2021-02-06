/**
 * 간단한 프록시 서버
 * Safebooru API에서 CORS 헤더를 안보내주기 때문에 브라우저에서 직접
 * Safeborou API를 이용할 수가 없다. 따라서 이 프록시 서버는 Safebooru에
 * 요청을 대신 날려주고, 응답을 JSON으로 변환해서 브라우저에 던져준다.
 */
const querystring = require('querystring');
const express = require('express');
const fetch = require('node-fetch');
const convert = require('xml-js');
const JSSoup = require('jssoup').default;
const app = express();
const port = 4577;

const safebooruApiUrl = 'https://safebooru.org/index.php?page=dapi&s=post&q=index';
const safebooruTagUrl = 'https://safebooru.org/index.php?page=tags&s=list&sort=asc&order_by=tag';

app.use(express.static('dist'));

/**
 * 입력한 파라미터를 세이프부루로 전달하고, 그 결과값을 JSON으로 받아서 넘긴다.
 */
app.get('/api', async (req, res) => {
  const params = querystring.stringify(req.query);
  const reqUrl = safebooruApiUrl + '&' + params;
  console.log('XML-API requested: ' + reqUrl);

  // Safebooru로 요청
  try {
    const response = await fetch(reqUrl);
    const body = await response.text();

    const json = convert.xml2json(body, {compact: true, spaces: 4});
    const jsonObject = JSON.parse(json);
    
    // api의 일관성을 위해서 배열을 주도록 바꿈
    if (!jsonObject.posts.post) {
      // posts의 길이가 0인 경우, post가 undefined이다.
      jsonObject.posts.post = [];
    }
    else if (!(jsonObject.posts.post instanceof Array)) {
      // posts의 길이가 1인 경우, post를 배열로 안주고 오브젝트로 줌
      jsonObject.posts.post = [jsonObject.posts.post];
    }
    
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Acess-Control-Allow-Origin': '<origin>'
    });
    res.end(JSON.stringify(jsonObject));
  }
  catch (error) {
    console.log(error);
    res.writeHead(500);
    res.end();
  }
});

/**
 * 파라미터는 tags=검색어이다.
 * 반환은 JSON으로 한다.
 * 검색결과가 너무 많으면 빈 배열을 반환한다.
 */
app.get('/tags', async (req, res) => {
  const params = querystring.stringify({ tags: (req.query.tags ? req.query.tags : '') + '*' });
  const reqUrl = safebooruTagUrl + '&' + params;
  console.log('Tag-API requested: ' + reqUrl);

  // Safebooru로 요청
  try {
    const response = await fetch(reqUrl);
    const body = await response.text();

    const soup = new JSSoup(body);
    const trList = soup.findAll('tr');
    const jsonArray = [];
    
    for (const tr of trList) {
      try {
        // td를 불러온다.
        const tdPosts = tr.nextElement;
        const tdName = tdPosts.nextSibling;
        const tdType = tdName.nextSibling;

        // Safebooru에는 검색 결과가 너무 많으면 표가 제대로 렌더링되지 않는 버그가 있다.
        // 세 번째 td를 빼먹는 것으로 확인하였다. 이 경우 유의미한 데이터가 아니므로 패스
        if (!tdPosts || !tdName || !tdType)
          continue;

        // 헤더 행 재낌
        if (tdPosts.text === 'Posts')
          continue;

        // 검색결과 없음
        if (!tdPosts.text || tdPosts.text === '0')
          continue;

        // 세 번째 인자 분석
        const typeAndLink = tdType.text;
        const type = typeAndLink.split(' ')[0];

        // jsonArray에 넣는다.
        jsonArray.push({
          posts: tdPosts.text,
          name: tdName.text,
          link: tdName.nextElement.nextElement.attrs.href,
          type
        });
      }
      catch (error) {
        console.log('==== PARSING ERROR ====');
        console.log(error);
      }
    }

    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Acess-Control-Allow-Origin': '<origin>'
    });
    res.end(JSON.stringify(jsonArray));
  }
  catch (error) {
    console.log('==== PROMISE ERROR ====');
    console.log(error);
    res.writeHead(500);
  }
  finally {
    res.end();
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});