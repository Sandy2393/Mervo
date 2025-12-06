import { useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/Card";
import FormInput from "../components/ui/FormInput";
import ThemeToggle from "../components/ui/ThemeToggle";
import { initTheme } from "../styles/theme";

export default function LoginPolished() {
  useEffect(() => {
    initTheme();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] text-[var(--color-text)] p-6">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md shadow-lg" header={<div className="text-xl font-semibold">Welcome back</div>}>
        <main id="main">
          <p className="text-[var(--color-text-muted)] mb-4">Sign in to continue to APP_ID</p>
          <form className="space-y-3">
            <FormInput id="email" name="email" label="Email" type="email" autoComplete="email" required />
            <FormInput id="password" name="password" label="Password" type="password" autoComplete="current-password" required />
            <Button type="submit" block>
              Log in
            </Button>
          </form>
          <div className="mt-4 text-sm text-[var(--color-text-muted)]">Forgot password? Contact support.</div>
        </main>
      </Card>
    </div>
  );
}
