import fs from "fs";
import path from "path";

// Onboarding workflow engine (stub). All actions logged to console; replace with DB/audit log.

type Step = { id: string; name: string; delayHours?: number; channels: Array<"email" | "in-app" | "crm">; templateKey?: string };

type Workflow = { id: string; steps: Step[] };

const templatePath = path.join(process.cwd(), "server/cs/templates/onboarding_default.json");

function loadDefaultWorkflow(): Workflow {
  const raw = fs.readFileSync(templatePath, "utf-8");
  return JSON.parse(raw);
}

export class OnboardingEngine {
  workflow: Workflow;

  constructor(workflow?: Workflow) {
    this.workflow = workflow || loadDefaultWorkflow();
  }

  startOnboarding(company_id: string, starterTemplate = "default") {
    // TODO: persist state in DB
    this.audit("onboarding_started", { company_id, starterTemplate });
    return { company_id, workflow: this.workflow.id };
  }

  advanceStep(company_id: string, stepId: string) {
    // TODO: update current step in DB
    this.audit("onboarding_step_advanced", { company_id, stepId });
    return { ok: true };
  }

  sendStepNotification(company_id: string, step: Step, via: Array<"email" | "in-app" | "crm">) {
    // TODO: integrate with email service and in-app messaging
    this.audit("onboarding_step_notification", { company_id, stepId: step.id, via });
    return { ok: true };
  }

  private audit(event: string, data: any) {
    // TODO: write to audit_logs table
    console.log(`[onboarding] ${event}`, data);
  }
}
