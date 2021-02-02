/**
 * 간단한 프록시 서버
 * Safebooru API에서 CORS 헤더를 안보내주기 때문에 브라우저에서 직접
 * Safeborou API를 이용할 수가 없다. 따라서 이 프록시 서버는 Safebooru에
 * 요청을 대신 날려주고, 응답을 JSON으로 변환해서 브라우저에 던져준다.
 */
const querystring = require('querystring');
const express = require('express');
const request = require('request');
const convert = require('xml-js');
const app = express();
const port = 4577;

const safebooruApiUrl = 'https://safebooru.org/index.php?page=dapi&s=post&q=index';

app.use(express.static('dist'));

/**
 * 입력한 파라미터를 세이프부루로 전달하고, 그 결과값을 JSON으로 받아서 넘긴다.
 */
app.get('/api', (req, res) => {
  const params = querystring.stringify(req.query);
  const reqUrl = safebooruApiUrl + '&' + params;

  // Safebooru로 요청
  request.get(reqUrl, (err, sbRes, body) => {
    // Safebooru 서버 오류
    if (err) {
      res.writeHead(500);
      res.end();
    }
    else {
      const json = convert.xml2json(body, {compact: true, spaces: 4});
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Acess-Control-Allow-Origin': ''
      });
      res.end(json);
    }
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});