"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  School,
  Search,
  Eye,
  Edit,
  Trash2,
  Play,
  RefreshCw,
  Download,
  CheckSquare,
  Square,
  Filter,
  SlidersHorizontal,
  BarChart3,
} from "lucide-react";
import {
  getSchools,
  getScrapingJobsList,
  startScrapingJob,
  exportSchools,
  bulkUpdateSchools,
  getSchoolSearchSuggestions,
  getSchoolStats,
  type SchoolQueryParams,
  type SchoolRow,
  type ScrapingJob,
  type SchoolStatsSummary,
  type SearchSuggestionItem,
} from "@/lib/admin-api-client";
import { BACKEND_API_URL } from "@/lib/config";

const INITIAL_FILTERS = {
  query: "",
  city: "",
  state: "",
  school_type: "",
  board: "",
  medium_of_instruction: "",
  min_rating: "",
  max_rating: "",
};

const PAGE_SIZE_OPTIONS = [25, 50, 100];

const SCHOOL_TYPE_OPTIONS = [
  "Public",
  "Private",
  "International",
  "Charter",
  "Boarding",
  "Montessori",
];

const BOARD_OPTIONS = ["CBSE", "ICSE", "State Board", "IB", "IGCSE"];
const MEDIUM_OPTIONS = ["English", "Hindi", "Regional", "Bilingual"];

export default function SchoolsPage() {
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [jobs, setJobs] = useState<ScrapingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState<"schools" | "scraping">("schools");
  const [showScrapingModal, setShowScrapingModal] = useState(false);
  const [scrapingRegion, setScrapingRegion] = useState("");
  const [scrapingLoading, setScrapingLoading] = useState(false);
  const [selectedSchools, setSelectedSchools] = useState<number[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<
    "activate" | "deactivate" | "export"
  >("activate");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [filters, setFilters] =
    useState<typeof INITIAL_FILTERS>(INITIAL_FILTERS);
  const [pageSize, setPageSize] = useState<number>(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreSchools, setHasMoreSchools] = useState(false);
  const [stats, setStats] = useState<SchoolStatsSummary | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchSuggestions, setSearchSuggestions] = useState<
    SearchSuggestionItem[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);

  const buildQueryParams = useCallback(
    (page: number): SchoolQueryParams => {
      const params: SchoolQueryParams = {
        limit: pageSize,
        offset: (page - 1) * pageSize,
      };

      if (filters.query.trim()) params.query = filters.query.trim();
      if (filters.city.trim()) params.city = filters.city.trim();
      if (filters.state.trim()) params.state = filters.state.trim();
      if (filters.school_type) params.school_type = filters.school_type;
      if (filters.board) params.board = filters.board;
      if (filters.medium_of_instruction)
        params.medium_of_instruction = filters.medium_of_instruction;

      const minRating = filters.min_rating
        ? Number(filters.min_rating)
        : undefined;
      const maxRating = filters.max_rating
        ? Number(filters.max_rating)
        : undefined;

      if (!Number.isNaN(minRating ?? NaN)) params.min_rating = minRating;
      if (!Number.isNaN(maxRating ?? NaN)) params.max_rating = maxRating;

      return params;
    },
    [filters, pageSize],
  );

  const fetchSchools = useCallback(
    async (page = 1, append = false) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const params = buildQueryParams(page);
        const [schoolsData, jobsData] = await Promise.all([
          getSchools(params),
          append ? Promise.resolve(null) : getScrapingJobsList(20, 0),
        ]);

        const normalizedSchools = Array.isArray(schoolsData)
          ? schoolsData
          : [];

        if (append) {
          setSchools((prev) => [...prev, ...normalizedSchools]);
        } else {
          setSchools(normalizedSchools);
          setSelectedSchools([]);
        }

        if (!append && Array.isArray(jobsData)) {
          setJobs(jobsData);
        }

        setHasMoreSchools(normalizedSchools.length === pageSize);
        setCurrentPage(page);
      } catch (error) {
        console.error("Error loading schools:", error);
        if (!append) {
          setSchools([]);
        }
      } finally {
        if (append) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    },
    [buildQueryParams, pageSize],
  );

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const statsData = await getSchoolStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error loading school stats:", error);
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchSchools(1, false);
  }, [fetchSchools]);

  useEffect(() => {
    setSearchInput(filters.query);
  }, [filters.query]);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMoreSchools) return;
    fetchSchools(currentPage + 1, true);
  };

  const handleScraping = async () => {
    if (!scrapingRegion.trim()) return;

    setScrapingLoading(true);
    try {
      await startScrapingJob(scrapingRegion.trim());
      setShowScrapingModal(false);
      setScrapingRegion("");
      fetchSchools(1, false);
    } catch (error) {
      console.error("Error starting scraping:", error);
    } finally {
      setScrapingLoading(false);
    }
  };

  const handleSelectSchool = (schoolId: number) => {
    setSelectedSchools((prev) =>
      prev.includes(schoolId)
        ? prev.filter((id) => id !== schoolId)
        : [...prev, schoolId],
    );
  };

  const handleSelectAll = () => {
    if (selectedSchools.length === schools.length) {
      setSelectedSchools([]);
    } else {
      setSelectedSchools(schools.map((school) => school.id));
    }
  };

  const buildExportFilters = (): SchoolQueryParams => {
    const params = buildQueryParams(1);
    delete params.offset;
    params.limit = pageSize * currentPage;
    return params;
  };

  const triggerDownload = (downloadUrl: string, fileName: string) => {
    // The download_url from backend should be a full URL or relative path
    // If it's relative, prepend the backend URL
    const fullUrl = downloadUrl.startsWith("http")
      ? downloadUrl
      : `${BACKEND_API_URL.replace("/api/v1", "")}${downloadUrl}`;
    const downloadLink = document.createElement("a");
    downloadLink.href = fullUrl;
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const executeBulkAction = async () => {
    if (!bulkAction) return;

    if (bulkAction !== "export" && selectedSchools.length === 0) {
      setBulkError("Select at least one school to perform this action.");
      return;
    }

    setBulkLoading(true);
    setBulkError(null);

    try {
      if (bulkAction === "export") {
        if (selectedSchools.length > 0) {
          const response = await exportSchools({
            format: "csv",
            school_ids: selectedSchools,
          });
          triggerDownload(response.download_url, response.file_name);
        } else {
          const exportFilters = buildExportFilters();
          const response = await exportSchools({
            format: "csv",
            filters: exportFilters,
          });
          triggerDownload(response.download_url, response.file_name);
        }
      } else {
        const updates =
          bulkAction === "activate" ? { is_active: true } : { is_active: false };
        const response = await bulkUpdateSchools({
          school_ids: selectedSchools,
          updates,
        });

        await fetchSchools(1, false);
        alert(`Successfully updated ${response.updated_count} schools`);

        if (response.failed_count > 0) {
          alert(`Failed to update ${response.failed_count} schools`);
        }
      }

      setShowBulkModal(false);
      setBulkError(null);
    } catch (error) {
      console.error("Error performing bulk action:", error);
      setBulkError("Error performing bulk action. Please try again.");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleSearchInputChange = async (value: string) => {
    setSearchInput(value);

    if (value.length >= 2) {
      try {
        const suggestions = await getSchoolSearchSuggestions(value, 6);
        setSearchSuggestions(Array.isArray(suggestions) ? suggestions : []);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Error fetching search suggestions:", error);
      }
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({
      ...prev,
      query: searchInput.trim(),
    }));
  };

  const handleSuggestionClick = (suggestion: SearchSuggestionItem) => {
    if (suggestion.type === "city") {
      setFilters((prev) => ({
        ...prev,
        city: suggestion.value,
        query: "",
      }));
      setSearchInput("");
    } else {
      setFilters((prev) => ({
        ...prev,
        query: suggestion.value,
      }));
      setSearchInput(suggestion.value);
    }

    setShowSuggestions(false);
  };

  const handleFilterChange = (
    field: keyof typeof INITIAL_FILTERS,
    value: string,
  ) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters(INITIAL_FILTERS);
    setSearchInput("");
  };

  const handleExportFiltered = async () => {
    try {
      const exportFilters = buildExportFilters();
      const response = await exportSchools({
        format: "csv",
        filters: exportFilters,
      });
      triggerDownload(response.download_url, response.file_name);
    } catch (error) {
      console.error("Error exporting filtered results:", error);
      alert("Error exporting filtered results.");
    }
  };

  const leadingState = useMemo(() => {
    if (!stats) return null;
    const entries = Object.entries(stats.schools_by_state || {});
    if (!entries.length) return null;
    const [state, count] = entries.sort((a, b) => b[1] - a[1])[0];
    return { state, count };
  }, [stats]);

  const leadingType = useMemo(() => {
    if (!stats) return null;
    const entries = Object.entries(stats.schools_by_type || {});
    if (!entries.length) return null;
    const [type, count] = entries.sort((a, b) => b[1] - a[1])[0];
    return { type, count };
  }, [stats]);

  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(
      (value) => value && value.trim() !== "",
    ).length;
  }, [filters]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "running":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading && !loadingMore && schools.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const topRatedSchools = stats?.top_rated_schools?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Schools Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Filter and inspect schools, monitor scraping jobs, and manage bulk
            operations.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
            {activeFiltersCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-full px-2 py-0.5">
                {activeFiltersCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowScrapingModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Start Scraping
          </button>
          <button
            onClick={() => fetchSchools(1, false)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Active Schools</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statsLoading ? "--" : stats?.total_schools ?? 0}
              </p>
            </div>
            <School className="h-8 w-8 text-indigo-500" />
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Rating</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statsLoading
                  ? "--"
                  : (stats?.average_rating?.toFixed(1) ?? "0.0")}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <SlidersHorizontal className="h-4 w-4 text-emerald-500" />
              Leading School Type
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {leadingType ? `${leadingType.type} (${leadingType.count})` : "—"}
            </p>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <SlidersHorizontal className="h-4 w-4 text-sky-500" />
              Leading State
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {leadingState
                ? `${leadingState.state} (${leadingState.count})`
                : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 space-y-4">
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="flex items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by school name or keyword..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchInput}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onFocus={() =>
                  searchSuggestions.length > 0 && setShowSuggestions(true)
                }
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              />
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion.type}-${suggestion.value}-${index}`}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-900">
                        {suggestion.value}
                      </span>
                      <span className="text-xs text-gray-500">
                        {suggestion.type} ({suggestion.count})
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="submit"
              className="ml-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="ml-3 px-4 py-2 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleExportFiltered}
              className="ml-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Results
            </button>
          </div>
        </form>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                value={filters.city}
                onChange={(e) => handleFilterChange("city", e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g. Bangalore"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                State
              </label>
              <input
                type="text"
                value={filters.state}
                onChange={(e) => handleFilterChange("state", e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g. Karnataka"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                School Type
              </label>
              <select
                value={filters.school_type}
                onChange={(e) =>
                  handleFilterChange("school_type", e.target.value)
                }
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All types</option>
                {SCHOOL_TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Board
              </label>
              <select
                value={filters.board}
                onChange={(e) => handleFilterChange("board", e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All boards</option>
                {BOARD_OPTIONS.map((board) => (
                  <option key={board} value={board}>
                    {board}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Medium
              </label>
              <select
                value={filters.medium_of_instruction}
                onChange={(e) =>
                  handleFilterChange("medium_of_instruction", e.target.value)
                }
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All mediums</option>
                {MEDIUM_OPTIONS.map((medium) => (
                  <option key={medium} value={medium}>
                    {medium}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Min Rating
                </label>
                <input
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  value={filters.min_rating}
                  onChange={(e) =>
                    handleFilterChange("min_rating", e.target.value)
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Max Rating
                </label>
                <input
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  value={filters.max_rating}
                  onChange={(e) =>
                    handleFilterChange("max_rating", e.target.value)
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex flex-wrap gap-6">
          <button
            onClick={() => setActiveTab("schools")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "schools"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Schools ({schools.length})
          </button>
          <button
            onClick={() => setActiveTab("scraping")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "scraping"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Scraping Jobs ({jobs.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === "schools" ? (
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600">Page size</label>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-md px-3 py-1.5 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size} per page
                  </option>
                ))}
              </select>
            </div>

            {selectedSchools.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 w-full lg:w-auto">
                <div className="text-sm text-blue-900 font-medium">
                  {selectedSchools.length} school
                  {selectedSchools.length === 1 ? "" : "s"} selected
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setBulkAction("activate");
                      setBulkError(null);
                      setShowBulkModal(true);
                    }}
                    className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => {
                      setBulkAction("deactivate");
                      setBulkError(null);
                      setShowBulkModal(true);
                    }}
                    className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    Deactivate
                  </button>
                  <button
                    onClick={() => {
                      setBulkAction("export");
                      setBulkError(null);
                      setShowBulkModal(true);
                    }}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" />
                    Export Selected
                  </button>
                  <button
                    onClick={() => setSelectedSchools([])}
                    className="px-3 py-1.5 text-sm text-blue-700 hover:text-blue-900"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3 bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={handleSelectAll}
                          className="flex items-center"
                        >
                          {selectedSchools.length === schools.length &&
                          schools.length > 0 ? (
                            <CheckSquare className="h-4 w-4 text-indigo-600" />
                          ) : (
                            <Square className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type / Board
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {schools.map((school) => (
                      <tr key={school.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleSelectSchool(school.id)}
                            className="flex items-center"
                          >
                            {selectedSchools.includes(school.id) ? (
                              <CheckSquare className="h-4 w-4 text-indigo-600" />
                            ) : (
                              <Square className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {school.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {school.website || "No website"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {school.city}, {school.state}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>{school.school_type || "—"}</div>
                          <div className="text-xs text-gray-400">
                            {school.board || "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="font-medium text-gray-900">
                            {school.average_rating
                              ? school.average_rating.toFixed(1)
                              : "—"}
                          </div>
                          <div className="text-xs text-gray-400">
                            {school.total_reviews} review
                            {school.total_reviews === 1 ? "" : "s"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              school.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {school.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Link
                            href={`/portal/schools/${school.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/portal/schools/${school.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button className="text-gray-400 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {schools.length} school
                  {schools.length === 1 ? "" : "s"}
                </div>
                <button
                  onClick={handleLoadMore}
                  disabled={!hasMoreSchools || loadingMore}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    hasMoreSchools
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {loadingMore
                    ? "Loading..."
                    : hasMoreSchools
                      ? "Load More"
                      : "No More Results"}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white shadow rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Top Rated Schools
                </h3>
                <div className="space-y-3">
                  {topRatedSchools.length === 0 && (
                    <p className="text-sm text-gray-500">
                      No ratings available yet.
                    </p>
                  )}
                  {topRatedSchools.map((school) => (
                    <div
                      key={school.id}
                      className="border border-gray-100 rounded-md p-3"
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {school.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {school.city}, {school.state}
                      </p>
                      <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                        <span>
                          Rating:{" "}
                          <strong className="text-gray-900">
                            {school.average_rating
                              ? school.average_rating.toFixed(1)
                              : "—"}
                          </strong>
                        </span>
                        <span>{school.total_reviews ?? 0} reviews</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Region
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Found
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Processed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Errors
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {job.region}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {job.schools_found ?? 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {job.schools_processed ?? 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(job.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {job.completed_at
                        ? new Date(job.completed_at).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {job.error_message || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Scraping Modal */}
      {showScrapingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Start Scraping Job
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Region / Query
                </label>
                <input
                  type="text"
                  value={scrapingRegion}
                  onChange={(e) => setScrapingRegion(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g. Bangalore, Delhi NCR, Maharashtra"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowScrapingModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  disabled={scrapingLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleScraping}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  disabled={scrapingLoading}
                >
                  {scrapingLoading ? "Starting..." : "Start"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Confirm Bulk Action
            </h3>
            <p className="text-sm text-gray-600">
              {bulkAction === "export"
                ? selectedSchools.length > 0
                  ? `Export ${selectedSchools.length} selected schools to CSV?`
                  : "Export the current filtered results to CSV?"
                : `Are you sure you want to ${bulkAction} ${selectedSchools.length} selected school${
                    selectedSchools.length === 1 ? "" : "s"
                  }?`}
            </p>
            {bulkError && <p className="text-sm text-red-600">{bulkError}</p>}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowBulkModal(false);
                  setBulkError(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                disabled={bulkLoading}
              >
                Cancel
              </button>
              <button
                onClick={executeBulkAction}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                disabled={bulkLoading}
              >
                {bulkLoading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
