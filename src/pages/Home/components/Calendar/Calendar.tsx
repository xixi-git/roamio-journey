import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, ChevronDown } from 'lucide-react';
import { parseTripDate, type Trip } from '../../trips';
import './Calendar.css';

const getTripYears = (trips: Trip[]) => [...new Set(trips.flatMap(({ start, end }) => [start, end].map((date) => Number(date.slice(0, 4)))))].sort((a, b) => a - b);

const MONTH_FORMAT = new Intl.DateTimeFormat('en', { month: 'short' });
const DATE_FORMAT = new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short' });

function monthPosition(date: Date, start: Date) {
  const monthDelta = (date.getFullYear() - start.getFullYear()) * 12 + date.getMonth() - start.getMonth();
  return monthDelta + (date.getDate() - 1) / new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export default function Calendar({ trips }: { trips: Trip[] }) {
  const tripYears = getTripYears(trips);
  const [windowStart, setWindowStart] = useState(() => {
    const today = new Date();
    const year = tripYears.includes(today.getFullYear()) ? today.getFullYear() : tripYears[0];
    const month = year === today.getFullYear() ? today.getMonth() : 0;
    return new Date(year, month, 1);
  });
  const months = useMemo(() => Array.from({ length: 6 }, (_, index) => new Date(windowStart.getFullYear(), windowStart.getMonth() + index, 1)), [windowStart]);
  const windowEnd = new Date(windowStart.getFullYear(), windowStart.getMonth() + 6, 1);
  const rangeLabel = `${MONTH_FORMAT.format(months[0])} – ${MONTH_FORMAT.format(months[5])}`;

  const shiftWindow = (amount: number) => {
    setWindowStart((current) => {
      const next = new Date(current.getFullYear(), current.getMonth() + amount, 1);
      return next.getFullYear() < tripYears[0] || next.getFullYear() > tripYears[tripYears.length - 1] ? current : next;
    });
  };

  const selectYear = (year: number) => {
    setWindowStart(new Date(year, 0, 1));
  };

  const positionedTrips = trips.flatMap((trip) => {
    const startDate = parseTripDate(trip.start);
    const tripEnd = parseTripDate(trip.end);
    const endDate = new Date(tripEnd.getFullYear(), tripEnd.getMonth(), tripEnd.getDate() + 1);
    if (endDate <= windowStart || startDate >= windowEnd) return [];

    const clippedStart = startDate < windowStart ? windowStart : startDate;
    const clippedEnd = endDate > windowEnd ? windowEnd : endDate;
    const left = Math.max(0, monthPosition(clippedStart, windowStart));
    const right = Math.min(6, monthPosition(clippedEnd, windowStart));
    const visibleStart = DATE_FORMAT.format(startDate);
    const visibleEnd = DATE_FORMAT.format(new Date(endDate.getTime() - 86400000));
    return [{ ...trip, left: `${(left / 6) * 100}%`, width: `${Math.max(2.5, ((right - left) / 6) * 100)}%`, visibleStart, visibleEnd }];
  });

  return (
    <section className="home-panel home-calendar" aria-label="Travel calendar">
      <div className="calendar-topline">
        <h2><CalendarDays aria-hidden="true" />Calendar</h2>
        <label className="calendar-year">
          <span className="sr-only">Select calendar year</span>
          <select value={windowStart.getFullYear()} onChange={(event) => selectYear(Number(event.target.value))}>
            {tripYears.map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
          <ChevronDown aria-hidden="true" />
        </label>
      </div>
      <div className="calendar-navigation">
        <button type="button" aria-label="Show previous six months" onClick={() => shiftWindow(-6)} disabled={windowStart.getFullYear() === tripYears[0] && windowStart.getMonth() < 6}><ArrowLeft /></button>
        <strong>{rangeLabel}</strong>
        <button type="button" aria-label="Show next six months" onClick={() => shiftWindow(6)} disabled={windowStart.getFullYear() === tripYears[tripYears.length - 1] && windowStart.getMonth() >= 6}><ArrowRight /></button>
      </div>
      <div className="calendar-timeline">
        <div className="calendar-months" aria-hidden="true">{months.map((month) => <span key={`${month.getFullYear()}-${month.getMonth()}`}>{MONTH_FORMAT.format(month)}</span>)}</div>
        <div className="calendar-tracks">
          <div className="calendar-grid-lines" aria-hidden="true">{months.map((month) => <span key={`${month.getFullYear()}-${month.getMonth()}`} />)}</div>
          {positionedTrips.map((trip) => (
            <article className="calendar-trip" key={trip.city} style={{ left: trip.left, width: trip.width, top: `${12 + trip.lane * 46}px`, transform: Number.parseFloat(trip.left) > 80 ? 'translateX(-100%)' : undefined }} title={`${trip.city}: ${trip.visibleStart} – ${trip.visibleEnd}`}>
              <div className="calendar-trip-copy"><strong>{trip.city}</strong><span>{trip.visibleStart} – {trip.visibleEnd}</span></div>
              <img src={`https://images.unsplash.com/${trip.image}?auto=format&fit=crop&w=96&h=96&q=75`} alt={trip.alt} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
