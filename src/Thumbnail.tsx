import React, { useState, useEffect } from 'react';

type ThumbnailProps = {
  imageUrl: string,
  onClick: () => void,
  key: string
};

export const Thumbnail = (props: ThumbnailProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  // 이미지가 로드됐을 때 콜백을 실행하려면 이 방법 밖에 없음
  // 최초 렌더링 때 가상으로 이미지를 로드하고, 콜백으로 state를 세팅함.
  useEffect(() => {
    let isMounted = true;

    const dummy = new Image();
    dummy.onload = () => {
      // 이미지가 로드되는 중에 여러가지 이유로 섬네일 컴포넌트가 삭제될 수 있다.
      // 때문에 정리 코드와 방어 코드가 필요하다.
      if (isMounted)
        setIsLoaded(true);
    };
    dummy.src = props.imageUrl;

    // Cleaning Code
    return () => {
      // 이미지 로드를 취소한다.
      dummy.src = '';
      isMounted = false;
    }
  }, []);

  return (
    <div className={'thumbnail'} data-isloaded={isLoaded}>
      {!isLoaded
        ? <div className='loader'></div> 
        : <input className='thumbnail-img' type='image' src={props.imageUrl} onClick={props.onClick} alt=''/>}
      
    </div>
  );
};