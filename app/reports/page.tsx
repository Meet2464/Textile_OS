import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ReportsDashboard } from "@/components/reports/reports-dashboard"

export default function ReportsPage() {
  return (
    <DashboardLayout title="Reports & Analytics">
      <ReportsDashboard />
    </DashboardLayout>
  )
}
