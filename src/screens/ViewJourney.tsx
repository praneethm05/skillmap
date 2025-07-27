import React, { useState } from 'react';
import { dummyJourneyData } from '../data/journeyData';
import type { JourneyData } from '../data/journeyData';
import { useNavigate } from 'react-router-dom';

const ViewJourney = () => {
  const [journeyData, setJourneyData] = useState<JourneyData>(dummyJourneyData);

  const toggleSubtopicCompletion = (subtopicId: string) => {
    setJourneyData(prevData => {
      const updatedSubtopics = prevData.subtopics.map(subtopic =>
        subtopic.id === subtopicId
          ? { ...subtopic, isCompleted: !subtopic.isCompleted }
          : subtopic
      );

      // Recalculate completed topics count
      const completedCount = updatedSubtopics.filter(s => s.isCompleted).length;

      return {
        ...prevData,
        subtopics: updatedSubtopics,
        completedTopics: completedCount
      };
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/dashboard');
  };

  const progressPercentage = Math.round((journeyData.completedTopics / journeyData.totalTopics) * 100);
  const completedHours = journeyData.subtopics
    .filter(s => s.isCompleted)
    .reduce((total, subtopic) => total + subtopic.estimatedHours, 0);

  return (
    <div className="min-h-screen w-screen bg-gray-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-8 py-16">
        
        {/* Header Section */}
        <div className="mb-12">
          <div className="mb-8">
            <button className="text-white bg-[#1a1a1a] rounded-sm p-3 font-normal mb-6 flex items-center transition-colors" onClick={handleBackClick}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
            
            <h1 className="text-4xl font-light text-gray-900 mb-4 tracking-tight">
              {journeyData.courseName}
            </h1>
            
            <div className="flex items-center gap-6 text-gray-600 font-normal">
              <span>Created on {formatDate(journeyData.dateCreated)}</span>
              <span>•</span>
              <span>{journeyData.totalTopics} topics</span>
              <span>•</span>
              <span>{journeyData.estimatedTotalHours} hours estimated</span>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-light text-gray-900 mb-2">Learning Progress</h2>
                <p className="text-gray-600 font-normal">
                  {journeyData.completedTopics} of {journeyData.totalTopics} topics completed
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-light text-gray-900 mb-1">
                  {progressPercentage}%
                </div>
                <div className="text-sm text-gray-600">
                  {completedHours}h / {journeyData.estimatedTotalHours}h
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className="bg-gray-900 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Subtopics Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-light text-gray-900 mb-8 tracking-tight">
            Learning Path
          </h2>
          
          <div className="space-y-4">
            {journeyData.subtopics.map((subtopic, index) => (
              <div 
                key={subtopic.id}
                className={`bg-white rounded-lg p-6 shadow-sm border transition-all duration-200 ${
                  subtopic.isCompleted 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Custom Checkbox */}
                 <button
  onClick={() => toggleSubtopicCompletion(subtopic.id)}
  className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
    subtopic.isCompleted
      ? 'bg-green-600 border-green-600'
      : 'border-gray-300 hover:border-gray-400'
  }`}
>
  {subtopic.isCompleted && (
    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  )}
</button>


                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-400">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <h3 className={`text-lg font-normal ${
                          subtopic.isCompleted ? 'text-gray-600 line-through' : 'text-gray-900'
                        }`}>
                          {subtopic.title}
                        </h3>
                      </div>
                      <span className="text-sm text-gray-600 font-normal">
                        {subtopic.estimatedHours}h
                      </span>
                    </div>
                    
                    <p className={`text-gray-600 font-normal leading-relaxed ${
                      subtopic.isCompleted ? 'opacity-70' : ''
                    }`}>
                      {subtopic.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center pt-8">
          <button className="px-8 py-3 text-white-900 font-normal border border-white-200 rounded-lg hover:bg-white-50 transition-colors">
            Export Progress
          </button>
          <button className="px-8 py-3 bg-gray-900 text-white font-normal rounded-lg hover:bg-gray-800 transition-colors">
            Continue Learning
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewJourney;