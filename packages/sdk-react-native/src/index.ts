import { Platform } from "react-native";
import { clockIn, clockOut, getEarnings, listJobs, login, submitReport } from "@app-id/sdk-js";
import type { JobsResponse, EarningsResponse, LoginResponse } from "@app-id/sdk-js";

let cachedDeviceId: string | null = null;

function randomId() {
  return `${Platform.OS}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getDeviceId() {
  if (!cachedDeviceId) cachedDeviceId = randomId();
  return cachedDeviceId;
}

export async function registerDevice({ pushToken }: { pushToken: string; tenantId?: string }) {
  // TODO: POST to backend to register device + topics
  return { ok: true, deviceId: getDeviceId(), pushToken };
}

export async function uploadPhotoFromLocalPath({
  jobId,
  path,
  token,
  baseUrl,
  fetchFn,
}: {
  jobId: string;
  path: string;
  token: string;
  baseUrl?: string;
  fetchFn?: typeof fetch;
}) {
  const fetchImpl = fetchFn ?? fetch;
  const form = new FormData();
  form.append("file", { uri: path, name: "photo.jpg", type: "image/jpeg" } as any);
  form.append("jobId", jobId);
  const res = await fetchImpl(`${baseUrl ?? process.env.MOBILE_API_BASE}/jobs/photo`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });
  if (!res.ok) throw new Error(`Upload failed ${res.status}`);
  return res.json();
}

export async function syncOfflineQueue({
  queue,
  token,
  baseUrl,
  fetchFn,
}: {
  queue: Array<{ type: string; jobId?: string; path?: string; payload?: any; at: string }>;
  token: string;
  baseUrl?: string;
  fetchFn?: typeof fetch;
}) {
  for (const item of queue) {
    if (item.type === "clockIn") await clockIn({ jobId: item.jobId!, at: item.at }, { token, baseUrl, fetchFn });
    if (item.type === "clockOut") await clockOut({ jobId: item.jobId!, at: item.at }, { token, baseUrl, fetchFn });
    if (item.type === "submitReport")
      await submitReport({ jobId: item.jobId!, report: item.payload }, { token, baseUrl, fetchFn });
    if (item.type === "uploadPhoto" && item.path)
      await uploadPhotoFromLocalPath({ jobId: item.jobId!, path: item.path, token, baseUrl, fetchFn });
  }
  return { synced: queue.length };
}

export { login, listJobs, clockIn, clockOut, submitReport, getEarnings };
export type { JobsResponse, EarningsResponse, LoginResponse };
