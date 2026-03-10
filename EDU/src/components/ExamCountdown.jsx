import { useState, useEffect } from 'react';

const EXAM_DATES = {
  S1: { date: '2026-11-15', label: 'S1 End Semester Exams' },
  S2: { date: '2027-06-10', label: 'S2 End Semester Exams' },
  S3: { date: '2026-11-20', label: 'S3 End Semester Exams' },
  S4: { date: '2027-04-25', label: 'S4 End Semester Exams' },
  S5: { date: '2026-11-24', label: 'S5 End Semester Exams' },
  S6: { date: '2027-04-25', label: 'S6 End Semester Exams' },
  S7: { date: '2026-11-15', label: 'S7 End Semester Exams' },
  S8: { date: '2027-04-20', label: 'S8 End Semester (Final)' },
};

function calcTime(deadline) {
  const dist = new Date(deadline).getTime() - Date.now();
  if (dist <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    days:    Math.floor(dist / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((dist % (1000 * 60)) / 1000),
    expired: false,
  };
}

export default function ExamCountdown({ semester }) {
  const exam = EXAM_DATES[semester] || EXAM_DATES['S6'];
  const [time, setTime] = useState(calcTime(exam.date));

  useEffect(() => {
    const id = setInterval(() => setTime(calcTime(exam.date)), 1000);
    return () => clearInterval(id);
  }, [exam.date]);

  const urgent = time.days < 30;

  return (
    <div className={`exam-countdown-widget${urgent ? ' ecw-urgent' : ''}`}>
      <div className="ecw-info">
        <h2>
          <i className="fas fa-clock" style={{ marginRight: '0.6rem', opacity: 0.8 }}></i>
          {exam.label}
        </h2>
        <p style={{ opacity: 0.8, fontSize: '0.88rem' }}>
          {time.expired
            ? '🎉 Exams are over!'
            : `${time.days} days remaining — stay on track!`}
        </p>
      </div>
      {!time.expired && (
        <div className="ecw-timer">
          {[['days', time.days], ['hours', time.hours], ['mins', time.minutes], ['secs', time.seconds]].map(([lbl, val]) => (
            <div className="ecw-cell" key={lbl}>
              <span className="val">{String(val).padStart(2, '0')}</span>
              <span className="lbl">{lbl}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
