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
  compact = false,
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
    <div className={`mb-10 grid grid-cols-1 gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] md:grid-cols-3 ${compact ? 'p-4' : 'p-5'}`}>
      <label className="sr-only" htmlFor="dashboard-search-input">Search skills</label>
      <input
        id="dashboard-search-input"
        value={search}
        onChange={handleSearch}
        placeholder="Search skills or subtopics"
        className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-2.5 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none"
        aria-label="Search skills and subtopics"
      />
      <label className="sr-only" htmlFor="dashboard-filter-select">Filter by status</label>
      <select
        id="dashboard-filter-select"
        value={filter}
        onChange={handleFilter}
        className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-2.5 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none"
        aria-label="Filter by status"
      >
        <option value="all">All Status</option>
        <option value="not-started">Not Started</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
      <label className="sr-only" htmlFor="dashboard-sort-select">Sort skills</label>
      <select
        id="dashboard-sort-select"
        value={sort}
        onChange={handleSort}
        className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-2.5 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none"
        aria-label="Sort skills"
      >
        <option value="progress">Recommended: Most progress</option>
        <option value="remaining">Least topics left</option>
        <option value="hours">Most study hours</option>
        <option value="name">A to Z</option>
      </select>
    </div>
  );
}
