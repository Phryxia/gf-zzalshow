import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Thumbnail } from './Thumbnail';
import { MetaInfo } from './MetaInfo';
import { SearchEngine } from './SearchEngine';

const imagesPerPage = 10;

type AppProps = {

};

export const App = (props: AppProps) => {
  // 현재 로드된 이미지들
  const [metaInfos, setMetaInfos] = useState([] as MetaInfo[]);

  // 다음 로드할 이미지들의 페이지
  const [pid, setPid] = useState(0);

  // 모달에 띄울 이미지
  const [selectedImage, setSelectedImage] = useState(null);

  // 검색 키워드들
  const [keywords, setKeywords] = useState([] as string[]);

  const [append, setAppend] = useState(false);

  // API 로드 함수
  const loadImage = (numOfImage: number, clear: boolean, pageId: number): void => {
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

      if (clear)
        setMetaInfos(newInfos);
      else
        setMetaInfos(metaInfos.concat(newInfos));

      setPid(pid + 1);
    })
    .catch(exception => console.log(exception));
  };
  
  // 앱이 최초로 렌더링 될 때 한 번만 실행
  useEffect(() => {
    // 스크롤이 될 때 호출됨
    const onScroll = () => {
      const curY = document.documentElement.scrollTop;
      const curH = window.innerHeight;

      if (curY + curH >= document.body.scrollHeight) {
        setAppend(true);
      }
    };

    // onScroll 디바운싱
    let onScrollTimer = null;
    window.onscroll = () => {
      if (onScrollTimer)
        clearTimeout(onScrollTimer);
      onScrollTimer = setTimeout(onScroll, 100);
    };
  }, []);

  /**
   * 키워드가 변경되면 이미지를 다 지우고 새로 로드한다.
   */
  useEffect(() => {
    loadImage(25, true, 0);
  }, [keywords]);

  /**
   * append가 true가 되면 이미지를 추가로 로드한다.
   */
  useEffect(() => {
    if (append) {
      setAppend(false);
      loadImage(25, false, pid);
    }
  }, [append]);

  /**
   * 뷰
   */
  return (
    <div className='app'>
      {/* 헤더 */}
      <header>
        <h1>Easy Safebooru</h1>
        <SearchEngine onChangeKeyword={(new_keywords) => setKeywords(new_keywords)}/>
      </header>
      
      {/* 섬네일들 */}
      <div className='thumbnails-container'>
        {metaInfos.map(metaInfo => <Thumbnail key={metaInfo.sampleUrl} imageUrl={metaInfo.sampleUrl} onClick={() => setSelectedImage(metaInfo)} />)}
      </div>

      {/* 모달 */}
      <Modal isVisible={selectedImage !== null} 
        imageUrl={selectedImage?.sampleUrl}
        originalUrl={selectedImage?.fileUrl}
        tags={selectedImage?.tags} 
        uploadedDate={selectedImage?.createdAt} 
        onClickWall={() => setSelectedImage(null)} />      
    </div>
  );
}