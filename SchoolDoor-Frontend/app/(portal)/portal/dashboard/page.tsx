import Link from "next/link";
import {
  School,
  MessageSquare,
  Star,
  Activity,
  BarChart3,
} from "lucide-react";
import {
  getDashboardStats,
  getDashboardSchools,
  getScrapingJobs,
} from "@/lib/admin-api-server";

export default async function DashboardPage() {
  let stats = null;
  let recentSchools: any[] = [];
  let recentJobs: any[] = [];
  let error = null;

  try {
    const [statsData, schoolsData, jobsData] = await Promise.all([
      getDashboardStats(),
      getDashboardSchools(5),
      getScrapingJobs(5),
    ]);

    stats = statsData;
    recentSchools = schoolsData;
    recentJobs = jobsData;
  } catch (err) {
    console.error("Error loading dashboard data:", err);
    error = "Failed to load dashboard data";
  }

  const statCards = [
    {
      name: "Total Schools",
      value: stats?.total_schools || 0,
      icon: School,
      color: "bg-blue-500",
    },
    {
      name: "Total Reviews",
      value: stats?.total_reviews || 0,
      icon: MessageSquare,
      color: "bg-green-500",
    },
    {
      name: "Average Rating",
      value: stats?.average_rating
        ? stats.average_rating.toFixed(1)
        : "N/A",
      icon: Star,
      color: "bg-yellow-500",
    },
    {
      name: "Active Jobs",
      value: stats?.active_jobs || 0,
      icon: Activity,
      color: "bg-purple-500",
    },
  ];

  const quickActions = [
    {
      name: "Manage Schools",
      description: "View and manage school data",
      href: "/portal/schools",
      icon: School,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      name: "View Analytics",
      description: "Comprehensive analytics dashboard",
      href: "/portal/analytics",
      icon: BarChart3,
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      name: "Manage Reviews",
      description: "Moderate and manage reviews",
      href: "/portal/reviews",
      icon: MessageSquare,
      color: "bg-purple-600 hover:bg-purple-700",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome to SchoolDoor Admin Panel
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Schools */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Schools
              </h3>
              <Link
                href="/portal/schools"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                View all
              </Link>
            </div>
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {recentSchools.length > 0 ? (
                  recentSchools.map((school) => (
                    <li key={school.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <School className="h-5 w-5 text-indigo-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {school.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {school.city}, {school.state}
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {school.average_rating
                              ? school.average_rating.toFixed(1)
                              : "N/A"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {school.total_reviews} reviews
                          </p>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="py-4 text-sm text-gray-500">
                    No schools found
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Recent Scraping Jobs */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Scraping Jobs
              </h3>
              <Link
                href="/portal/schools"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                View all
              </Link>
            </div>
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {recentJobs.length > 0 ? (
                  recentJobs.map((job) => (
                    <li key={job.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <Activity className="h-5 w-5 text-green-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {job.region}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(job.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              job.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : job.status === "running"
                                  ? "bg-blue-100 text-blue-800"
                                  : job.status === "failed"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {job.status}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="py-4 text-sm text-gray-500">
                    No scraping jobs found
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
