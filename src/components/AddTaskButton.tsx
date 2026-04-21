
import { Plus } from 'lucide-react';

type AddTaskButtonProps = {
  onClick?: () => void;
};


const AddTaskButton = ({ onClick }: AddTaskButtonProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      console.log('Add new task');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-40 h-14 w-14 rounded-xl bg-gray-900 text-white shadow-lg transition-all duration-200 hover:bg-gray-800 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 flex items-center justify-center group"
      aria-label="Add new task"
      title="Generate a learning plan"
    >
      <Plus 
        className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" 
        strokeWidth={1.5}
      />
    </button>
  );
};

export default AddTaskButton;
