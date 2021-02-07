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
const safebooruTagUrl = 'https://safebooru.org/autocomplete.php';

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
 */
app.get('/tags', async (req, res) => {
  const reqUrl = safebooruTagUrl + `?q=${req.query.tags ? req.query.tags : ''}`;
  console.log('Tag-API requested: ' + reqUrl);

  // Safebooru로 요청
  try {
    const response = await fetch(reqUrl);
    const jsonArray = await response.json();
    
    const result = jsonArray.map(record => {
      const numOfContentString = record.label.match(/\([0-9]+\)/)[0];
      return {
        tagName: record.value,
        numOfPosts: numOfContentString.substring(1, numOfContentString.length - 1)
      };
    });

    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Acess-Control-Allow-Origin': '<origin>'
    });
    res.end(JSON.stringify(result));
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