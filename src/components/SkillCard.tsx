const SkillCard = ({ 
  skillName = "React JS", 
  progress = 65, 
  subtopicsLeft = 8,
  totalSubtopics = 20 
}) => {
  const progressPercentage = Math.min(100, Math.max(0, progress));
  const completedSubtopics = totalSubtopics - subtopicsLeft;
  
  return (
    <div className="w-full bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-gray-200 overflow-hidden group">
      {/* Clean white background with subtle shadow - Jobs loved clean surfaces */}
      
      {/* Main content with generous white space */}
      <div className="p-8 h-full flex flex-col justify-between min-h-[200px]">
        
        {/* Header - Clean typography, no clutter */}
        <div className="space-y-1">
          <h2 className="text-2xl font-light text-gray-900 tracking-tight">
            {skillName}
          </h2>
          <p className="text-sm text-gray-500 font-normal">
            {subtopicsLeft} remaining of {totalSubtopics}
          </p>
        </div>

        {/* Progress - Elegant, functional, no decoration */}
        <div className="space-y-6">
          {/* Large, clear progress number - Jobs loved big, readable numbers */}
          <div className="text-center">
            <div className="text-4xl font-ultralight text-gray-900 mb-1">
              {progressPercentage}<span className="text-2xl text-gray-400">%</span>
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-wider font-medium">
              Complete
            </div>
          </div>

          {/* Minimalist progress bar - Clean, functional, no gradients */}
          <div className="space-y-3">
            <div className="w-full bg-gray-100 rounded-full h-1">
              <div 
                className="bg-gray-900 h-1 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            
            {/* Clean completion indicator */}
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 font-medium">
                {completedSubtopics} completed
              </span>
              <span className="text-gray-600 font-medium">
                {progressPercentage < 100 ? 'In Progress' : 'Complete'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle hover effect - Jobs preferred understated interactions */}
      <div className="absolute inset-0 bg-gray-50 opacity-0 group-hover:opacity-30 transition-opacity duration-200 pointer-events-none rounded-3xl" />
    </div>
  );
};

export default SkillCard;