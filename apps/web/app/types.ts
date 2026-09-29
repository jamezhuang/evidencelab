export type StepStatus = "done" | "active" | "pending";

export type Step = {
  id: number;
  title: string;
  status: StepStatus;
};

export type Source = {
  title: string;
  url: string;
  type: string;
  description?: string;
  stars?: number;
  pushed_at?: string;
  archived?: boolean;
};

export type Task = {
  id: string;
  question: string;
  mode: string;
  steps: Step[];
  finding: string;
  sources: Source[];
};
