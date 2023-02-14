import React from 'react';

import './CSS/checkmark.css';

// const PREDEFINED_SIZE_MAP = {
//   small: '16px',
//   medium: '24px',
//   large: '52px',
//   xLarge: '72px',
//   xxLarge: '96px',
// };

export function Checkmark() {
  //const computedSize = PREDEFINED_SIZE_MAP[size] || size;
  const color="#4ade80"
  const style = { width: "72px", height: "72px" };
  //if (color) {
    //style['--checkmark-fill-color'] = color;
  //}

  return (
    <svg
      className='checkmark'
      xmlns='http://www.w3.org/2000/svg'
      style={style}
      viewBox='0 0 52 52'
    >
      <circle className='checkmark__circle' cx='26' cy='26' r='25' fill='none' />
      <path className='checkmark__check' fill='none' d='M14.1 27.2l7.1 7.2 16.7-16.8' />
    </svg>
  );
}
