import { useAuthContext } from "@/lib/AuthContext";

export function Dashboard() {
  const { user } = useAuthContext();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground mb-4">
        Welcome, {user?.subject}!
      </h1>
      <p className="text-muted-foreground">
        Your dashboard is under construction.
      </p>
    </div>
  );
}
