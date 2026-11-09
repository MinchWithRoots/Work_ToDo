import "./global.css";

import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { PlannerProvider } from "@/lib/planner-context";
import Index from "./pages/Index";
import Summary from "./pages/Summary";
import Calendar from "./pages/Calendar";
import NotFound from "./pages/NotFound";

const App = () => (
  <PlannerProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Index />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/calendar" element={<Calendar />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </PlannerProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
