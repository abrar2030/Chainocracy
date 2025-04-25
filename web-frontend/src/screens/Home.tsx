import React from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from 'next/image';

const Home = () => {
  const router = useRouter();

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col items-center text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Blockchain Voting System</h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          A secure, transparent, and efficient way to conduct elections using blockchain technology
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Secure Voting</CardTitle>
            <CardDescription>Vote with confidence</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="relative w-40 h-40">
              <Image 
                src="/images/bitcoin.svg" 
                alt="Secure Voting" 
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-500">
              Our blockchain technology ensures your vote is secure, immutable, and verifiable.
            </p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transparent Process</CardTitle>
            <CardDescription>See the entire election process</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="relative w-40 h-40">
              <Image 
                src="/images/nakamoto.svg" 
                alt="Transparent Process" 
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-500">
              Every step of the election is recorded on the blockchain, ensuring complete transparency.
            </p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Real-time Results</CardTitle>
            <CardDescription>Instant vote counting</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="relative w-40 h-40">
              <Image 
                src="/images/crypto_portfolio.svg" 
                alt="Real-time Results" 
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-500">
              Results are calculated in real-time as votes are cast and verified on the blockchain.
            </p>
          </CardFooter>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-12">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Current Election</CardTitle>
            <CardDescription>Presidential Election 2025</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="relative w-full h-48">
              <Image 
                src="/images/ethereum.svg" 
                alt="Current Election" 
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push('/candidates')}>
              View Candidates
            </Button>
            <Button onClick={() => router.push('/vote')}>
              Cast Your Vote
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Election Results</CardTitle>
            <CardDescription>View the latest results</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="relative w-full h-48">
              <Image 
                src="/images/digital_currency.svg" 
                alt="Election Results" 
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={() => router.push('/results')}>
              View Results
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Home;
