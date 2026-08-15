/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import CardCandidates from "@/components/card-candidates/page";
import { Button } from "@/components/ui/button";
import { GLOBAL_VARIABLES, TOKEN_KEY } from "@/global/globalVariables";
import SoundButton from "@/tables/election_results_table/SoundButton";
import "../style.css";
import { Howl } from "howler";
import { GiSoundWaves } from "react-icons/gi";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { getItemAsync } from "@/context/SecureStore";
import type { CandidateResults, Results } from "@/data_types";
import { UltimateSpeech } from "@/services/speeches";
const speech = "/sounds/speech.mp3";
import TableElectionResultsPublic from "@/tables/election_results_table/page-public";
import Waveform from "@/tables/election_results_table/Waveform";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";

const soundSpeech = new Howl({
  src: [speech],
  autoplay: false,
  loop: false,
  volume: 1,
});

function PublicAnnouncement() {
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();
  const [animationStyle, setAnimationStyle] = useState<string>("");
  const { imageList } = useAuth();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [data, setData] = useState<CandidateResults[]>();
  const [results, setResults] = useState<Results | null>(null);
  const [clicked, setClicked] = useState(false);
  const [counter, setCounter] = useState(0);

  const onPressLoadResultsComputed = useCallback(() => {
    axios
      .get(
        `http://${GLOBAL_VARIABLES.LOCALHOST}/api/blockchain/get-results-computed`,
      )
      .then((response) => {
        const res = response.data.data;
        if (res?.candidatesResult) {
          let newData = res.candidatesResult.map((x: any, index: any) => {
            const candidatePhotoName = x.candidate.name
              .toLowerCase()
              .split(" ")
              .join(".");
            const partyPhotoName = x.candidate.party
              .toLowerCase()
              .split(" ")
              .join(".");
            return {
              id: index + 1,
              numVotes: x.numVotes.toString(),
              percentage: Number(x.percentage.toFixed(2)),
              party: x.candidate.party,
              candidadePhoto: imageList?.[candidatePhotoName] ?? "",
              partyImage: imageList?.[partyPhotoName] ?? "",
              candidate: x.candidate.name,
            };
          });

          newData.sort((a: any, b: any) => b.percentage - a.percentage);
          newData = newData.map((x: any, index: any) => ({
            ...x,
            id: index + 1,
          }));

          setData([...newData]);
          setResults(res);
        }
      })
      .catch((error) => console.error(error));
  }, [imageList]);

  useEffect(() => {
    onPressLoadResultsComputed();
  }, [onPressLoadResultsComputed]);

  const onPressLoadResults = useCallback(async () => {
    const token = await getItemAsync(TOKEN_KEY);
    axios.defaults.withCredentials = true;
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;

    axios
      .get(`http://${GLOBAL_VARIABLES.LOCALHOST}/api/blockchain/get-results`, {
        withCredentials: true,
      })
      .then((response) => {
        const res = response.data.data;
        if (res?.candidatesResult) {
          let newData = res.candidatesResult.map((x: any, index: any) => {
            const candidatePhotoName = x.candidate.name
              .toLowerCase()
              .split(" ")
              .join(".");
            const partyPhotoName = x.candidate.party
              .toLowerCase()
              .split(" ")
              .join(".");
            return {
              id: index + 1,
              numVotes: x.numVotes.toString(),
              percentage: Number(x.percentage.toFixed(2)),
              party: x.candidate.party,
              candidadePhoto: imageList?.[candidatePhotoName] ?? "",
              partyImage: imageList?.[partyPhotoName] ?? "",
              candidate: x.candidate.name,
            };
          });
          newData.sort((a: any, b: any) => b.percentage - a.percentage);
          newData = newData.map((x: any, index: any) => ({
            ...x,
            id: index + 1,
          }));
          setData([...newData]);
          setResults(res);
        }
      })
      .catch(() => {});
  }, [imageList]);

  useEffect(() => {
    if (counter >= 100) {
      setClicked(false);
      onPressLoadResults();
      setAnimationStyle("bright glow");
    }
  }, [counter, onPressLoadResults]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleClick = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setClicked(true);
    setCounter(0);
    setAnimationStyle("");

    intervalRef.current = setInterval(() => {
      setCounter((x) => {
        if (x >= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 100;
        }
        return Math.min(x + Math.floor(Math.random() * 50 + 5), 100);
      });
    }, 1000);
  };

  const onClearResults = () => {
    axios
      .delete(
        `http://${GLOBAL_VARIABLES.LOCALHOST}/api/blockchain/clear-results`,
      )
      .then((response) => {
        if (response.data !== undefined) {
          toast({
            title: "Feedback",
            description: "Success! Computed results erased ...",
          });
          setResults(null);
          setData(undefined);
        }
      })
      .catch((error) => console.error(error));
  };

  const onGenerateSpeech = async () => {
    try {
      if (results) {
        await UltimateSpeech(results);
        toast({
          title: "Feedback",
          description:
            "Success! New speech has been generated. Please play it ...",
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  const onPlaySpeech = () => {
    if (!isPlaying) {
      soundSpeech.play();
      setIsPlaying(true);
    } else {
      soundSpeech.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="flex gap-2 flex-col h-full">
      <span className="font-inria-sans text-2xl text-gray-400">
        Election Public Announcement
      </span>
      <div className="md:items-center md:gap-2 md:flex-col w-full h-screen">
        <div className="flex justify-between mb-1">
          <span className="font-inria-sans text-xl text-gray-400">
            2027 Election Results
          </span>
          <div className="flex gap-10 items-center">
            <SoundButton type="on" />
            <SoundButton type="off" />
            <AlertDialog>
              <AlertDialogTrigger>
                <div className="flex items-center bg-gray-200 p-2 pl-3 pr-3 rounded-sm hover:bg-gray-300">
                  <GiSoundWaves color="#6B7280" />
                </div>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Speech Options</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will generate a speech based on the current
                    election's result and may incur a cost of approximately $1.
                    Please double check your action!
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <div className="flex flex-col w-full gap-2">
                    <div className="flex flex-row gap-2 justify-between">
                      <AlertDialogCancel className="w-full">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="w-full"
                        onClick={onPlaySpeech}
                      >
                        {isPlaying ? "Pause Speech" : "Play Old Speech"}
                      </AlertDialogAction>
                    </div>
                    <div className="flex items-center justify-center">
                      <AlertDialogAction
                        className="bg-red-800 w-auto"
                        onClick={onGenerateSpeech}
                      >
                        Generate and Play New Speech
                      </AlertDialogAction>
                    </div>
                  </div>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 xl:grid-cols-7 gap-3">
          <div className="col-span-3 flex flex-col gap-5">
            <div className="flex flex-col gap-2 w-full">
              <div className="flex flex-row gap-2 py-1">
                <Button className="max-w-lg" onClick={onClearResults}>
                  Dump
                </Button>
                <button
                  className={`max-w-lg inline-block text-sm text-white px-4 py-2 rounded-md cursor-pointer ${
                    clicked
                      ? "animate-explode"
                      : "hover:shadow-lg animate-gradient"
                  }`}
                  onClick={handleClick}
                  style={{
                    background:
                      "linear-gradient(to right, #262626, #949435, #b72424)",
                    border: "none",
                    boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.2)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                >
                  {clicked ? "Processing..." : "Process Results"}
                </button>
              </div>
              {data && <TableElectionResultsPublic data={data} />}
            </div>
            <div className="grid grid-cols-2 h-full">
              <div className="flex flex-col gap-1 sm:gap-2 items-center justify-center">
                <span className="font-inria-sans text-xl text-gray-500">
                  Progress
                </span>
                <span className="font-bold font-inria-sans text-6xl text-gray-600">
                  {counter}%
                </span>
              </div>
              <div>
                <Waveform
                  audio={speech}
                  isPlaying={isPlaying}
                  setIsPlaying={setIsPlaying}
                  soundSpeech={soundSpeech}
                />
              </div>
            </div>
          </div>

          <div className="col-span-4">
            {data && data.length >= 2 && (
              <CardCandidates data={data} animationStyle={animationStyle} />
            )}
            {!data && (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
              </div>
            )}
          </div>
        </div>
        <Toaster />
      </div>
    </div>
  );
}

export default PublicAnnouncement;
