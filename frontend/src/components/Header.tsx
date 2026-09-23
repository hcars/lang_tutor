import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuthContext } from "@/lib/AuthContext";
import { LogIn, LogOut, User } from "lucide-react";

export function Header() {
  const { user, login, logout } = useAuthContext();

  return (
    <header className="border-b border-border px-6 py-4 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold text-primary">
        Lang Trainer
      </Link>

      <nav className="flex items-center gap-4">
        <Link to="/">
          <Button variant="ghost" size="sm">
            Home
          </Button>
        </Link>

        {user && (
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              Dashboard
            </Button>
          </Link>
        )}

        {user ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <User className="w-4 h-4" />
              {user.subject.slice(0, 8)}...
            </span>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4" />
              Sign out
            </Button>
          </div>
        ) : (
          <Button variant="default" size="sm" onClick={login}>
            <LogIn className="w-4 h-4" />
            Sign in with Google
          </Button>
        )}
      </nav>
    </header>
  );
}
