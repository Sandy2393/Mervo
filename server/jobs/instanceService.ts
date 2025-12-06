import { v4 as uuid } from "uuid";
import { haversineDistanceMeters } from "../util/haversine";

const instances: any[] = [];
const timesheets: any[] = [];

function nowIso() {
  return new Date().toISOString();
}

export class InstanceService {
  constructor(private audit: (entry: any) => void = () => {}) {}

  async assignInstanceToUser(instanceId: string, companyUserId: string) {
    const inst = instances.find((i) => i.id === instanceId);
    if (!inst) throw new Error("instance not found");
    inst.assigned_company_user_id = companyUserId;
    inst.updated_at = nowIso();
    this.audit({ action: "instance.assign", instanceId, companyUserId });
    return inst;
  }

  async contractorAcceptInstance(userId: string, instanceId: string) {
    const inst = instances.find((i) => i.id === instanceId);
    if (!inst) throw new Error("instance not found");
    inst.status = "accepted";
    inst.updated_at = nowIso();
    this.audit({ action: "instance.accept", instanceId, userId });
    return inst;
  }

  async contractorDeclineInstance(userId: string, instanceId: string) {
    const inst = instances.find((i) => i.id === instanceId);
    if (!inst) throw new Error("instance not found");
    inst.status = "declined";
    inst.updated_at = nowIso();
    this.audit({ action: "instance.decline", instanceId, userId });
    return inst;
  }

  async recordClockIn(userId: string, instanceId: string, geo: { lat: number; lng: number }, deviceMeta: any) {
    const inst = instances.find((i) => i.id === instanceId);
    if (!inst) throw new Error("instance not found");

    const allowed = this.checkGeofence(inst, geo);
    if (!allowed) throw new Error("outside geofence");

    const ts = {
      id: uuid(),
      job_instance_id: instanceId,
      user_id: userId,
      clock_in_at: nowIso(),
      clock_in_geo: geo,
      deviceMeta,
    };
    timesheets.push(ts);
    inst.status = "in_progress";
    this.audit({ action: "clock_in", instanceId, userId, geo });
    return ts;
  }

  async recordClockOut(userId: string, instanceId: string, geo: { lat: number; lng: number }, deviceMeta: any) {
    const ts = timesheets.find((t) => t.job_instance_id === instanceId && t.user_id === userId && t.clock_out_at == null);
    if (!ts) throw new Error("timesheet not found");

    const inst = instances.find((i) => i.id === instanceId);
    if (!inst) throw new Error("instance not found");

    const allowed = this.checkGeofence(inst, geo);
    if (!allowed) throw new Error("outside geofence");

    ts.clock_out_at = nowIso();
    ts.clock_out_geo = geo;
    ts.deviceMeta = deviceMeta;
    const start = new Date(ts.clock_in_at).getTime();
    const end = new Date(ts.clock_out_at).getTime();
    ts.duration_seconds = Math.max(0, Math.floor((end - start) / 1000));
    inst.status = "submitted";
    this.audit({ action: "clock_out", instanceId, userId, duration_seconds: ts.duration_seconds });
    return ts;
  }

  private checkGeofence(instance: any, geo: { lat: number; lng: number }) {
    if (!instance?.location || !instance.location.radius_m) return true;
    const dist = haversineDistanceMeters(instance.location.lat, instance.location.lng, geo.lat, geo.lng);
    return dist <= instance.location.radius_m;
  }
}
