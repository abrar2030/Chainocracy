/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "@/context/AuthContext";

export default function VerticalBars() {
  const { topVotesPerProvinces } = useAuth();

  const [dataset, setDataset] = useState([
    {
      NumberOfVotes: 23,
      province: "Alabama",
      label: "AL",
    },
    {
      NumberOfVotes: 28,
      province: "Alaska",
      label: "AK",
    },
    {
      NumberOfVotes: 41,
      province: "Arizona",
      label: "AZ",
    },
    {
      NumberOfVotes: 73,
      province: "Arkansas",
      label: "AR",
    },
    {
      NumberOfVotes: 99,
      province: "California",
      label: "CA",
    },
    {
      NumberOfVotes: 144,
      province: "Colorado",
      label: "CO",
    },
    {
      NumberOfVotes: 150,
      province: "Florida",
      label: "FL",
    },
    {
      NumberOfVotes: 55,
      province: "Georgia",
      label: "GA",
    },
    {
      NumberOfVotes: 131,
      province: "Illinois",
      label: "IL",
    },
    {
      NumberOfVotes: 48,
      province: "Michigan",
      label: "MI",
    },
    {
      NumberOfVotes: 25,
      province: "Nevada",
      label: "NV",
    },
    {
      NumberOfVotes: 34,
      province: "New York",
      label: "NY",
    },
    {
      NumberOfVotes: 41,
      province: "Ohio",
      label: "OH",
    },
    {
      NumberOfVotes: 100,
      province: "Pennsylvania",
      label: "PA",
    },
    {
      NumberOfVotes: 90,
      province: "Texas",
      label: "TX",
    },
    {
      NumberOfVotes: 24,
      province: "Virginia",
      label: "VA",
    },
    {
      NumberOfVotes: 27,
      province: "Washington",
      label: "WA",
    },
  ]);

  useEffect(() => {
    if (topVotesPerProvinces !== undefined) {
      const val = dataset.map((x, index) => {
        const topVotesProvince = topVotesPerProvinces.find(
          (u) => u.province === x.province,
        );
        const numberOfVotes = topVotesProvince
          ? parseInt(topVotesProvince.number, 10)
          : 0;

        return {
          ...x,
          id: index + 1,
          NumberOfVotes: numberOfVotes,
        };
      });

      setDataset(val);
    }
  }, [topVotesPerProvinces, dataset.map]);

  if (topVotesPerProvinces === undefined) return <div>Loading ...</div>;

  return (
    <div style={{ width: "auto", height: "300px", padding: 0 }}>
      {" "}
      {/* Container with fixed height */}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={dataset} // Replace data with dataset
          margin={{
            top: 5,
            right: 5,
            left: 5,
            bottom: 5,
          }}
          barSize={10}
          barCategoryGap={2}
          barGap={2}
        >
          <XAxis
            dataKey="label"
            scale="point"
            spacing={20}
            tick={{ fontSize: 12 }}
          />
          <YAxis />
          <Tooltip />
          <CartesianGrid strokeDasharray="3 3" />
          <Bar
            dataKey="NumberOfVotes"
            fill="#DF0031"
            background={{ fill: "#F29EB0" }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
