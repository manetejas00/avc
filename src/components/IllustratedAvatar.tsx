// Original SVG characters; no photographs or real-person likenesses are used.
export default function IllustratedAvatar({ variant }: { variant: number }) {
  const palettes = ['#374f63', '#71586c', '#436453', '#786045', '#4c5271'];
  const skin = ['#bc805d', '#d19a71', '#a66d4b', '#c08a63', '#dbac86'][variant % 5];
  const longHair = variant % 2 === 1;
  return <svg viewBox="0 0 80 80" className="illustrative-avatar" aria-hidden="true" focusable="false">
    <rect width="80" height="80" rx="40" fill={palettes[variant % 5]}/>
    {longHair && <path d="M19 52V29c0-27 42-27 42 0v23Z" fill="#292322"/>}
    <path d="M10 80v-9c0-24 60-24 60 0v9" fill={variant % 3 === 0 ? '#d4b567' : '#e5ddce'}/>
    <path d="M32 49v12q8 10 16 0V49" fill={skin}/>
    <ellipse cx="40" cy="33" rx="17" ry="22" fill={skin}/>
    <path d={longHair ? 'M22 34V25C22 5 60 3 58 30 48 29 40 19 37 16 34 27 28 31 22 34Z' : 'M22 30V23C22 3 61 5 58 28L48 21 34 23 25 34Z'} fill="#292322"/>
    <path d="M31 34h2m14 0h2" stroke="#292322" strokeWidth="3" strokeLinecap="round"/>
    <path d="M36 44q4 3 8 0" fill="none" stroke="#713f31" strokeWidth="2" strokeLinecap="round"/>
    {variant % 3 === 2 && <g fill="none" stroke="#35302e" strokeWidth="1.5"><rect x="26" y="29" width="11" height="10" rx="3"/><rect x="43" y="29" width="11" height="10" rx="3"/><path d="M37 33h6"/></g>}
  </svg>;
}
