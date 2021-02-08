import React, { useState, useEffect } from 'react';

type SearchEngineProps = {
  onSearchStart: (keywords) => void
};

type Recommendation = {
  tagName: string,
  numOfPosts: number
};

const DEBOUNCE_TIME = 300;

/**
 * 태그 검색 엔진
 * @param props 
 */
export const SearchEngine = (props: SearchEngineProps) => {
  // 검색 바에 표시될 내용
  const [raw, setRaw] = useState('');

  // 키워드!
  const [keywords, setKeywords] = useState([] as string[]);

  // 추천키워드들
  const [recommendations, setRecommendations] = useState([] as Recommendation[]);

  const [debounceTimer, setDebounceTimer] = useState(null);

  // 추천키워드 표시 여부
  const [recommendationOn, setRecommendationOn] = useState(false);

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
    .then(jsonArray => {
      // 결과물을 하나하나씩 recommendations에 담아준다.
      const new_recommendations = jsonArray.map(record => {
        return { tagName: record.tagName, numOfPosts: parseInt(record.numOfPosts) };
      });

      setRecommendations(new_recommendations);
    })
    .catch(exception => console.log(exception));
  }, [keywords]);

  /**
   * 디바운스 된 함수
   * @param new_keywords 
   */
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
    
    setRecommendationOn(true);
  };

  /**
   * recommendation으로 현재 입력 중인 키워드 검색창을 자동완성한다.
   * @param recommendation 
   */
  const autoComplete = (recommendation: Recommendation): void  => {
    // 검색창의 문구를 바꾼다.
    if (keywords.length === 1)
      setRaw(recommendation.tagName);
    else
      setRaw(keywords.slice(0, keywords.length - 1).join(' ') + ' ' + recommendation.tagName);
    
    // 키워드도 동기화해준다. 그동안 돌고있던 디바운스는 취소시킨다.
    if (debounceTimer)
      clearTimeout(debounceTimer);

    onChangeKeyword(keywords.slice(0, keywords.length - 1).concat([recommendation.tagName]));
    
    // 자동완성을 했으면 검색어 키워드 추천창은 닫는다.
    setRecommendationOn(false);
  }

  /**
   * 뷰!
   */
  return (
    <div className='search-bar'>
      {/* 검색 버튼 */}
      <input type='button' value='Search' onClick={() => {
        props.onSearchStart(keywords);

        setRecommendationOn(false);
      }} />

      <div className='search-bar-sub'>
        {/* 검색어 */}
        <input type='search' placeholder='Type some tags...' onChange={(evt) => {
          // onChangeKeyword 디바운싱
          if (debounceTimer)
            clearTimeout(debounceTimer);
          
          setDebounceTimer(setTimeout(() => onChangeKeyword(evt.target.value.split(' ')), DEBOUNCE_TIME));
          
          setRaw(evt.target.value);
        }} onKeyUp={(evt) => {
          // 키보드 엔터를 치면 onSearchStart를 호출한다.
          if (evt.key === 'Enter') {
            if (debounceTimer)
              clearTimeout(debounceTimer);
              
            props.onSearchStart(keywords);

            setRecommendationOn(false);
          }
        }} value={raw} />

        {/* 추천 키워드들을 나열한다 */}
        <div className={'recommendation-container transition' + (recommendationOn ? '' : ' close')}>
          {recommendations.map((record: Recommendation) => 
          <div key={record.tagName} className='recommendation' onClick={() => autoComplete(record)}>
            {record.tagName + ` (${record.numOfPosts})`}
          </div>)}
        </div>
      </div>
    </div>
  );
};