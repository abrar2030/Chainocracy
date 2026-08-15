import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CandidateResults } from "@/data_types";
import { GLOBAL_VARIABLES } from "@/global/globalVariables";
import TableElectionResults from "@/tables/election_results_table/page";

const COLORS = [
  "#DE0031",
  "#1d6feb",
  "#f59e0b",
  "#10b981",
  "#8b5cf6",
  "#ec4899",
];

const ElectionResults = () => {
  const [results, setResults] = useState<CandidateResults[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalVotes, setTotalVotes] = useState(0);

  const fetchResults = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `http://${GLOBAL_VARIABLES.LOCALHOST}/api/blockchain/get-results-computed`,
      );
      const data = response.data.data;
      if (data?.candidatesResult) {
        const mapped: CandidateResults[] = data.candidatesResult.map(
          (x: any, index: number) => ({
            id: index + 1,
            candidate: x.candidate.name,
            party: x.candidate.party,
            numVotes: x.numVotes.toString(),
            percentage: Number(x.percentage.toFixed(2)),
          }),
        );
        mapped.sort((a, b) => b.percentage - a.percentage);
        setResults(mapped);
        setTotalVotes(data.totalVotesReceived ?? 0);
      }
    } catch {
      // Fallback to empty
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const winner = results[0];
  const chartData = results.map((r) => ({
    name: r.candidate,
    value: Number(r.numVotes),
    percentage: r.percentage,
  }));

  const Spinner = () => (
    <div className="flex items-center justify-center h-48">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
    </div>
  );

  return (
    <div className="flex flex-col gap-4 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="font-inria-sans text-2xl text-gray-400">
          Election Results
        </h1>
        <button
          onClick={fetchResults}
          className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Total Votes Cast</CardDescription>
            <CardTitle className="text-3xl text-gray-700">
              {isLoading ? "—" : totalVotes.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Candidates</CardDescription>
            <CardTitle className="text-3xl text-gray-700">
              {isLoading ? "—" : results.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border border-red-100 bg-red-50/30 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Current Leader</CardDescription>
            <CardTitle className="text-lg text-red-700 truncate">
              {isLoading
                ? "—"
                : winner
                  ? `${winner.candidate} (${winner.percentage}%)`
                  : "—"}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle>Results Table</CardTitle>
            <CardDescription>
              Detailed breakdown of votes by candidate
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <Spinner /> : <TableElectionResults data={results} />}
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle>Vote Distribution</CardTitle>
            <CardDescription>
              Visual representation of vote percentages
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Spinner />
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percentage }) =>
                      `${name}: ${Number(percentage).toFixed(1)}%`
                    }
                  >
                    {chartData.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [
                      value.toLocaleString(),
                      "Votes",
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                No results available yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle>Election Summary</CardTitle>
          <CardDescription>Overview of the election results</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Spinner />
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Total votes cast</p>
                  <p className="font-semibold text-gray-800">
                    {totalVotes.toLocaleString()}
                  </p>
                </div>
                {winner && (
                  <div>
                    <p className="text-gray-500">Winner</p>
                    <p className="font-semibold text-gray-800">
                      {winner.candidate}{" "}
                      <span className="text-gray-400">({winner.party})</span>
                    </p>
                  </div>
                )}
                {winner && (
                  <div>
                    <p className="text-gray-500">Winning percentage</p>
                    <p className="font-semibold text-red-600">
                      {winner.percentage}%
                    </p>
                  </div>
                )}
              </div>
              {results.length > 0 && (
                <div className="mt-4 space-y-2">
                  {results.map((r, i) => (
                    <div key={r.id} className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full transition-all"
                          style={{
                            width: `${r.percentage}%`,
                            backgroundColor: COLORS[i % COLORS.length],
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-32 truncate">
                        {r.candidate}
                      </span>
                      <span className="text-xs font-semibold text-gray-700 w-12 text-right">
                        {r.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ElectionResults;
