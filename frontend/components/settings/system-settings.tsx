"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function SystemSettings() {
  const [settings, setSettings] = useState({
    hospitalName: "Kasa Family Hospital",
    email: "info@kasa.com",
    phone: "+1 234-567-8900",
    address: "123 Healthcare Avenue, Medical City",
    timezone: "UTC-5",
    autoApproval: false,
    emailNotifications: true,
    dataRetention: "2 years",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Settings saved:", settings)
  }

return (
  <div className="space-y-6 max-w-3xl mx-auto">
    {/* Hospital Info */}
    <Card className="p-6 bg-white shadow-md rounded-xl">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Hospital Information</h3>
      <form className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Hospital Name</label>
          <input
            type="text"
            value={settings.hospitalName}
            onChange={(e) => setSettings({ ...settings, hospitalName: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none transition"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Phone</label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none transition"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Address</label>
          <input
            type="text"
            value={settings.address}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none transition"
          />
        </div>
      </form>
    </Card>

    {/* System Config */}
    <Card className="p-6 bg-white shadow-md rounded-xl">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">System Configuration</h3>
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Timezone</label>
          <select
            value={settings.timezone}
            onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none transition"
          >
            <option>UTC-5</option>
            <option>UTC-6</option>
            <option>UTC+0</option>
            <option>UTC+1</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Data Retention Policy</label>
          <select
            value={settings.dataRetention}
            onChange={(e) => setSettings({ ...settings, dataRetention: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none transition"
          >
            <option>1 year</option>
            <option>2 years</option>
            <option>5 years</option>
            <option>10 years</option>
          </select>
        </div>

        <div className="pt-4 border-t border-gray-200 space-y-4">
          {[
            { label: "Auto-approve Appointments", key: "autoApproval" },
            { label: "Email Notifications", key: "emailNotifications" },
          ].map(({ label, key }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">{label}</span>
              <input
                type="checkbox"
                checked={settings[key as keyof typeof settings] as boolean}
                onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })}
                className="h-5 w-5 rounded accent-blue-600"
              />
            </div>
          ))}
        </div>
      </div>
    </Card>

    {/* Save Button */}
    <Button className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 shadow-md transition">
      Save Settings
    </Button>
  </div>
)
}