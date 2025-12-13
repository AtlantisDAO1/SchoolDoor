import React from "react";
import {
  School,
  MessageSquare,
  Star,
  Activity,
} from "lucide-react";
import {
  getDashboardStats,
  getSchoolsForAnalytics,
  getReviewsForAnalytics,
  type School as SchoolType,
  type Review as ReviewType,
} from "@/lib/admin-api-server";

export default async function AnalyticsPage() {
  let stats = null;
  let schools: SchoolType[] = [];
  let reviews: ReviewType[] = [];
  let error = null;

  try {
    const [statsData, schoolsData, reviewsData] = await Promise.all([
      getDashboardStats(),
      getSchoolsForAnalytics(100),
      getReviewsForAnalytics(100),
    ]);

    stats = statsData;
    schools = schoolsData;
    reviews = reviewsData;
  } catch (err) {
    console.error("Error loading analytics data:", err);
    error = "Failed to load analytics data";
  }

  const getCityDistribution = () => {
    const cityCounts: { [key: string]: number } = {};
    schools.forEach((school) => {
      const city = school.city || "Unknown";
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    });
    return Object.entries(cityCounts)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count);
  };

  const getRatingDistribution = () => {
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((review) => {
      const rating = review.rating as keyof typeof ratingCounts;
      if (rating >= 1 && rating <= 5) {
        ratingCounts[rating]++;
      }
    });
    return Object.entries(ratingCounts).map(([rating, count]) => ({
      rating: parseInt(rating),
      count,
    }));
  };

  const getTopSchools = () => {
    return schools
      .filter((school) => school.average_rating > 0)
      .sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))
      .slice(0, 10);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  const cityDistribution = getCityDistribution();
  const ratingDistribution = getRatingDistribution();
  const topSchools = getTopSchools();
  const maxCityCount = Math.max(...cityDistribution.map((c) => c.count), 1);
  const maxRatingCount = Math.max(...ratingDistribution.map((r) => r.count), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Comprehensive insights into school data, ratings, and user engagement
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <School className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Schools</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.total_schools || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Reviews</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.total_reviews || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Average Rating</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.average_rating
                  ? stats.average_rating.toFixed(1)
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Jobs</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.active_jobs || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Schools by City */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Schools by City</h3>
          <div className="space-y-3">
            {cityDistribution.slice(0, 8).map((item) => (
              <div
                key={item.city}
                className="flex items-center justify-between"
              >
                <span className="text-sm font-medium text-gray-900">
                  {item.city}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(item.count / maxCityCount) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Rating Distribution</h3>
          <div className="space-y-3">
            {ratingDistribution.map((item) => (
              <div
                key={item.rating}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">
                    {item.rating} Star{item.rating !== 1 ? "s" : ""}
                  </span>
                  <div className="flex">
                    {Array.from({ length: item.rating }, (_, i) => (
                      <Star
                        key={i}
                        className="h-3 w-3 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${
                          maxRatingCount > 0
                            ? (item.count / maxRatingCount) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Schools and Recent Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Rated Schools */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Top Rated Schools</h3>
          <div className="space-y-4">
            {topSchools.length > 0 ? (
              topSchools.map((school, index) => (
                <div
                  key={school.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{school.name}</div>
                      <div className="text-sm text-gray-500">
                        {school.city}, {school.state}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {school.average_rating.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {school.total_reviews} reviews
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No schools with ratings yet</p>
            )}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Reviews</h3>
          <div className="space-y-4">
            {reviews.slice(0, 5).length > 0 ? (
              reviews.slice(0, 5).map((review) => (
                <div
                  key={review.id}
                  className="border-b border-gray-200 pb-3 last:border-b-0"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium">
                      {review.reviewer_name || "Anonymous"}
                    </div>
                    <div className="flex">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < review.rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {review.comment || "No comment"}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(review.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No reviews yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
