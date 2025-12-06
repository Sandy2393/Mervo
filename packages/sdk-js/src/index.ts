import { ClockEvent, EarningsResponse, JobsResponse, LoginRequest, LoginResponse, ReportPayload } from "./types";

type RequestOpts = { token?: string; fetchFn?: typeof fetch; baseUrl?: string };

const defaultBase = process.env.MOBILE_API_BASE || "https://api.example.com";

async function request<T>(path: string, method: string, body?: any, opts?: RequestOpts): Promise<T> {
  const fetchImpl = opts?.fetchFn ?? fetch;
  const res = await fetchImpl(`${opts?.baseUrl ?? defaultBase}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(opts?.token ? { Authorization: `Bearer ${opts.token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function login(payload: LoginRequest, opts?: RequestOpts): Promise<LoginResponse> {
  return request<LoginResponse>("/auth/login", "POST", payload, opts);
}

export async function listJobs(opts: RequestOpts & { token: string }): Promise<JobsResponse> {
  return request<JobsResponse>("/jobs/today", "GET", undefined, opts);
}

export async function clockIn(payload: ClockEvent, opts: RequestOpts & { token: string }) {
  return request<{ ok: boolean }>("/jobs/clock-in", "POST", payload, opts);
}

export async function clockOut(payload: ClockEvent, opts: RequestOpts & { token: string }) {
  return request<{ ok: boolean }>("/jobs/clock-out", "POST", payload, opts);
}

export async function submitReport(payload: { jobId: string; report: ReportPayload }, opts: RequestOpts & { token: string }) {
  return request<{ ok: boolean }>("/jobs/report", "POST", payload, opts);
}

export async function getEarnings(opts: RequestOpts & { token: string }): Promise<EarningsResponse> {
  return request<EarningsResponse>("/earnings", "GET", undefined, opts);
}

export * from "./types";
