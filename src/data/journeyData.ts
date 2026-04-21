import type { LearningPlan } from '../types/domain';

export const dummyJourneyData: LearningPlan = {
  id: "journey-1",
  courseName: "Machine Learning Fundamentals",
  dateCreated: "2025-01-15",
  totalTopics: 12,
  completedTopics: 3,
  estimatedTotalHours: 40,
  subtopics: [
    {
      id: "subtopic-1",
      title: "Introduction to Machine Learning",
      description: "Understanding the basics of ML, types of learning, and real-world applications",
      isCompleted: true,
      estimatedHours: 2
    },
    {
      id: "subtopic-2",
      title: "Data Preprocessing and Cleaning",
      description: "Learn techniques for preparing and cleaning data for ML models",
      isCompleted: true,
      estimatedHours: 4
    },
    {
      id: "subtopic-3",
      title: "Linear Regression",
      description: "Understanding linear regression algorithms and implementation",
      isCompleted: true,
      estimatedHours: 3
    },
    {
      id: "subtopic-4",
      title: "Logistic Regression",
      description: "Classification algorithms using logistic regression",
      isCompleted: false,
      estimatedHours: 3
    },
    {
      id: "subtopic-5",
      title: "Decision Trees and Random Forest",
      description: "Tree-based algorithms for classification and regression",
      isCompleted: false,
      estimatedHours: 4
    },
    {
      id: "subtopic-6",
      title: "Support Vector Machines",
      description: "Understanding SVM algorithms for classification and regression",
      isCompleted: false,
      estimatedHours: 3
    },
    {
      id: "subtopic-7",
      title: "K-Means Clustering",
      description: "Unsupervised learning with clustering algorithms",
      isCompleted: false,
      estimatedHours: 3
    },
    {
      id: "subtopic-8",
      title: "Neural Networks Basics",
      description: "Introduction to artificial neural networks and perceptrons",
      isCompleted: false,
      estimatedHours: 4
    },
    {
      id: "subtopic-9",
      title: "Model Evaluation and Validation",
      description: "Techniques for evaluating model performance and avoiding overfitting",
      isCompleted: false,
      estimatedHours: 3
    },
    {
      id: "subtopic-10",
      title: "Feature Engineering",
      description: "Advanced techniques for creating and selecting features",
      isCompleted: false,
      estimatedHours: 4
    },
    {
      id: "subtopic-11",
      title: "Ensemble Methods",
      description: "Combining multiple models for better performance",
      isCompleted: false,
      estimatedHours: 3
    },
    {
      id: "subtopic-12",
      title: "Model Deployment",
      description: "Deploying ML models to production environments",
      isCompleted: false,
      estimatedHours: 4
    }
  ]
};
