"use client"

import { FileText, Truck, Layers, Users, Settings2, Package } from "lucide-react"

const stats = [
  {
    title: "Total Active Orders",
    value: "156",
    subtitle: "this month",
    icon: FileText,
    color: "#3B82F6",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Pending Challans",
    value: "43",
    subtitle: "awaiting return",
    icon: Truck,
    color: "#FF6B35",
    bgColor: "bg-orange-500/10",
  },
  {
    title: "Designs in System",
    value: "892",
    subtitle: "total designs",
    icon: Layers,
    color: "#8B5CF6",
    bgColor: "bg-purple-500/10",
  },
  {
    title: "Workers Active",
    value: "28",
    subtitle: "karigars working",
    icon: Users,
    color: "#00BCD4",
    bgColor: "bg-cyan-500/10",
  },
  {
    title: "Production In Progress",
    value: "234",
    subtitle: "pieces in pipeline",
    icon: Settings2,
    color: "#FFD700",
    bgColor: "bg-yellow-500/10",
    progress: 68,
  },
  {
    title: "Deliveries This Month",
    value: "89",
    subtitle: "orders delivered",
    icon: Package,
    color: "#10B981",
    bgColor: "bg-green-500/10",
  },
]

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="bg-[#2A2A2A] rounded-xl p-5 border border-[#555555]/50 hover:border-[#555555] transition-all hover:shadow-lg hover:shadow-black/20"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-white/60">{stat.title}</p>
              <p
                className="text-3xl font-bold mt-2"
                style={{ color: stat.color }}
              >
                {stat.value}
              </p>
              <p className="text-xs text-white/40 mt-1">{stat.subtitle}</p>
            </div>
            <div
              className={`p-3 rounded-lg ${stat.bgColor}`}
              style={{ color: stat.color }}
            >
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
          {stat.progress && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-white/60">Progress</span>
                <span style={{ color: stat.color }}>{stat.progress}%</span>
              </div>
              <div className="h-2 bg-[#1A1A2E] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${stat.progress}%`,
                    backgroundColor: stat.color,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
