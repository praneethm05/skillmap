
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
      className="fixed bottom-8  right-8 w-14 h-14 bg-gray-900 hover:bg-gray-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
      aria-label="Add new task"
    >
      <Plus 
        className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" 
        strokeWidth={1.5}
      />
    </button>
  );
};

export default AddTaskButton;