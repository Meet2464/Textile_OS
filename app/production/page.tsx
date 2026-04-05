import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ProductionKanban } from "@/components/production/production-kanban"

export default function ProductionPage() {
  return (
    <DashboardLayout title="Production Pipeline">
      <ProductionKanban />
    </DashboardLayout>
  )
}
