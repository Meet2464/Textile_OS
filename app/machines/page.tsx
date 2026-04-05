import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { MachinesGrid } from "@/components/machines/machines-grid"

export default function MachinesPage() {
  return (
    <DashboardLayout title="Machine Management">
      <MachinesGrid />
    </DashboardLayout>
  )
}
