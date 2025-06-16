import {
  ChevronDown,
  ChevronsUpDown,
  ChevronUp,
  FileText,
  Filter,
  Loader2,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const fetchClaims = async (filters: any) => {
  const params = new URLSearchParams();

  if (filters.memberId) {
    params.append("memberId", filters.memberId);
  }
  if (filters.startDate) {
    params.append("startDate", filters.startDate);
  }
  if (filters.endDate) {
    params.append("endDate", filters.endDate);
  }

  const url = `/claims${params.toString() ? `?${params.toString()}` : ""}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch claims");
  }

  return response.json();
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

type Claim = {
  claimId: string;
  memberId: string;
  serviceDate: string;
  totalAmount: string;
  diagnosisCodes?: string | null;
};

type SortConfig = {
  key: keyof Claim | null;
  direction: "asc" | "desc";
};

export default function ClaimTable() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [filters, setFilters] = useState({
    memberId: "",
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "claimId",
    direction: "asc",
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchClaims(filters);
      setClaims(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setClaims([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
  };

  const handleSort = (key: keyof Claim) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedClaims = [...claims].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (!aValue && !bValue) return 0;
    if (!aValue) return 1;
    if (!bValue) return -1;

    let comparison = 0;
    switch (sortConfig.key) {
      case "totalAmount":
        comparison = parseInt(aValue) - parseInt(bValue);
        break;
      case "serviceDate":
        comparison = new Date(aValue).getTime() - new Date(bValue).getTime();
        break;
      default:
        comparison = aValue.toString().localeCompare(bValue.toString());
    }

    return sortConfig.direction === "desc" ? -comparison : comparison;
  });

  const getSortIcon = (columnKey: keyof Claim) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-500" />;
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-4 h-4 text-blue-400" />
    ) : (
      <ChevronDown className="w-4 h-4 text-blue-400" />
    );
  };

  const total = claims.reduce((sum, c) => sum + parseInt(c.totalAmount), 0);

  return (
    <div className="w-full min-h-screen p-4 md:p-6">
      <div className="w-full max-w-full mx-auto">
        <div className="bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 rounded-3xl p-6 md:p-8 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/5"></div>
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-gray-800/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-gray-900/5 rounded-full blur-lg"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Claims Overview
                </h1>
                <p className="text-gray-700">Monitor and analyze claim data</p>
              </div>
            </div>
            <div className="bg-gray-800/20 backdrop-blur-sm rounded-2xl p-4 md:p-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-700">
                  Total Amount
                </span>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-800">
                $
                {(total / 100).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-3xl p-6 mb-6 border border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-white" />
            <h2 className="text-lg font-semibold text-white">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              type="text"
              placeholder="Member ID"
              value={filters.memberId}
              onChange={(e) => handleFilterChange("memberId", e.target.value)}
            />
            <Input
              type="date"
              placeholder="Start Date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
            />
            <Input
              type="date"
              placeholder="End Date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
            />
            <Button onClick={load} disabled={loading}>
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Search className="w-4 h-4" />
                  Apply Filters
                </div>
              )}
            </Button>
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-900/30 border border-red-700 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        <div className="bg-gray-800 rounded-3xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700 border-b border-gray-600">
                  {[
                    "claimId",
                    "memberId",
                    "serviceDate",
                    "totalAmount",
                    "diagnosisCodes",
                  ].map((key) => (
                    <th
                      key={key}
                      className="text-left py-4 px-6 cursor-pointer">
                      <div
                        onClick={() => handleSort(key as keyof Claim)}
                        className="inline-flex items-center gap-1 hover:text-blue-400 transition-colors text-white">
                        {key === "claimId" && "Claim ID"}
                        {key === "memberId" && "Member ID"}
                        {key === "serviceDate" && "Service Date"}
                        {key === "totalAmount" && "Amount"}
                        {key === "diagnosisCodes" && "Diagnosis Codes"}
                        {getSortIcon(key as keyof Claim)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedClaims.map((claim) => (
                  <tr
                    key={claim.claimId}
                    className="border-b border-gray-700 hover:bg-gray-750 transition-colors duration-200">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-white font-mono text-sm">
                          {claim.claimId}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-300 font-mono text-sm">
                        {claim.memberId}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-300">
                        {formatDate(claim.serviceDate)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-green-400 font-semibold">
                        $
                        {(parseInt(claim.totalAmount) / 100).toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 2 }
                        )}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {claim.diagnosisCodes ? (
                        <div className="flex flex-wrap gap-1">
                          {claim.diagnosisCodes.split(", ").map((code, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-700 text-gray-300 rounded-lg text-xs font-mono">
                              {code}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 italic">
                          No diagnosis codes
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {claims.length === 0 && !loading && !error && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No claims found</p>
              <p className="text-gray-500 text-sm">
                Try adjusting your filters
              </p>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 text-gray-600 mx-auto mb-4 animate-spin" />
              <p className="text-gray-400 text-lg">Loading claims...</p>
            </div>
          )}
        </div>

        {claims.length > 0 && (
          <div className="mt-6 bg-gray-800 rounded-3xl p-6 border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {claims.length}
                </div>
                <div className="text-gray-400 text-sm">Total Claims</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  $
                  {(total / 100 / claims.length).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </div>
                <div className="text-gray-400 text-sm">Average Amount</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {claims.filter((c) => c.diagnosisCodes).length}
                </div>
                <div className="text-gray-400 text-sm">With Diagnosis</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
