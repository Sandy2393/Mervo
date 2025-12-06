import { v4 as uuid } from "uuid";

export type JobStatus = "draft" | "published" | "archived";

export interface JobDefinition {
  name: string;
  description?: string;
  company_id: string;
  schedule_rule?: any;
  location?: { lat: number; lng: number; radius_m?: number };
  payment_cents?: number;
  payment_type?: string;
  is_recurring?: boolean;
  recurrence?: any;
}

export interface Job extends JobDefinition {
  id: string;
  status: JobStatus;
  created_at: string;
  updated_at: string;
}

const jobs: Job[] = [];
const jobInstances: any[] = [];

function nowIso() {
  return new Date().toISOString();
}

export class JobService {
  constructor(private audit: (entry: any) => void = () => {}) {}

  async createJob(def: JobDefinition): Promise<Job> {
    const job: Job = {
      ...def,
      id: uuid(),
      status: "draft",
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    jobs.push(job);
    this.audit({ action: "job.create", job_id: job.id, company_id: job.company_id });
    return job;
  }

  async updateJob(id: string, patch: Partial<JobDefinition>): Promise<Job | null> {
    const job = jobs.find((j) => j.id === id);
    if (!job) return null;
    Object.assign(job, patch, { updated_at: nowIso() });
    this.audit({ action: "job.update", job_id: id, patch });
    return job;
  }

  async getJob(id: string): Promise<Job | null> {
    return jobs.find((j) => j.id === id) || null;
  }

  async listJobs(company_id: string): Promise<Job[]> {
    return jobs.filter((j) => j.company_id === company_id);
  }

  async publishJob(jobId: string): Promise<Job | null> {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return null;
    job.status = "published";
    job.updated_at = nowIso();
    this.audit({ action: "job.publish", job_id: jobId });
    return job;
  }

  async generateInstancesForRange(jobId: string, from: string, to: string) {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) throw new Error("job not found");

    // Placeholder: create one instance per day
    const start = new Date(from);
    const end = new Date(to);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const inst = {
        id: uuid(),
        job_id: jobId,
        company_id: job.company_id,
        scheduled_for: d.toISOString(),
        status: "pending",
        created_at: nowIso(),
      };
      jobInstances.push(inst);
    }
    this.audit({ action: "job.generate_instances", job_id: jobId, count: jobInstances.length });
    return jobInstances.filter((i) => i.job_id === jobId);
  }
}
