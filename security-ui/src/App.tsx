import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "./layouts/dashboard-layout";
import { SecurityDashboard } from "./pages/security-dashboard";
import { ApprovalsPage } from "./pages/approvals-page";
import { AuditLogPage } from "./pages/audit-log-page";
import { SecurityConfigPage } from "./pages/security-config-page";
import { SecurityHealthPage } from "./pages/security-health-page";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<SecurityDashboard />} />
          <Route path="approvals" element={<ApprovalsPage />} />
          <Route path="audit-logs" element={<AuditLogPage />} />
          <Route path="health" element={<SecurityHealthPage />} />
          <Route path="config" element={<SecurityConfigPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
