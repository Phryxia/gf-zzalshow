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
    const dummy = new Image();
    dummy.onload = () => {
      setIsLoaded(true);
    };
    dummy.src = props.imageUrl;
  }, []);

  return (
    <div className={'thumbnail'} data-isloaded={isLoaded}>
      {!isLoaded
        ? <div className='loader'></div> 
        : <input className='thumbnail-img' type='image' src={props.imageUrl} onClick={props.onClick} alt=''/>}
      
    </div>
  );
};