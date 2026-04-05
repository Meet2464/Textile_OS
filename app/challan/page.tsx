import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ChallanTabs } from "@/components/challan/challan-tabs"

export default function ChallanPage() {
  return (
    <DashboardLayout title="Challan Management">
      <ChallanTabs />
    </DashboardLayout>
  )
}
