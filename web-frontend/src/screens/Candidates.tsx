/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Toaster } from "@/components/toast/toaster";
import { useToast } from "@/components/toast/use-toast";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import type { Candidate } from "@/data_types";
import { GLOBAL_VARIABLES } from "@/global/globalVariables";
import { CandidadeModal } from "@/tables/candidates_table/operation-candidate";
import TableCandidates from "@/tables/candidates_table/page";
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

function Candidates() {
  const { toast } = useToast();
  const [data, setData] = useState<Candidate[]>([]);
  const [editCandidate, setEditCandidate] = useState<Candidate | null>(null);
  const { imageList, updateImages } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const onPressLoadCandidates = useCallback(() => {
    if (!imageList) return;

    axios
      .get(`http://${GLOBAL_VARIABLES.LOCALHOST}/api/blockchain/candidates`)
      .then((response) => {
        const candidates = response.data.data.candidates;
        if (candidates) {
          const newData = candidates.map((element: any, index: number) => {
            const candidatePhotoName = element.name
              .toLowerCase()
              .split(" ")
              .join(".");
            const partyPhotoName = element.party
              .toLowerCase()
              .split(" ")
              .join(".");
            return {
              id: index + 1,
              code: element.code.toString(),
              name: element.name,
              party: element.party,
              acronym: element.acronym,
              candidadePhoto: imageList[candidatePhotoName] ?? "default",
              partyImage: imageList[partyPhotoName] ?? "default",
              status: element.status,
              toast,
              editCandidate,
              setEditCandidate,
            };
          });
          setData(newData);
        }
      })
      .catch(() => {});
  }, [imageList, toast, editCandidate]);

  useEffect(() => {
    onPressLoadCandidates();
  }, [onPressLoadCandidates]);

  const onPressLoadCandidatesNotDeployed = () => {
    axios
      .get(`http://${GLOBAL_VARIABLES.LOCALHOST}/api/committee/candidates`)
      .then((response) => {
        const candidates = response.data.candidates;
        if (candidates) {
          const newData = candidates.map((element: any, index: number) => {
            const candidatePhotoName = element.name
              .toLowerCase()
              .split(" ")
              .join(".");
            const partyPhotoName = element.party
              .toLowerCase()
              .split(" ")
              .join(".");
            return {
              id: index + 1,
              code: element.code.toString(),
              name: element.name,
              party: element.party,
              acronym: element.acronym,
              candidadePhoto: imageList?.[candidatePhotoName] ?? "default",
              partyImage: imageList?.[partyPhotoName] ?? "default",
              status: element.status,
              toast,
              editCandidate,
              setEditCandidate,
            };
          });
          setData(newData);
        }
      })
      .catch(() => {});
  };

  const onPressDeployBlockchain = () => {
    axios
      .post(
        `http://${GLOBAL_VARIABLES.LOCALHOST}/api/blockchain/deploy-candidates`,
      )
      .then((response) => {
        const candidates = response.data.data.candidates;
        if (candidates) {
          const newData = candidates.map((element: any, index: number) => {
            const candidatePhotoName = element.name
              .toLowerCase()
              .split(" ")
              .join(".");
            const partyPhotoName = element.party
              .toLowerCase()
              .split(" ")
              .join(".");
            return {
              id: index + 1,
              code: element.code,
              name: element.name,
              party: element.party,
              acronym: element.acronym,
              candidadePhoto: imageList?.[candidatePhotoName] ?? "default",
              partyImage: imageList?.[partyPhotoName] ?? "default",
              status: element.status,
              toast,
              editCandidate,
              setEditCandidate,
            };
          });
          setData(newData);
          toast({
            title: "Feedback",
            description: "Success! Data deployed successfully ...",
          });
        }
      })
      .catch(() => {
        toast({
          title: "Feedback",
          description: "Error! Something went wrong.",
        });
      });
  };

  const onPressDeleteFromBlockchain = () => {
    axios
      .get(
        `http://${GLOBAL_VARIABLES.LOCALHOST}/api/committee/clear-candidates`,
      )
      .then((response) => {
        if (response.data.candidates !== undefined) {
          setData([]);
          toast({
            title: "Feedback",
            description: "Success! Data cleared successfully ...",
          });
        }
      })
      .catch(() => {
        toast({
          title: "Feedback",
          description: "Error! Something went wrong.",
        });
      });
  };

  return (
    <div className="flex gap-2 flex-col">
      <span className="font-inria-sans text-2xl text-gray-400">Candidates</span>
      <Toaster />
      <div className="md:items-center md:gap-2 w-full h-screen">
        <div className="flex flex-col md:flex-row gap-2 py-4 flex-wrap">
          <CandidadeModal
            isOpen={isAddModalOpen}
            onOpenChange={setIsAddModalOpen}
            setData={setData}
            toast={toast}
            defaultValues={null}
            mode={true}
          />

          <Button
            className="max-w-lg md:w-auto"
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Candidate
          </Button>
          <Button
            className="max-w-lg md:w-auto"
            onClick={() => {
              updateImages();
              onPressLoadCandidates();
            }}
          >
            Load Candidates
          </Button>
          <Button
            className="max-w-lg md:w-auto"
            onClick={onPressLoadCandidatesNotDeployed}
          >
            Load [Not Deployed]
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <span className="inline-flex items-center text-sm bg-green-900 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-green-800 transition-colors">
                Deploy to Blockchain
              </span>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently erase all
                  data stored in the smart-contract and register the new data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onPressDeployBlockchain}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <span className="inline-flex items-center text-sm bg-red-900 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-red-800 transition-colors">
                Delete from Blockchain
              </span>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently erase all
                  data stored in the smart-contract.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onPressDeleteFromBlockchain}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <TableCandidates data={data} setData={setData} toast={toast} />
      </div>
    </div>
  );
}

export default Candidates;
