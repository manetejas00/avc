import React from 'react';

/**
 * Very basic custom SplitText equivalent that splits a string into an array of words
 * wrapped in spans, so we can animate them easily.
 */
export const splitWords = (text: string) => {
  return text.split(' ').map((word, i) => (
    <span key={i} className="inline-block overflow-hidden relative mr-[0.25em] align-bottom">
      <span className="inline-block word-inner">{word}</span>
    </span>
  ));
};

export const splitLines = (text: string[]) => {
    return text.map((line, i) => (
      <span key={i} className="block overflow-hidden relative">
        <span className="block line-inner">{line}</span>
      </span>
    ));
};
