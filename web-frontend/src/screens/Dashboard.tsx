/* eslint-disable @typescript-eslint/no-explicit-any */

import CircularProgress from "@mui/joy/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { FaUserClock } from "react-icons/fa";
import LineChartDemo from "@/components/dashboard-components/line-chart";
import VerticalBars from "@/components/dashboard-components/vertical-bar";
import { useAuth } from "@/context/AuthContext";
import type { Results } from "@/data_types";
import GoogleMap from "@/geomap/GoogleMap";
import { GLOBAL_VARIABLES } from "@/global/globalVariables";

const themeLinearProgressBar = createTheme({
  palette: {
    primary: {
      light: "#DDD2D4",
      main: "#DE0031",
      dark: "#DE0031",
    },
  },
});

function Dashboard() {
  const {
    setMapData,
    setPartiesData,
    provinces,
    topVotesPerProvinces,
    setTopVotesPerProvinces,
    imageList,
  } = useAuth();

  const [data, setData] = useState<any[]>();
  const [percentage, setPercentage] = useState<number>(0);

  const [dataResults, setDataResults] = useState<Results>({
    totalVotesReceived: 0,
    averageTimePerVote: 0,
    averageVotePerProvince: 0,
    candidatesResult: [],
    endTime: 0,
    startTime: 0,
    expectedTotalVotes: 0,
    totalCandidates: 0,
    votesPerDay: 0,
    votesPerParty: 0,
    votesPerProvince: 0,
    winner: {
      code: 0,
      name: "",
      acronym: "",
      party: "",
      status: "",
      toast: () => {},
    },
  });

  const onPressLoadResultsComputed = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://${GLOBAL_VARIABLES.LOCALHOST}/api/blockchain/get-results-computed`,
      );
      const results = response.data.data;
      if (results?.candidatesResult) {
        let newDataCandidates = results.candidatesResult.map(
          (x: any, index: any) => {
            const candidateName = x.candidate.name
              .toLowerCase()
              .split(" ")
              .join(".");
            const partyName = x.candidate.party
              .toLowerCase()
              .split(" ")
              .join(".");

            return {
              id: index + 1,
              numVotes: x.numVotes.toString(),
              percentage: x.percentage.toString(),
              party: x.candidate.party,
              acronym: x.candidate.acronym,
              candidate: x.candidate.name,
              candidatePhoto: imageList ? (imageList[candidateName] ?? "") : "",
              partyImage: imageList ? (imageList[partyName] ?? "") : "",
            };
          },
        );

        newDataCandidates = newDataCandidates.sort(
          (a: any, b: any) => b.percentage - a.percentage,
        );
        setData(newDataCandidates);

        const newParties = results.candidatesResult.map(
          (x: any) => x.candidate.party,
        );

        const total_expected: number = results.expectedTotalVotes;
        const total_received: number = results.totalVotesReceived;
        let perc: number =
          total_expected > 0 ? (total_received * 100) / total_expected : 0;
        perc = Number(perc.toFixed(2));

        setPercentage(perc);
        setDataResults(results);
        setMapData(results.votesPerProvince);
        setPartiesData(newParties);

        let newsTopVotesPerProvinces = provinces.map((x: any, index: any) => ({
          id: index + 1,
          province: x,
          percentage: results.votesPerProvince[x]
            ? (100 * results.votesPerProvince[x].sum) /
              results.totalVotesReceived
            : 0,
          number: `${results.votesPerProvince[x]?.sum ?? 0}K`,
        }));

        newsTopVotesPerProvinces = newsTopVotesPerProvinces.sort(
          (a: any, b: any) => b.percentage - a.percentage,
        );

        setTopVotesPerProvinces(newsTopVotesPerProvinces);
      }
    } catch (_error) {
      // Silently handle API errors when backend is not available
    }
  }, [
    imageList,
    provinces,
    setMapData,
    setPartiesData,
    setTopVotesPerProvinces,
  ]);

  useEffect(() => {
    onPressLoadResultsComputed();
  }, [onPressLoadResultsComputed]);

  if (!dataResults) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full">
      <div className="grid grid-cols-4 gap-3 w-full">
        <div className="flex flex-col gap-3 col-span-1">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <span className="font-inria-sans text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Votes Received
            </span>
            <div className="flex items-center justify-between gap-2 pt-3">
              <CircularProgress
                size="lg"
                color="danger"
                variant="solid"
                determinate
                value={percentage}
              >
                <span className="text-xs font-bold text-white">
                  {percentage}%
                </span>
              </CircularProgress>
              {dataResults?.totalVotesReceived > 0 && (
                <div className="flex flex-col items-end">
                  <span className="text-3xl font-bold text-gray-700">
                    {(100 - percentage).toFixed(1)}%
                  </span>
                  <span className="text-xs text-gray-400">remaining</span>
                </div>
              )}
            </div>
            <div className="pt-2">
              {dataResults?.totalVotesReceived > 0 && (
                <span className="text-sm text-gray-500">
                  {dataResults?.totalVotesReceived.toLocaleString()} Votes cast
                </span>
              )}
            </div>
          </div>

          <div className="bg-white flex flex-row gap-2 rounded-xl p-4 justify-between shadow-sm border border-gray-100">
            <div className="flex flex-col justify-center items-center">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Total Voters
              </span>
              <span className="text-2xl font-bold text-gray-700">
                {dataResults?.expectedTotalVotes > 0
                  ? `${dataResults.expectedTotalVotes}M`
                  : "—"}
              </span>
            </div>
            <div className="w-px bg-gray-100" />
            <div className="flex flex-col justify-center items-center">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Candidates
              </span>
              <span className="text-2xl font-bold text-gray-700">
                {dataResults?.candidatesResult?.length ?? 0}
              </span>
            </div>
          </div>

          <div className="bg-white flex flex-col gap-3 rounded-xl p-4 shadow-sm border border-gray-100">
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Top Parties
            </span>
            <div className="flex flex-col gap-2">
              {data?.slice(0, 5).map((party) => (
                <div
                  key={party.party}
                  className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <img
                    src={party.partyImage ?? ""}
                    alt={party.party}
                    width="28"
                    height="28"
                    className="rounded-full object-cover flex-shrink-0"
                  />
                  <span className="text-sm font-medium text-gray-700 flex-1 truncate">
                    {party.acronym}
                  </span>
                  <span className="text-xs font-semibold text-red-600 whitespace-nowrap">
                    {party.numVotes}K
                  </span>
                </div>
              ))}
              {(!data || data.length === 0) && (
                <span className="text-sm text-gray-400 italic">
                  No data available
                </span>
              )}
            </div>
          </div>

          <div className="bg-white flex flex-col gap-3 rounded-xl p-4 shadow-sm border border-gray-100">
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Top Provinces
            </span>
            <div className="flex flex-col gap-2">
              {topVotesPerProvinces?.slice(0, 5).map((provinceData: any) => (
                <div
                  className="grid grid-cols-6 items-center gap-2"
                  key={provinceData.province}
                >
                  <span className="flex justify-end col-span-2 text-xs text-gray-600 font-medium">
                    {provinceData.province}
                  </span>
                  <div className="col-span-3">
                    <ThemeProvider theme={themeLinearProgressBar}>
                      <Stack sx={{ width: "100%" }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(provinceData.percentage, 100)}
                          sx={{ height: 20, borderRadius: 1 }}
                        />
                      </Stack>
                    </ThemeProvider>
                  </div>
                  <span className="text-xs text-gray-500 col-span-1">
                    {provinceData.number}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 bg-white gap-3 rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Avg Time
                </span>
                <span className="text-sm font-bold text-gray-700">
                  {dataResults.averageTimePerVote
                    ? `${Number(dataResults.averageTimePerVote.toFixed(2))} min/vote`
                    : "—"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Avg Votes
                </span>
                <span className="text-sm font-bold text-gray-700">
                  {dataResults.averageVotePerProvince
                    ? `${Number(dataResults.averageVotePerProvince.toFixed(2))}/prov.`
                    : "—"}
                </span>
              </div>
            </div>
            <div className="flex justify-center items-center">
              <FaUserClock className="text-gray-300" size={64} />
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-3">
          <div className="grid grid-cols-5 gap-3">
            <div className="col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex flex-col mb-2">
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Daily Vote Increment
                </span>
                <span className="text-xs text-gray-400">Last day vs Today</span>
              </div>
              <LineChartDemo />
            </div>
            <div className="col-span-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Statistics by Province
              </span>
              <VerticalBars />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Coverage Region
            </span>
            <div className="flex items-center justify-center mt-2">
              {dataResults.votesPerProvince && <GoogleMap />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
