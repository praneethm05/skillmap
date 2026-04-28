import { type ChangeEvent } from 'react';

export type DashboardFilter = 'all' | 'not-started' | 'in-progress' | 'completed';
export type DashboardSort = 'progress' | 'remaining' | 'hours' | 'name';

interface DashboardControlsProps {
  search: string;
  filter: DashboardFilter;
  sort: DashboardSort;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: DashboardFilter) => void;
  onSortChange: (value: DashboardSort) => void;
  compact?: boolean;
}

export default function DashboardControls({
  search,
  filter,
  sort,
  onSearchChange,
  onFilterChange,
  onSortChange,
}: DashboardControlsProps) {
  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  const handleFilter = (event: ChangeEvent<HTMLSelectElement>) => {
    onFilterChange(event.target.value as DashboardFilter);
  };

  const handleSort = (event: ChangeEvent<HTMLSelectElement>) => {
    onSortChange(event.target.value as DashboardSort);
  };

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <label className="sr-only" htmlFor="dashboard-search-input">Search skills</label>
      <input
        id="dashboard-search-input"
        value={search}
        onChange={handleSearch}
        placeholder="Search…"
        className="min-w-0 flex-1 rounded-[0.625rem] border border-[var(--color-border-light)] bg-[var(--color-surface)] px-4 py-2 text-[var(--color-text)] placeholder-[var(--color-text-subtle)] focus:border-[var(--color-accent)] focus:outline-none sm:max-w-xs"
        style={{ fontSize: 'var(--text-caption)' }}
        aria-label="Search skills and subtopics"
      />
      <label className="sr-only" htmlFor="dashboard-filter-select">Filter by status</label>
      <select
        id="dashboard-filter-select"
        value={filter}
        onChange={handleFilter}
        className="rounded-[0.625rem] border border-[var(--color-border-light)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none"
        style={{ fontSize: 'var(--text-caption)' }}
        aria-label="Filter by status"
      >
        <option value="all">All</option>
        <option value="not-started">Not Started</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
      <label className="sr-only" htmlFor="dashboard-sort-select">Sort skills</label>
      <select
        id="dashboard-sort-select"
        value={sort}
        onChange={handleSort}
        className="rounded-[0.625rem] border border-[var(--color-border-light)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none"
        style={{ fontSize: 'var(--text-caption)' }}
        aria-label="Sort skills"
      >
        <option value="progress">Most progress</option>
        <option value="remaining">Least remaining</option>
        <option value="hours">Most hours</option>
        <option value="name">A to Z</option>
      </select>
    </div>
  );
}
