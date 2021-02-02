import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Thumbnail } from './Thumbnail';
import { MetaInfo } from './MetaInfo';

const imagesPerPage = 10;

type AppProps = {

};

export const App = (props: AppProps) => {
  // 현재 로드된 이미지들
  const [metaInfos, setMetaInfos] = useState([] as MetaInfo[]);

  // 다음 로드할 이미지들의 페이지
  const [pid, setPid] = useState(0);

  // 휠을 드래그한 만큼 값이 누적된다.
  const [wheelStack, setWheelStack] = useState(0);

  // 새로 로드하기 위해 필요한 휠 누적치선. 로드가 될때마다 증가한다.
  const [loadline, setLoadline] = useState(0);

  const [selectedImage, setSelectedImage] = useState(null);

  /**
   * API 서버에서 데이터를 받아온 뒤, 상태를 갱신한다.
   */
  useEffect(() => {
    if (wheelStack < loadline)
      return;

    // 이미지를 로드하기 시작하면, 다음 번에 로드할 페이지를 미리 증가시켜둔다.
    setPid(pid + imagesPerPage);
    setLoadline(loadline + 600);

    fetch(`/api?limit=${imagesPerPage}&pid=${pid}&tags=girls_frontline`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(json => {
      if (!json.posts?.post)
        return;

      // posts 객체 하나하나마다 post가 들어있음
      for (const post of json.posts.post) {
        metaInfos.push({
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

      setMetaInfos([ ... metaInfos ]);
    })
    .catch(exception => console.log(exception));
  });

  document.onwheel = (event: WheelEvent) => {
    // 이미지를 선택한 상태에서는 휠을 돌려도 누적되지 않게 한다.
    if (selectedImage)
      return;

    let val = wheelStack + event.deltaY;
    val = Math.max(Math.min(val, loadline), 0);
    setWheelStack(val);
  };

  return (
    <div className='app'>
      {/* 헤더 */}
      <header><h1>Girls' Frontline</h1></header>
      
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