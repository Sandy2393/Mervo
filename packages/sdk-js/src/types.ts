export type LoginRequest = { email: string; password: string };
export type LoginResponse = { token: string; userId: string };

export type Job = {
  id: string;
  title: string;
  location: string;
  dueAt: string;
  status: "pending" | "in_progress" | "completed";
};

export type JobsResponse = Job[];

export type ClockEvent = { jobId: string; at: string };

export type ReportPayload = { notes: string; photos?: string[] };

export type EarningsItem = { id: string; amount: number; description: string; earnedAt: string };
export type EarningsResponse = { total: number; currency: string; items: EarningsItem[] };
