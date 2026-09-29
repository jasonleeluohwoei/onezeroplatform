import React from 'react';
import { Stat } from './ui';

export function StatsStrip({
  items,
  cols = 4,
}: {
  items: { label: string; value: string | number; tone?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'gray'; icon?: any; sub?: string }[];
  cols?: number;
}) {
  const grid = { 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-4', 5: 'sm:grid-cols-5', 6: 'sm:grid-cols-6' }[cols] || 'sm:grid-cols-4';
  return (
    <div className={`grid grid-cols-2 gap-3 ${grid}`}>
      {items.map((i) => (
        <Stat key={i.label} label={i.label} value={i.value} tone={i.tone} icon={i.icon} sub={i.sub} />
      ))}
    </div>
  );
}
