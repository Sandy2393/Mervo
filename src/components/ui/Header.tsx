import ThemeToggle from "./ThemeToggle";
import Avatar from "./Avatar";
import { Button } from "./button";

interface HeaderProps {
  title?: string;
  companyName?: string;
  onCompanyChange?: () => void;
  onLogout?: () => void;
}

export default function Header({ title = "APP_ID", companyName = "Company", onCompanyChange, onLogout }: HeaderProps) {
  return (
    <header className="w-full border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="container flex-between py-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-[var(--color-primary)] text-black font-bold flex items-center justify-center" aria-label="APP_ID logo">
            A
          </div>
          <div>
            <div className="text-sm text-[var(--color-text-muted)]">{companyName}</div>
            <div className="text-lg font-semibold">{title}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={onCompanyChange} aria-label="Change company">
            Switch
          </Button>
          <ThemeToggle />
          <Avatar name="Admin User" />
          <Button variant="ghost" size="sm" onClick={onLogout} aria-label="Log out">
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
