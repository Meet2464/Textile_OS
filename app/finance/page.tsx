import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { FinanceDashboard } from "@/components/finance/finance-dashboard"

export default function FinancePage() {
  return (
    <DashboardLayout title="Finance & Payments">
      <FinanceDashboard />
    </DashboardLayout>
  )
}
