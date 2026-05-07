'use client';

import type { FilterStatus } from '@/lib/types';

interface Props {
  current: FilterStatus;
  onChange: (filter: FilterStatus) => void;
}

const TABS: { label: string; value: FilterStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
];

export default function FilterTabs({ current, onChange }: Props) {
  return (
    <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800" role="tablist">
      {TABS.map(({ label, value }) => (
        <button
          key={value}
          role="tab"
          aria-selected={current === value}
          onClick={() => onChange(value)}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            current === value
              ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
