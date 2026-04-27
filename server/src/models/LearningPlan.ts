import mongoose, { Schema, Document } from 'mongoose';

// ----------------------------------------------------------------------------
// Types mirroring the frontend domain models (src/types/domain.ts)
// ----------------------------------------------------------------------------
export type ResourceType = 'video' | 'article' | 'documentation' | 'course';

export interface ILearningResource {
  title: string;
  type: ResourceType;
  url: string;
}

export interface IPlanSubtopic {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  estimatedHours: number;
  resources: ILearningResource[];
}

export interface ILearningPlan extends Document {
  userId: string;
  courseName: string;
  dateCreated: Date;
  totalTopics: number;
  completedTopics: number;
  estimatedTotalHours: number;
  subtopics: IPlanSubtopic[];
}

// ----------------------------------------------------------------------------
// Mongoose Schemas (Embedded Document Pattern)
// ----------------------------------------------------------------------------
const LearningResourceSchema = new Schema<ILearningResource>(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ['video', 'article', 'documentation', 'course'], required: true },
    url: { type: String, required: true },
  },
  { _id: false } // No _id needed for deep nested resources to save space
);

const PlanSubtopicSchema = new Schema<IPlanSubtopic>(
  {
    id: { type: String, required: true }, // Keeping string ID for frontend consistency instead of Mongo ObjectId
    title: { type: String, required: true },
    description: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    estimatedHours: { type: Number, required: true, min: 1 },
    resources: { type: [LearningResourceSchema], default: [] },
  },
  { _id: false }
);

const LearningPlanSchema = new Schema<ILearningPlan>(
  {
    userId: { type: String, required: true, index: true }, // Indexed for fast lookups per user
    courseName: { type: String, required: true },
    dateCreated: { type: Date, default: Date.now },
    totalTopics: { type: Number, required: true, min: 0 },
    completedTopics: { type: Number, default: 0, min: 0 },
    estimatedTotalHours: { type: Number, required: true, min: 0 },
    subtopics: { type: [PlanSubtopicSchema], required: true },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Middleware to auto-calculate aggregate counts before saving
LearningPlanSchema.pre('save', async function () {
  if (this.subtopics) {
    this.totalTopics = this.subtopics.length;
    this.completedTopics = this.subtopics.filter((topic) => topic.isCompleted).length;
    this.estimatedTotalHours = this.subtopics.reduce((acc, topic) => acc + topic.estimatedHours, 0);
  }
});

export const LearningPlan = mongoose.model<ILearningPlan>('LearningPlan', LearningPlanSchema);
