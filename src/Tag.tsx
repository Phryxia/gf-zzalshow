import React from 'react';

type TagProps = {
  tagName: string
};

export const Tag = (props: TagProps) => {
  return (
    <span className='tag'>{props.tagName}</span>
  );
};