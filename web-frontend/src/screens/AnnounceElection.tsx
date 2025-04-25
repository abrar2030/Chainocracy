import { useState } from 'react';
import { DateRange } from '@/data_types';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const AnnounceElection = () => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!title || !description || !dateRange.from || !dateRange.to) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Format dates for submission
    const startTimeVoting = dateRange.from ? dateRange.from.toISOString() : '';
    const endTimeVoting = dateRange.to ? dateRange.to.toISOString() : '';

    // Create announcement object
    const announcement = {
      title,
      description,
      startTimeVoting,
      endTimeVoting,
      candidates: []
    };

    // Submit announcement (mock implementation)
    console.log("Submitting announcement:", announcement);
    toast({
      title: "Success",
      description: "Election announced successfully",
    });

    // Reset form
    setTitle("");
    setDescription("");
    setDateRange({ from: undefined, to: undefined });
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Announce Election</CardTitle>
          <CardDescription>Create a new election announcement</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Election title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Election description"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Voting Period</Label>
              <div className="border rounded-md p-4">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => handleDateRangeChange(range || {})}
                  numberOfMonths={2}
                  disabled={(date) => date < new Date()}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit">Announce Election</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AnnounceElection;
