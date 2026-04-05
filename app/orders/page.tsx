import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { OrdersTable } from "@/components/orders/orders-table"

export default function OrdersPage() {
  return (
    <DashboardLayout title="Order Management">
      <OrdersTable />
    </DashboardLayout>
  )
}
