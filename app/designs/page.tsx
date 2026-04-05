import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DesignGrid } from "@/components/designs/design-grid"

export default function DesignsPage() {
  return (
    <DashboardLayout title="Design Management">
      <DesignGrid />
    </DashboardLayout>
  )
}
