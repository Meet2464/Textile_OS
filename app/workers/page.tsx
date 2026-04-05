import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { WorkersGrid } from "@/components/workers/workers-grid"

export default function WorkersPage() {
  return (
    <DashboardLayout title="Karigar Management">
      <WorkersGrid />
    </DashboardLayout>
  )
}
