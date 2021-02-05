import React, { useState, useEffect } from 'react';
import { Tag } from './Tag';

type ModalProps = {
  isVisible?: boolean,
  imageUrl: string,
  originalUrl: string,
  tags: string[],
  uploadedDate: Date,
  onClickWall: () => void
};

export const Modal = (props: ModalProps) => {
  /**
   * 모달 바깥을 클릭하면 창을 닫는 onClickWall를 실행한다.
   */
  useEffect(() => {
    document.onclick = (evt) => {
      const $modal = document.querySelector('#modal');
      if (props.isVisible && $modal && !$modal.contains(evt.target as Node)) {
        props.onClickWall();
      }
    };
  });

  return (
    <div className={`wall${props.isVisible ? '' : ' disabled'}`}>
      <div id='modal' className='modal' onAuxClick={props.onClickWall} >
        {/* 모달 이미지~ */}
        <input type='image' className='modal-image' src={props.imageUrl} onClick={() => window.open(props.originalUrl, '_blank')} />

        {/* 모달 이미지 정보 */}
        <div className='modal-info'>
          <div className='modal-info-tags'>
            <strong>Tags</strong>
            <hr />

            {/* 태그들 */}
            <div className='tags-container'>
              {props.isVisible ? props.tags.map(tag => <Tag key={tag} tagName={tag} />) : null}
            </div>
          </div>


          {/* 날짜 */}
          <div className='modal-info-date'>
            <strong>Date</strong>
            <hr />
            <div>
              {props.uploadedDate?.getFullYear()}-{props.uploadedDate?.getMonth()+1}-{props.uploadedDate?.getDate()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};