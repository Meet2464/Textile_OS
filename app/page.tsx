import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentOrders } from "@/components/dashboard/recent-orders"
import { ProductionPipeline } from "@/components/dashboard/production-pipeline"
import { ChallanActivity } from "@/components/dashboard/challan-activity"

export default function DashboardPage() {
  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <DashboardStats />

        {/* Recent Orders & Production Pipeline */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <RecentOrders />
          <ProductionPipeline />
        </div>

        {/* Challan Activity */}
        <ChallanActivity />
      </div>
    </DashboardLayout>
  )
}
