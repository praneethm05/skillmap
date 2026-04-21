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
    <div className="mb-10 grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-5 md:grid-cols-3">
      <input
        value={search}
        onChange={handleSearch}
        placeholder="Search skills or subtopics"
        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-gray-500 focus:outline-none"
      />
      <select
        value={filter}
        onChange={handleFilter}
        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-gray-500 focus:outline-none"
      >
        <option value="all">All Status</option>
        <option value="not-started">Not Started</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
      <select
        value={sort}
        onChange={handleSort}
        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-gray-500 focus:outline-none"
      >
        <option value="progress">Sort: Completion</option>
        <option value="remaining">Sort: Remaining Topics</option>
        <option value="hours">Sort: Estimated Hours</option>
        <option value="name">Sort: Name</option>
      </select>
    </div>
  );
}
