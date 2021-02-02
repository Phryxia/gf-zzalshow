import React from 'react';

type ThumbnailProps = {
  imageUrl: string,
  onClick: () => void
};

export const Thumbnail = (props: ThumbnailProps) => {
  return (
    <div className='thumbnail'>
      <input className='thumbnail-img' type='image' src={props.imageUrl} onClick={props.onClick} />
    </div>
  );
};