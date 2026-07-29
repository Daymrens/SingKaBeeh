import { useEffect } from 'react';
import { playSound } from '../utils/sounds';

export default function OverlayIcon({ emoji }) {
  useEffect(() => {
    if (emoji === '❌') playSound('wrong');
  }, [emoji]);

  return (
    <div
      className="overlay-icon"
      style={{ fontSize: emoji === '❌' ? '12rem' : '8rem' }}
    >
      {emoji}
    </div>
  );
}
