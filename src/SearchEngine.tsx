import React, { useState, useEffect } from 'react';

type SearchEngineProps = {
  onChangeKeyword: (keywords) => void
};

type Recommendation = {
  posts: string,
  name: string,
  link: string,
  type: string
};

const DEBOUNCE_TIME = 500;

/**
 * 태그 검색 엔진
 * @param props 
 */
export const SearchEngine = (props: SearchEngineProps) => {
  // raw string
  const [raw, setRaw] = useState('');

  // 키워드!
  const [keywords, setKeywords] = useState([] as string[]);

  // 추천키워드들
  const [recommendations, setRecommendations] = useState([] as Recommendation[]);

  // 키워드가 확정된 이후, 서버 태그 API를 호출한다.
  useEffect(() => {
    const lastKeyword = keywords[keywords.length - 1];
    if (!lastKeyword)
      return;

    fetch(`/tags?tags=${lastKeyword}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(json => {
      // 결과물을 하나하나씩 recommendations에 담아준다.
      const new_recommendations = [];

      for (const record of json) {
        new_recommendations.push(record);
      }

      setRecommendations(new_recommendations.slice(0, 16));
    })
    .catch(exception => console.log(exception));
  }, [keywords]);

  const onChangeKeyword = (new_keywords) => {
    // 기존 키워드랑 같은지 비교
    let isSame = new_keywords.length === keywords.length;
    for (const new_keyword of new_keywords) {
      let exist = false;
      
      for (const keyword of keywords) {
        if (new_keyword === keyword) {
          exist = true;
          break;
        }
      }

      isSame &&= exist;
    }
    
    // 같은 키워드들이면 setter를 호출하지 않는다.
    if (isSame)
      return;

    setKeywords([... new_keywords]);

    props.onChangeKeyword(new_keywords);
  };

  let onChangeKeywordTimer = null;

  /**
   * recommendation으로 현재 입력 중인 키워드 검색창을 자동완성한다.
   * @param recommendation 
   */
  const autoComplete = (recommendation: Recommendation): void  => {
    // 검색창의 문구를 바꾼다.
    if (keywords.length === 1)
      setRaw(recommendation.name);
    else
      setRaw(keywords.slice(0, keywords.length - 1).join(' ') + ' ' + recommendation.name);
    
    // 키워드도 동기화해준다. 그동안 돌고있던 디바운스는 취소시킨다.
    if (onChangeKeywordTimer)
      clearTimeout(onChangeKeywordTimer);

    onChangeKeyword(keywords.slice(0, keywords.length - 1).concat([recommendation.name]));
  }

  /**
   * 뷰!
   */
  return (
    <div className='search-bar'>
      <input type='search' placeholder='영문 태그를 입력해주세요' onChange={(evt) => {
        // onChangeKeyword 디바운싱
        if (onChangeKeywordTimer)
          clearTimeout(onChangeKeywordTimer);
        
        onChangeKeywordTimer = setTimeout(() => onChangeKeyword(evt.target.value.split(' ')), DEBOUNCE_TIME);
        
        setRaw(evt.target.value);
      }} value={raw} />

      {/* 추천 키워드들을 나열한다 */}
      <div>
        {recommendations.map(record => 
        <div key={record.name} 
          className='recommendation'
          onClick={() => autoComplete(record)}>
            {record.name + ` (${record.posts})`}
          </div>)}
      </div>
    </div>
  );
};