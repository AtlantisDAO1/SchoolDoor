"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Star,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
} from "lucide-react";
import {
  getMemberDashboardStats,
  MemberDashboardStats,
} from "@/lib/member-api-client";

export default function MemberDashboardPage() {
  const [stats, setStats] = useState<MemberDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getMemberDashboardStats();
        setStats(data);
      } catch (err) {
        console.error("Error loading dashboard stats:", err);
        setError("Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    {
      name: "Total Reviews",
      value: stats?.total_reviews || 0,
      icon: MessageSquare,
      color: "bg-blue-500",
    },
    {
      name: "Approved Reviews",
      value: stats?.approved_reviews || 0,
      icon: CheckCircle,
      color: "bg-green-500",
    },
    {
      name: "Pending Reviews",
      value: stats?.pending_reviews || 0,
      icon: Clock,
      color: "bg-yellow-500",
    },
    {
      name: "Rejected Reviews",
      value: stats?.rejected_reviews || 0,
      icon: XCircle,
      color: "bg-red-500",
    },
    {
      name: "Average Rating",
      value: stats?.average_rating
        ? stats.average_rating.toFixed(1)
        : "N/A",
      icon: Star,
      color: "bg-purple-500",
    },
  ];

  const quickActions = [
    {
      name: "View My Reviews",
      description: "See all your reviews and their status",
      href: "/member/reviews",
      icon: MessageSquare,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      name: "Edit Profile",
      description: "Update your profile information",
      href: "/member/profile",
      icon: Star,
      color: "bg-green-600 hover:bg-green-700",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sd-navy"></div>
          <p className="mt-2 text-sm text-sd-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome to your SchoolDoor member dashboard
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div
                      className={`w-8 h-8 ${stat.color} rounded-md flex items-center justify-center`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.name}
                  href={action.href}
                  className={`relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg border border-gray-300 hover:border-gray-400`}
                >
                  <div>
                    <span
                      className={`rounded-lg inline-flex p-3 ${action.color} text-white`}
                    >
                      <Icon className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {action.name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      {action.description}
                    </p>
                  </div>
                  <span
                    className="absolute top-6 right-6 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Status Summary */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Review Status Summary
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-900">
                    Approved Reviews
                  </p>
                  <p className="text-xs text-green-700">
                    These reviews are visible on the public page
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-900">
                {stats?.approved_reviews || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">
                    Pending Reviews
                  </p>
                  <p className="text-xs text-yellow-700">
                    These reviews are under review to be added to the public page
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold text-yellow-900">
                {stats?.pending_reviews || 0}
              </span>
            </div>

            {stats && stats.rejected_reviews > 0 && (
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 text-red-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-red-900">
                      Rejected Reviews
                    </p>
                    <p className="text-xs text-red-700">
                      These reviews were not approved for public viewing
                    </p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-red-900">
                  {stats.rejected_reviews}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



