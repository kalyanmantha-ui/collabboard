import { createSeed, DEMO_EMAIL, type Db } from "./seed";
import type { BoardDetail, BoardSummary, Board, Comment, NewTaskInput, Status, Task, TaskPatch, User, Workspace } from "../types";

const DB_KEY = "collabboard.db.v1";
const SESSION_KEY = "collabboard.session.v1";

let db: Db = load();

function load(): Db {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw) as Db;
  } catch {}
  return createSeed();
}

function save() {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {}
}

const simulate = () => new URLSearchParams(window.location.search).get("simulate");
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
async function latency(min = 250, max = 550) {
  await wait(simulate() === "slow" ? 2500 : min + Math.random() * (max - min));
}
const uid = (p: string) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const now = () => new Date().toISOString();
const today = () => new Date().toISOString().slice(0, 10);

export class ApiError extends Error {}

function touch(boardId: string) {
  const b = db.boards.find((x) => x.id === boardId);
  if (b) b.updatedAt = now();
}

function columnTasks(boardId: string, status: Status) {
  return db.tasks.filter((t) => t.boardId === boardId && t.status === status).sort((a, b) => a.order - b.order);
}
function renumber(list: Task[]) {
  list.forEach((t, i) => (t.order = i));
}

const clone = <T,>(v: T): T => structuredClone(v);

export const mockApi = {
  async getSessionUser(): Promise<User | null> {
    const id = localStorage.getItem(SESSION_KEY);
    return clone(db.users.find((u) => u.id === id) ?? null);
  },
  async signIn(email: string, password: string): Promise<User> {
    await latency();
    const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user || db.passwords[user.email] !== password) throw new ApiError("That password doesn't match. Try again.");
    localStorage.setItem(SESSION_KEY, user.id);
    return clone(user);
  },
  async signUp(name: string, email: string, password: string): Promise<User> {
    await latency();
    if (db.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) throw new ApiError("An account with that email already exists.");
    const parts = name.trim().split(/\s+/);
    const initials = (parts[0]?.[0] ?? "?") + (parts[1]?.[0] ?? "");
    const tones: User["tone"][] = ["tan", "pink", "green", "blue", "amber"];
    const user: User = {
      id: uid("u"),
      name: parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0],
      initials: initials.toUpperCase(),
      email: email.trim(),
      tone: tones[db.users.length % tones.length],
    };
    db.users.push(user);
    db.passwords[user.email] = password;
    const ws: Workspace = { id: uid("w"), name: `${parts[0]}'s workspace` };
    db.workspaces.push(ws);
    save();
    localStorage.setItem(SESSION_KEY, user.id);
    return clone(user);
  },
  async signOut() {
    localStorage.removeItem(SESSION_KEY);
  },
  resetDemo() {
    db = createSeed();
    save();
    localStorage.removeItem(SESSION_KEY);
  },

  async listWorkspaces(): Promise<Workspace[]> {
    await latency(120, 250);
    return clone(db.workspaces);
  },
  async createWorkspace(name: string): Promise<Workspace> {
    await latency(120, 250);
    const ws = { id: uid("w"), name: name.trim() };
    db.workspaces.push(ws);
    save();
    return clone(ws);
  },
  async listBoards(workspaceId: string): Promise<BoardSummary[]> {
    await latency();
    return clone(
      db.boards
        .filter((b) => b.workspaceId === workspaceId)
        .map((b) => ({ ...b, taskCount: db.tasks.filter((t) => t.boardId === b.id).length })),
    );
  },
  async createBoard(workspaceId: string, name: string, description: string, userId: string): Promise<Board> {
    await latency(150, 300);
    const colors = ["#b5552a", "#5b4bb5", "#0f7a5a", "#a63a1c", "#8a5a0a", "#2b6cb0"];
    const board: Board = {
      id: uid("b"),
      workspaceId,
      name: name.trim(),
      description: description.trim(),
      color: colors[db.boards.length % colors.length],
      memberIds: [userId],
      updatedAt: now(),
    };
    db.boards.push(board);
    save();
    return clone(board);
  },

  async getBoard(boardId: string): Promise<BoardDetail> {
    await latency();
    if (simulate() === "error") throw new ApiError("Couldn't load tasks");
    const board = db.boards.find((b) => b.id === boardId);
    if (!board) throw new ApiError("Board not found");
    const tasks = simulate() === "empty" ? [] : db.tasks.filter((t) => t.boardId === boardId);
    return clone({ board, workspaceName: db.workspaces.find((w) => w.id === board.workspaceId)?.name ?? "", members: db.users.filter((u) => board.memberIds.includes(u.id)), tasks });
  },

  async createTask(boardId: string, input: NewTaskInput, userId: string): Promise<Task> {
    await latency(150, 300);
    const task: Task = {
      id: uid("t"),
      boardId,
      ...input,
      title: input.title.trim(),
      order: columnTasks(boardId, input.status).length,
      createdAt: now(),
      createdBy: userId,
      completedAt: input.status === "done" ? today() : null,
      comments: [],
    };
    db.tasks.push(task);
    touch(boardId);
    save();
    return clone(task);
  },
  async updateTask(taskId: string, patch: TaskPatch): Promise<Task> {
    await latency(100, 250);
    const task = db.tasks.find((t) => t.id === taskId);
    if (!task) throw new ApiError("Task not found");
    const statusChanged = patch.status && patch.status !== task.status;
    Object.assign(task, patch);
    if (statusChanged) {
      task.order = columnTasks(task.boardId, task.status).length;
      task.completedAt = task.status === "done" ? today() : null;
    }
    touch(task.boardId);
    save();
    return clone(task);
  },
  async moveTask(taskId: string, status: Status, toIndex: number): Promise<void> {
    await latency(100, 250);
    const task = db.tasks.find((t) => t.id === taskId);
    if (!task) throw new ApiError("Task not found");
    const from = columnTasks(task.boardId, task.status).filter((t) => t.id !== task.id);
    renumber(from);
    const target = task.status === status ? from : columnTasks(task.boardId, status);
    task.completedAt = status === "done" ? (task.completedAt ?? today()) : null;
    task.status = status;
    target.splice(Math.max(0, Math.min(toIndex, target.length)), 0, task);
    renumber(target);
    touch(task.boardId);
    save();
  },
  async deleteTask(taskId: string): Promise<void> {
    await latency(100, 250);
    const task = db.tasks.find((t) => t.id === taskId);
    if (!task) return;
    db.tasks = db.tasks.filter((t) => t.id !== taskId);
    renumber(columnTasks(task.boardId, task.status));
    touch(task.boardId);
    save();
  },
  async addComment(taskId: string, authorId: string, body: string): Promise<Comment> {
    await latency(100, 250);
    const task = db.tasks.find((t) => t.id === taskId);
    if (!task) throw new ApiError("Task not found");
    const comment: Comment = { id: uid("c"), authorId, body: body.trim(), createdAt: now() };
    task.comments.push(comment);
    touch(task.boardId);
    save();
    return clone(comment);
  },
};

export type Api = typeof mockApi;
export { DEMO_EMAIL };
