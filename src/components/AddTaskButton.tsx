import { Plus } from 'lucide-react';

type AddTaskButtonProps = {
  onClick?: () => void;
  hidden?: boolean;
};

const AddTaskButton = ({ onClick, hidden = false }: AddTaskButtonProps) => {
  if (hidden) return null;

  return (
    <button
      onClick={onClick}
      className="group fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-accent)] text-white shadow-[var(--shadow-raised)] transition-all duration-200 hover:bg-[var(--color-accent-hover)] hover:shadow-[0_8px_32px_rgba(31,59,44,0.25)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 sm:bottom-8 sm:right-8"
      aria-label="Create a new learning plan"
      title="New learning plan"
    >
      <Plus
        className="h-6 w-6 transition-transform duration-200 group-hover:rotate-90"
        strokeWidth={1.5}
      />
    </button>
  );
};

export default AddTaskButton;
