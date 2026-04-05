import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { InventoryDashboard } from "@/components/inventory/inventory-dashboard"

export default function InventoryPage() {
  return (
    <DashboardLayout title="Inventory Management">
      <InventoryDashboard />
    </DashboardLayout>
  )
}
