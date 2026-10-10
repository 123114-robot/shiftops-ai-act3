import type { AvailabilityEntry, DayOfWeek } from '../../api/availability';

const labels: Record<DayOfWeek, string> = {
  MONDAY: 'Monday', TUESDAY: 'Tuesday', WEDNESDAY: 'Wednesday', THURSDAY: 'Thursday',
  FRIDAY: 'Friday', SATURDAY: 'Saturday', SUNDAY: 'Sunday',
};

export function AvailabilityWeek({ entries, editable = false, onChange }: {
  entries: AvailabilityEntry[];
  editable?: boolean;
  onChange?: (entries: AvailabilityEntry[]) => void;
}) {
  function update(dayOfWeek: DayOfWeek, changes: Partial<AvailabilityEntry>) {
    onChange?.(entries.map((entry) => entry.dayOfWeek === dayOfWeek ? { ...entry, ...changes } : entry));
  }

  return <div className="availability-week">
    {entries.map((entry) => <article className="availability-day" key={entry.dayOfWeek}>
      <div>
        <h2>{labels[entry.dayOfWeek]}</h2>
        {editable && <label className="availability-toggle"><input type="checkbox" checked={entry.isAvailable} onChange={(event) => update(entry.dayOfWeek, event.target.checked ? { isAvailable: true, startTime: '09:00', endTime: '17:00' } : { isAvailable: false, startTime: null, endTime: null })} /> {labels[entry.dayOfWeek]} available</label>}
      </div>
      {editable ? <div className="availability-times">
        <label>{labels[entry.dayOfWeek]} start time<input aria-label={`${labels[entry.dayOfWeek]} start time`} type="time" value={entry.startTime ?? ''} disabled={!entry.isAvailable} onChange={(event) => update(entry.dayOfWeek, { startTime: event.target.value })} /></label>
        <label>{labels[entry.dayOfWeek]} end time<input aria-label={`${labels[entry.dayOfWeek]} end time`} type="time" value={entry.endTime ?? ''} disabled={!entry.isAvailable} onChange={(event) => update(entry.dayOfWeek, { endTime: event.target.value })} /></label>
      </div> : <p className={entry.isAvailable ? '' : 'muted'}>{entry.isAvailable ? `${entry.startTime}–${entry.endTime}` : 'Unavailable'}</p>}
    </article>)}
  </div>;
}
