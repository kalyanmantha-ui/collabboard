export type Status = "todo" | "in_progress" | "done";
export type Label = "Design" | "Bug" | "Feature";

export const STATUSES: { id: Status; name: string }[] = [
  { id: "todo", name: "To do" },
  { id: "in_progress", name: "In progress" },
  { id: "done", name: "Done" },
];
export const LABELS: Label[] = ["Design", "Bug", "Feature"];

export interface User {
  id: string;
  name: string;
  initials: string;
  email: string;
  tone: "tan" | "pink" | "green" | "blue" | "amber";
}

export interface Comment {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
}

export interface Task {
  id: string;
  boardId: string;
  title: string;
  description: string;
  status: Status;
  order: number;
  assigneeId: string | null;
  label: Label;
  dueDate: string | null;
  createdAt: string;
  createdBy: string;
  completedAt: string | null;
  comments: Comment[];
}

export interface Workspace {
  id: string;
  name: string;
}

export interface Board {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  color: string;
  memberIds: string[];
  updatedAt: string;
}

export interface BoardSummary extends Board {
  taskCount: number;
}

export interface BoardDetail {
  board: Board;
  workspaceName: string;
  members: User[];
  tasks: Task[];
}

export type NewTaskInput = Pick<Task, "title" | "description" | "status" | "assigneeId" | "label" | "dueDate">;
export type TaskPatch = Partial<Omit<Task, "id" | "boardId" | "comments" | "createdAt" | "createdBy">>;
