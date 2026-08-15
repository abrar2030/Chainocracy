/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getItemAsync } from "@/context/SecureStore";
import type { Voter } from "@/data_types";
import { GLOBAL_VARIABLES, TOKEN_KEY } from "@/global/globalVariables";
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
} from "../../components/ui/alert-dialog";
import { columns } from "./columns";
import { DataTable } from "./data-table";

function TableVoters({ toast }: { toast: (...params: any[]) => void }) {
  const [data, setData] = useState<Voter[]>([]);

  const removeExtraEquals = (str: string): string => {
    if (!str.endsWith("==")) return str;
    return str.slice(0, -2);
  };

  const onPressLoadIdentifiers = useCallback(() => {
    axios
      .get(`http://${GLOBAL_VARIABLES.LOCALHOST}/api/blockchain/voters`)
      .then((response) => {
        const voters = response.data.data.voters;
        if (voters) {
          const newData = voters.map((element: any, index: number) => ({
            id: index + 1,
            identifier: removeExtraEquals(element.identifier),
            electoralId: "*******",
            choiceCode: element.choiceCode,
            state: element.state ? "true" : "false",
            secret: element.secret,
          }));
          setData([...newData]);
        }
      })
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    onPressLoadIdentifiers();
  }, [onPressLoadIdentifiers]);

  const onPressGenerateIdentifiers = async () => {
    const token = await getItemAsync(TOKEN_KEY);
    axios.defaults.withCredentials = true;
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;

    axios
      .get(
        `http://${GLOBAL_VARIABLES.LOCALHOST}/api/committee/generate-identifiers`,
        {
          withCredentials: true,
        },
      )
      .then((response) => {
        const votersGenerated = response.data.voters;
        const newData = votersGenerated.map((element: any, index: number) => ({
          id: index + 1,
          identifier: removeExtraEquals(element.identifier),
          electoralId: removeExtraEquals(element.electoralId),
          choiceCode: element.choiceCode,
          state: element.state ? "true" : "false",
          secret: element.secret,
        }));
        setData([...newData]);
      })
      .catch((error) => console.error(error));
  };

  const onPressDeployBlockchain = () => {
    axios
      .post(`http://${GLOBAL_VARIABLES.LOCALHOST}/api/blockchain/deploy-voters`)
      .then((response) => {
        const votersGenerated = response.data.data.voters;
        const newData = votersGenerated.map((element: any, index: number) => ({
          id: index + 1,
          identifier: removeExtraEquals(element.identifier),
          electoralId: removeExtraEquals(element.electoralId),
          choiceCode: element.choiceCode,
          state: element.state ? "true" : "false",
          secret: element.secret,
        }));
        setData([...newData]);
        toast({
          title: "Feedback",
          description: "Success! Data deployed successfully ...",
        });
      })
      .catch(() => {
        toast({
          title: "Feedback",
          description: "Error! Something went wrong.",
        });
      });
  };

  return (
    <section>
      <div className="flex gap-2 py-4 flex-wrap">
        <Button className="max-w-lg" onClick={onPressGenerateIdentifiers}>
          Generate Identifiers
        </Button>
        <Button className="max-w-lg" onClick={onPressLoadIdentifiers}>
          Load Identifiers
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
      </div>
      <DataTable columns={columns} data={data} />
    </section>
  );
}

export default TableVoters;
