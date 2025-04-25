import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Candidate } from '@/data_types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import Waveform from '@/tables/election_results_table/Waveform';

interface CandidateDetailsProps {
  candidate?: Candidate;
  isLoading?: boolean;
}

const CandidateDetails: React.FC<CandidateDetailsProps> = ({ 
  candidate = {
    id: "1",
    name: "John Doe",
    party: "Independent",
    image: "/images/nakamoto.svg",
    speech: "/audio/sample-speech.mp3",
    votes: 0
  }, 
  isLoading = false 
}) => {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    // In a real app, we would fetch the candidate data here
    console.log("Fetching candidate with ID:", id);
  }, [id]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>{candidate.name}</CardTitle>
          <CardDescription>Party: {candidate.party}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3 flex justify-center">
              {candidate.image && (
                <div className="relative w-64 h-64">
                  <Image 
                    src={candidate.image} 
                    alt={candidate.name || "Candidate"} 
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                </div>
              )}
            </div>
            <div className="w-full md:w-2/3">
              <h3 className="text-lg font-medium mb-2">Candidate Information</h3>
              <p className="text-gray-500 mb-4">
                This candidate is running for office with the {candidate.party} party.
                They have received {candidate.votes} votes so far.
              </p>
              
              {candidate.speech && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Campaign Speech</h3>
                  <Waveform url={candidate.speech} />
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
          <Button>Vote for this Candidate</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CandidateDetails;
