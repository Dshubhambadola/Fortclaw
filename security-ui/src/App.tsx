import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "./layouts/dashboard-layout";
import { SecurityDashboard } from "./pages/security-dashboard";
import { ApprovalsPage } from "./pages/approvals-page";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<SecurityDashboard />} />
          <Route path="approvals" element={<ApprovalsPage />} />
          <Route path="audit-logs" element={<div>Audit Logs Page</div>} />
          <Route path="health" element={<div>Health Page</div>} />
          <Route path="config" element={<div>Config Page</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
