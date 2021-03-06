import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Thumbnail } from './Thumbnail';
import { MetaInfo } from './MetaInfo';
import { SearchEngine } from './SearchEngine';

type AppProps = {

};

const imagesPerRequest = 25;
const firstLoadMultiple = 2;

export const App = (props: AppProps) => {
  // 현재 로드된 이미지들
  const [metaInfos, setMetaInfos] = useState([] as MetaInfo[]);

  // 다음 로드할 이미지들의 페이지
  const [pid, setPid] = useState(0);

  // 모달에 띄울 이미지
  const [selectedImage, setSelectedImage] = useState(null);

  // 검색 엔진에서 콜백으로 올려보내주는 검색 키워드를 저장
  // keywords가 바뀌면 이미지도 전부 새로 로드해야함
  const [keywords, setKeywords] = useState([] as string[]);

  // 스크롤을 밑바닥까지 내렸을 때 이미지를 추가로드하도록 하는 플래그
  const [append, setAppend] = useState(false);

  // 로드된 적 있는 이미지의 URL을 저장하는 곳. 중복로드 방지
  const [urls, setUrls] = useState({});

  // 스크롤 디바운스용
  const [scrollTimer, setScrollTimer] = useState(null);

  // API 로드 함수
  const loadImage = (numOfImage: number, clear: boolean, pageId: number, urls: {}): void => {
    fetch(`/api?limit=${numOfImage}&pid=${pageId}&tags=${keywords.join(' ')}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(json => {
      if (!json.posts?.post) {
        return;
      }

      const newInfos = [];

      // posts 객체 하나하나마다 post가 들어있음
      for (const post of json.posts.post) {
        // 중복된 이미지가 들어올 수도 있다. 가령 pid=10 -> pid=11로 옮기는
        // 과정에서 서버에 이미지가 추가되어,pid=10에서 나왔던 이미지가 pid=11에서
        // 다시 API에 실려올 수가 있다.
        if (urls[post._attributes.sample_url])
          continue;
        urls[post._attributes.sample_url] = true;

        newInfos.push({
          fileUrl:      post._attributes.file_url,
          width:        post._attributes.width,
          height:       post._attributes.height,
          sampleUrl:    post._attributes.sample_url,
          sampleWidth:  post._attributes.sample_width,
          sampleHeight: post._attributes.sample_height,
          previewUrl:   post._attributes.preview_url,
          previewWidth: post._attributes.preview_width,
          previewHeight: post._attributes.preview_height,

          // 태그들은 중복을 제거해서 넣어줘야 한다.
          tags: post._attributes.tags.split(' ')
            .filter(tag => tag !== '')
            .reduce((acc, tag) => {
              // 중뷁제거
              for (const t of acc)
                if (t === tag)
                  return acc;
              return acc.concat([tag]);
            }, []),
          createdAt: new Date(post._attributes.created_at)
        });
      }

      if (clear) {
        // 초기화 할 땐 2배수로 로드하기 때문에 pid값을 그만큼 증가시켜놔야 한다.
        setMetaInfos(newInfos);
        setPid(pageId + firstLoadMultiple);
      }
      else {
        setMetaInfos(metaInfos.concat(newInfos));
        setPid(pageId + 1);
      }
      setUrls({ ... urls });
      setAppend(false);
    })
    .catch(exception => console.log(exception));
  };

  // 스크롤이 끝났을 때 스크롤이 임계영역에 도달했는지 확인한 후
  // 이벤트를 발생시킨다.
  const scrollDebouncer = () => {
    const curY = document.documentElement.scrollTop;
    const curH = window.innerHeight;

    if (curY + curH >= document.body.scrollHeight * 0.8)
      setAppend(true);
  };

  window.onscroll = () => {
    if (scrollTimer) 
      clearInterval(scrollTimer);
    setScrollTimer(setTimeout(scrollDebouncer, 100));
  };

  /**
   * 키워드가 변경되면 이미지를 다 지우고 새로 로드한다.
   * 페이지를 가득 채우기 위해 2배수를 로드한다.
   */
  useEffect(() => {
    loadImage(imagesPerRequest * firstLoadMultiple, true, 0, {});
    
    // 스크롤을 제자리로 두지 않으면 스크롤이 제일 아래에 붙은 상태로 
    // 계속 로딩이 되는 버그가 생김
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [keywords]);

  /**
   * append가 true가 되면 이미지를 추가로 로드한다.
   */
  useEffect(() => {
    if (append)
      loadImage(imagesPerRequest, false, pid, urls);
  }, [append]);

  /**
   * 뷰
   */
  return (
    <div className='app'>
      <div className='header'>
        {/* 헤더 */}
        <header>
          <h1>Simple Safebooru</h1>
        </header>
        
        {/* 검색 창 */}
        <SearchEngine onSearchStart={new_keywords => setKeywords(new_keywords)}/>
      </div>

      {/* 섬네일들 */}
      <div className='thumbnails-container'>
        {metaInfos.map(metaInfo => 
        <Thumbnail key={metaInfo.sampleUrl} imageUrl={metaInfo.sampleUrl} onClick={() => setSelectedImage(metaInfo)} />)}
      </div>

      {/* 모달 */}
      <Modal isVisible={selectedImage !== null} 
        imageUrl={selectedImage?.sampleUrl}
        originalUrl={selectedImage?.fileUrl}
        tags={selectedImage?.tags} 
        uploadedDate={selectedImage?.createdAt} 
        onClickWall={() => setSelectedImage(null)} />
      
      {/* 맨 위로 올라가기 버튼 */}
      <input type='button' id='elevator' value='▲' onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
    </div>
  );
}