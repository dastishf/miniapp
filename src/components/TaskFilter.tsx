import { Button } from "./ui/button";

interface TaskFilterProps {
  currentFilter: 'all' | 'active' | 'completed';
  onFilterChange: (filter: 'all' | 'active' | 'completed') => void;
  taskCounts: {
    all: number;
    active: number;
    completed: number;
  };
}

export function TaskFilter({ currentFilter, onFilterChange, taskCounts }: TaskFilterProps) {
  const filters = [
    { key: 'all' as const, label: 'All', count: taskCounts.all },
    { key: 'active' as const, label: 'Active', count: taskCounts.active },
    { key: 'completed' as const, label: 'Completed', count: taskCounts.completed },
  ];

  return (
    <div className="flex gap-2 mb-4">
      {filters.map((filter) => (
        <Button
          key={filter.key}
          variant={currentFilter === filter.key ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange(filter.key)}
          className="flex-1"
        >
          {filter.label} ({filter.count})
        </Button>
      ))}
    </div>
  );
}