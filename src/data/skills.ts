export type SkillStatus = "not-started" | "in-progress" | "completed";

export type Subtopic = {
  id: string;
  name: string;
  status: SkillStatus;
};

export type Skill = {
  id: string;
  name: string;
  subtopics: Subtopic[];
};

export const skillData: Skill[] = [
  {
    id: "react",
    name: "React",
    subtopics: [
      { id: "jsx", name: "JSX", status: "completed" },
      { id: "hooks", name: "Hooks", status: "in-progress" },
      { id: "context", name: "Context API", status: "not-started" },
    ],
  },
  {
    id: "ds",
    name: "Data Structures",
    subtopics: [
      { id: "arrays", name: "Arrays", status: "completed" },
      { id: "trees", name: "Trees", status: "not-started" },
      { id: "graphs", name: "Graphs", status: "not-started" },
    ],
  },
];
