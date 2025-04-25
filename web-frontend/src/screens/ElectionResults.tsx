import { useEffect, useState } from 'react';
import { Candidate, CandidateResults } from '@/data_types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/tables/election_results_table/columns";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const ElectionResults = () => {
  const [results, setResults] = useState<CandidateResults[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    const fetchResults = async () => {
      // In a real app, this would be an API call
      const mockResults: CandidateResults[] = [
        { id: "1", name: "John Doe", party: "Independent", votes: 1250, percentage: 42.5 },
        { id: "2", name: "Jane Smith", party: "Progressive", votes: 980, percentage: 33.3 },
        { id: "3", name: "Bob Johnson", party: "Conservative", votes: 710, percentage: 24.2 },
      ];
      
      setTimeout(() => {
        setResults(mockResults);
        setIsLoading(false);
      }, 1000);
    };

    fetchResults();
  }, []);

  // Colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Election Results</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Card>
          <CardHeader>
            <CardTitle>Results Table</CardTitle>
            <CardDescription>Detailed breakdown of votes by candidate</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <p>Loading results...</p>
              </div>
            ) : (
              <DataTable columns={columns} data={results} />
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Vote Distribution</CardTitle>
            <CardDescription>Visual representation of vote percentages</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <p>Loading chart...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={results}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="votes"
                    nameKey="name"
                    label={({ name, percentage }) => `${name}: ${percentage?.toFixed(1)}%`}
                  >
                    {results.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Election Summary</CardTitle>
          <CardDescription>Overview of the election results</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading summary...</p>
          ) : (
            <div className="space-y-4">
              <p>
                Total votes cast: {results.reduce((sum, candidate) => sum + (candidate.votes || 0), 0)}
              </p>
              <p>
                Winner: {results.sort((a, b) => (b.votes || 0) - (a.votes || 0))[0]?.name} 
                ({results.sort((a, b) => (b.votes || 0) - (a.votes || 0))[0]?.party})
              </p>
              <p>
                Voter turnout: 78.3% (mock data)
              </p>
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Election Certification</h3>
                <p>
                  These results have been certified by the Election Commission on April 25, 2025.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ElectionResults;
