"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TopBar } from "@/components/layout/topbar"
import { Sidebar } from "@/components/layout/sidebar"
import { LayoutDashboard, BarChart3, Users, Briefcase, Settings, FileText } from "lucide-react"

// Tab Components (to be created)
import { OverviewTab } from "@/components/superadmin/overview-tab"
import { AnalyticsTab } from "@/components/superadmin/analytics-tab"
import { DoctorManagementTab } from "@/components/superadmin/doctor-management-tab"
import { ServiceManagementTab } from "@/components/superadmin/service-management-tab"
import { SettingsTab } from "@/components/superadmin/settings-tab"
import { ReportsTab } from "@/components/superadmin/reports-tab"

export function SuperAdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar open={sidebarOpen} role="superadmin" onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto bg-slate-50">
          <div className="p-6 max-w-[1600px] mx-auto space-y-6">
            {/* Modern Page Header with Gradient */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold text-white">Super Admin Dashboard</h2>
              <p className="text-purple-100 mt-2">
                Complete system control and analytics at your fingertips
              </p>
            </div>

            {/* Enhanced Tabbed Interface */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 bg-white p-1.5 rounded-xl shadow-sm border border-gray-200">
                <TabsTrigger
                  value="overview"
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-200 rounded-lg"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-200 rounded-lg"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
                <TabsTrigger
                  value="doctors"
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-200 rounded-lg"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Doctors</span>
                </TabsTrigger>
                <TabsTrigger
                  value="services"
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-200 rounded-lg"
                >
                  <Briefcase className="h-4 w-4" />
                  <span className="hidden sm:inline">Services</span>
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-200 rounded-lg"
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
                <TabsTrigger
                  value="reports"
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-200 rounded-lg"
                >
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Reports</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                <OverviewTab />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6 mt-6">
                <AnalyticsTab />
              </TabsContent>

              <TabsContent value="doctors" className="space-y-6 mt-6">
                <DoctorManagementTab />
              </TabsContent>

              <TabsContent value="services" className="space-y-6 mt-6">
                <ServiceManagementTab />
              </TabsContent>

              <TabsContent value="settings" className="space-y-6 mt-6">
                <SettingsTab />
              </TabsContent>

              <TabsContent value="reports" className="space-y-6 mt-6">
                <ReportsTab />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
