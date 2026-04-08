import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import AdminDashboardPage from "./pages/AdminDashboardPage";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminDashboardPage />
    </QueryClientProvider>
  );
}
