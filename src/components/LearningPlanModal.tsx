import  { useState } from 'react';


type LearningPlanModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onViewPlan: (skillInput: string) => void;
};

const LearningPlanModal = ({ isOpen, onClose, onViewPlan }: LearningPlanModalProps) => {
  const [modalStep, setModalStep] = useState(1); 
  const [skillInput, setSkillInput] = useState('');

  const handleNext = () => {
    if (skillInput.trim()) {
      setModalStep(2);
      
      // Mock loading - simulate API call
      setTimeout(() => {
        setModalStep(3);
      }, 2000);
    }
  };

  const handleClose = () => {
    
    setModalStep(1);
    setSkillInput('');
    onClose();
  };

  const handleViewPlan = () => {
    onViewPlan(skillInput);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 overflow-hidden">
        
        {/* Step 1: Input */}
        {modalStep === 1 && (
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-light text-gray-900 mb-3">
                What would you like to learn?
              </h2>
              <p className="text-gray-500 font-normal">
                Enter a skill or topic you want to master
              </p>
            </div>

            <div className="mb-8">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="e.g., Machine Learning, React.js, Data Structures"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent font-normal"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && skillInput.trim()) {
                    handleNext();
                  }
                }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-6 py-3 text-gray-600 font-normal border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleNext}
                disabled={!skillInput.trim()}
                className="flex-1 px-6 py-3 bg-gray-900 text-white font-normal rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Generating */}
        {modalStep === 2 && (
          <div className="p-8 text-center">
            <div className="mb-8">
              <div className="w-12 h-12 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-6"></div>
              <h2 className="text-2xl font-light text-gray-900 mb-3">
                Generating Learning Plan
              </h2>
              <p className="text-gray-500 font-normal">
                Creating a personalized roadmap for <span className="font-medium">{skillInput}</span>
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Generated */}
        {modalStep === 3 && (
          <div className="p-8 text-center">
            <div className="mb-8">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-light text-gray-900 mb-3">
                Learning Plan Generated
              </h2>
              <p className="text-gray-500 font-normal">
                Your personalized roadmap for <span className="font-medium">{skillInput}</span> is ready
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-6 py-3 text-gray-600 font-normal border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleViewPlan}
                className="flex-1 px-6 py-3 bg-gray-900 text-white font-normal rounded-lg hover:bg-gray-800 transition-colors"
              >
                View Plan
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default LearningPlanModal;
