import type { Board, Label, Status, Task, User, Workspace } from "../types";

export interface Db {
  users: User[];
  workspaces: Workspace[];
  boards: Board[];
  tasks: Task[];
  passwords: Record<string, string>;
}

export const DEMO_EMAIL = "kalyan@example.com";
export const DEMO_PASSWORD = "password123";

const users: User[] = [
  { id: "u1", name: "Kalyan M.", initials: "KM", email: DEMO_EMAIL, tone: "tan" },
  { id: "u2", name: "Jamie D.", initials: "JD", email: "jamie@example.com", tone: "pink" },
  { id: "u3", name: "Alex R.", initials: "AR", email: "alex@example.com", tone: "green" },
  { id: "u4", name: "Sam T.", initials: "ST", email: "sam@example.com", tone: "blue" },
  { id: "u5", name: "Priya N.", initials: "PN", email: "priya@example.com", tone: "amber" },
];

const workspaces: Workspace[] = [
  { id: "w1", name: "Design team" },
  { id: "w2", name: "Engineering" },
  { id: "w3", name: "Personal" },
];

const boards: Board[] = [
  { id: "b1", workspaceId: "w1", name: "Website redesign", description: "Refresh the marketing site and docs.", color: "#b5552a", memberIds: ["u1", "u2", "u3"], updatedAt: "2026-09-29T09:00:00" },
  { id: "b2", workspaceId: "w1", name: "Design system", description: "Tokens, primitives, and release notes.", color: "#5b4bb5", memberIds: ["u1", "u2"], updatedAt: "2026-09-28T09:00:00" },
  { id: "b3", workspaceId: "w1", name: "Mobile app", description: "Ship the first iOS and Android build.", color: "#0f7a5a", memberIds: ["u1", "u2", "u3", "u4"], updatedAt: "2026-09-28T08:00:00" },
  { id: "b4", workspaceId: "w1", name: "Marketing launch", description: "Plan the October launch week.", color: "#a63a1c", memberIds: ["u1", "u3", "u5"], updatedAt: "2026-09-20T09:00:00" },
  { id: "b5", workspaceId: "w1", name: "Hiring pipeline", description: "Track candidates through each stage.", color: "#8a5a0a", memberIds: ["u1", "u5"], updatedAt: "2026-09-18T09:00:00" },
  { id: "b6", workspaceId: "w2", name: "API platform", description: "Public API v2 and developer docs.", color: "#2b6cb0", memberIds: ["u1", "u4", "u5"], updatedAt: "2026-09-27T09:00:00" },
  { id: "b7", workspaceId: "w2", name: "Reliability", description: "On-call, alerts, and postmortems.", color: "#6b4b8a", memberIds: ["u1", "u4"], updatedAt: "2026-09-22T09:00:00" },
  { id: "b8", workspaceId: "w3", name: "Job search", description: "Applications, referrals, and prep.", color: "#2f7a4a", memberIds: ["u1"], updatedAt: "2026-09-26T09:00:00" },
];

type Row = [string, Status, Label, string | null, string | null, string?];

const rows: Record<string, Row[]> = {
  b1: [
    ["Login screen wireframe", "todo", "Design", "u1", "2026-10-03", "Sketch sign-in and account creation, including the error states."],
    ["Modal loses focus on close", "todo", "Bug", "u2", "2026-10-05", "Focus should return to the element that opened the modal."],
    ["Empty state illustrations", "todo", "Design", "u3", "2026-10-09", "One illustration per empty column and empty board."],
    ["Board list page", "in_progress", "Feature", "u1", "2026-10-06", "Workspace sidebar plus a grid of board cards."],
    ["Task detail modal", "in_progress", "Feature", "u2", "2026-10-04", "Build the modal that opens from a task card. It shows the description, fields, and comments, and traps focus while open."],
    ["Design tokens setup", "done", "Feature", "u1", null, "Raw, semantic and dark token tiers."],
  ],
  b2: [
    ["Button variants", "todo", "Feature", "u1", "2026-10-08", "Add secondary and destructive text variants."],
    ["Card component", "todo", "Feature", "u1", "2026-10-12", "Built for CollabBoard's real task-card needs."],
    ["RTL support audit", "todo", "Design", "u2", "2026-10-15"],
    ["Motion guidelines", "todo", "Design", "u1", "2026-10-18", "Write up duration and easing tokens as a system."],
    ["Dropdown Home/End keys", "todo", "Feature", "u1", null],
    ["Fix Dropdown listener cleanup", "in_progress", "Bug", "u1", "2026-10-02", "removeEventListener targets window, listener was added to document."],
    ["Dark mode from system preference", "in_progress", "Feature", "u2", "2026-10-07"],
    ["Contrast audit", "done", "Design", "u1", null],
    ["Modal focus trap", "done", "Feature", "u1", null],
    ["Input debounce race", "done", "Bug", "u1", null],
    ["Token pipeline", "done", "Feature", "u2", null],
    ["Package for npm", "done", "Feature", "u1", null],
  ],
  b3: [
    ["Onboarding flow", "todo", "Design", "u3", "2026-10-10"],
    ["Push notification copy", "todo", "Design", "u4", "2026-10-11"],
    ["Crash on cold start (Android)", "todo", "Bug", "u2", "2026-10-06"],
    ["Offline mode", "todo", "Feature", "u4", "2026-10-25"],
    ["Profile screen", "in_progress", "Feature", "u3", "2026-10-09"],
    ["Deep links", "in_progress", "Feature", "u1", "2026-10-13"],
    ["App icon set", "done", "Design", "u3", null],
    ["Sign in with Apple", "done", "Feature", "u2", null],
    ["Splash screen flicker", "done", "Bug", "u4", null],
  ],
  b4: [
    ["Launch announcement post", "todo", "Design", "u3", "2026-10-14"],
    ["Email sequence", "todo", "Feature", "u5", "2026-10-15"],
    ["Fix broken UTM links", "in_progress", "Bug", "u1", "2026-10-08"],
    ["Press kit", "in_progress", "Design", "u3", "2026-10-12"],
    ["Launch week schedule", "done", "Feature", "u5", null],
  ],
  b5: [
    ["Screen new applicants", "todo", "Feature", "u5", "2026-10-02"],
    ["Schedule onsite: Dana", "todo", "Feature", "u1", "2026-10-06"],
    ["Update job description", "todo", "Design", "u5", "2026-10-09"],
    ["Phone screen: Marcus", "in_progress", "Feature", "u1", "2026-10-01"],
    ["Debrief: Lena", "in_progress", "Feature", "u5", "2026-10-03"],
    ["Offer letter template", "done", "Design", "u5", null],
    ["Fix ATS import bug", "done", "Bug", "u1", null],
  ],
  b6: [
    ["Write API contract types", "todo", "Feature", "u1", "2026-10-07", "What needs to happen, and what done looks like."],
    ["Rate limit headers", "todo", "Feature", "u4", "2026-10-10"],
    ["Pagination edge case", "in_progress", "Bug", "u5", "2026-10-05"],
    ["OpenAPI docs site", "in_progress", "Design", "u1", "2026-10-16"],
    ["Auth token rotation", "done", "Feature", "u4", null],
  ],
  b7: [
    ["Alert noise review", "todo", "Feature", "u4", "2026-10-09"],
    ["Postmortem: Sep 14 outage", "in_progress", "Design", "u1", "2026-10-02"],
    ["Runbook for queue backlog", "done", "Feature", "u4", null],
  ],
  b8: [
    ["Follow up with referral", "todo", "Feature", "u1", "2026-10-01"],
    ["Prep system design answers", "todo", "Feature", "u1", "2026-10-08"],
    ["DSA: dynamic programming sprint", "in_progress", "Feature", "u1", "2026-10-15"],
    ["Update portfolio site", "done", "Design", "u1", null],
  ],
};

const tasks: Task[] = Object.entries(rows).flatMap(([boardId, list]) =>
  list.map(([title, status, label, assigneeId, dueDate, description], i): Task => ({
    id: `${boardId}-t${i + 1}`,
    boardId,
    title,
    description: description ?? "",
    status,
    order: i,
    assigneeId,
    label,
    dueDate,
    createdAt: "2026-09-22T10:00:00",
    createdBy: "u1",
    completedAt: status === "done" ? "2026-09-28" : null,
    comments: [],
  })),
);

const byId = (id: string) => tasks.find((t) => t.id === id)!;
byId("b1-t1").comments = [
  { id: "c1", authorId: "u2", body: "Can we show the password rules before the user types?", createdAt: "2026-09-24T11:00:00" },
  { id: "c2", authorId: "u1", body: "Yes, as helper text under the field.", createdAt: "2026-09-24T11:30:00" },
];
byId("b1-t3").comments = [{ id: "c3", authorId: "u1", body: "Keep them flat, two colors max.", createdAt: "2026-09-25T09:00:00" }];
byId("b1-t4").comments = [
  { id: "c4", authorId: "u2", body: "Should the color strip come from the board or the workspace?", createdAt: "2026-09-23T09:00:00" },
  { id: "c5", authorId: "u1", body: "Board. Each one picks its own.", createdAt: "2026-09-23T09:20:00" },
  { id: "c6", authorId: "u3", body: "Added a dashed New board card at the end of the grid.", createdAt: "2026-09-24T15:00:00" },
  { id: "c7", authorId: "u1", body: "Looks good. Moving on to the sidebar.", createdAt: "2026-09-25T10:00:00" },
];
byId("b1-t5").comments = [
  { id: "c8", authorId: "u1", body: "Focus trap is done. Working on the comment list next.", createdAt: "2026-09-23T16:10:00" },
  { id: "c9", authorId: "u2", body: "Can the assignee change from here too?", createdAt: "2026-09-24T09:02:00" },
];

export function createSeed(): Db {
  return {
    users: structuredClone(users),
    workspaces: structuredClone(workspaces),
    boards: structuredClone(boards),
    tasks: structuredClone(tasks),
    passwords: { [DEMO_EMAIL]: DEMO_PASSWORD },
  };
}
