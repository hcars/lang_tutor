import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/AuthContext";
import { Header } from "@/components/Header";
import { AppLayout } from "@/components/AppLayout";
import { Dashboard } from "@/components/Dashboard";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="p-4">
            <Routes>
              <Route path="/" element={<AppLayout />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
