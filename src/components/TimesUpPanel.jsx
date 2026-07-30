import { useEffect } from 'react';

export default function TimesUpPanel({ onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 2000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="timesup-panel" onClick={onDismiss}>
      <div className="box">
        <h2>⏰ Time's Up!</h2>
      </div>
    </div>
  );
}
