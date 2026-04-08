import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import ConnectedHomePage from "./pages/ConnectedHomePage";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConnectedHomePage />
    </QueryClientProvider>
  );
}
