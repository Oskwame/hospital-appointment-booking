"use client";
import React, { useEffect, useState } from "react";

const ServiceCards: React.FC = () => {
  const [stats, setStats] = useState({
    totalServices: 0,
    totalAppointment: 0,
    bookedAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
  });

  useEffect(() => {
    let timer: any;

    const fetchStats = async () => {
      try {
        const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000") + "/api"
        const res = await fetch(`${base}/stats`, { cache: "no-store" });
        const data = await res.json();

        setStats({
          totalServices: data.totalServices || 0,
          totalAppointment: data.totalAppointment || 0,
          bookedAppointments: data.bookedAppointments || 0,
          pendingAppointments: data.pendingAppointments || 0,
          confirmedAppointments: data.confirmedAppointments || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
    timer = setInterval(fetchStats, 20000); // refresh every 20s
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen">
      <h1 className="text-center text-3xl font-semibold mb-8 text-slate-800">Welcome, Admin</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Services", value: stats.totalServices, color: "bg-blue-500" },
          { label: "Total Appointments", value: stats.totalAppointment, color: "bg-green-500" },
          { label: "Pending Appointments", value: stats.pendingAppointments, color: "bg-orange-500" },
          { label: "Confirmed Appointments", value: stats.confirmedAppointments, color: "bg-purple-500" },
        ].map((card, i) => (
          <div key={i} className="card p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-slate-600">{card.label}</h2>
              <span className={`h-2 w-2 rounded-full ${card.color}`} />
            </div>
            <p className="mt-4 text-4xl font-bold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceCards;
