import SkillCard from '../components/SkillCard';
import AddTaskButton from '../components/AddTaskButton';
import { skillData } from '../data/skills';
import { useState } from 'react';
import LearningPlanModal from '../components/LearningPlanModal';
import { useNavigate } from 'react-router-dom';

const SkillDashboard = () => {
    const navigate=useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
      const handleAddClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  const handleViewPlan = () => {
    navigate('/journey');
    handleCloseModal();
  };
  return (
    <div className="min-h-screen w-screen bg-gray-50 overflow-y-auto">
      
      {/* Clean, spacious layout with generous margins */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        
        {/* Simple, elegant header */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-light text-gray-900 mb-4 tracking-tight">
            Learning Progress
          </h1>
          <p className="text-lg text-gray-500 font-normal max-w-2xl mx-auto">
            Track your journey through technology skills with clarity and focus.
          </p>
        </div>

        {/* Clean grid with optimal spacing */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {skillData.map(skill => {
            const total = skill.subtopics.length;
            const completed = skill.subtopics.filter(s => s.status === 'completed').length;
            const subtopicsLeft = total - completed;
            const progress = Math.round((completed / total) * 100);

            return (
              <SkillCard
                key={skill.id}
                skillName={skill.name}
                progress={progress}
                subtopicsLeft={subtopicsLeft}
                totalSubtopics={total}
              />
            );
          })}
        </div>
      </div>


      <AddTaskButton onClick={handleAddClick} />
          <LearningPlanModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onViewPlan={handleViewPlan}
      />
    </div>
  );
};

export default SkillDashboard;