import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { Toaster } from '@/components/toast/toaster';
import { useToast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from "../components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { GLOBAL_VARIABLES } from '@/global/globalVariables';
import axios from 'axios';
import { DatePickerWithRange } from '@/components/announcement/DateRangePicker';
import { DatePicker } from '@/components/announcement/DatePicker';
import { addDays } from 'date-fns';
function AnnounceElection() {
    const { authState, isLoggedIn } = useAuth();
    const { dateRange, setDateRange } = useAuth();
    const { toast } = useToast();
    // ==== FIELDS ====
    const [startTimeVoting, setStartTimeVoting] = useState("");
    const [endTimeVoting, setEndTimeVoting] = useState("");
    const [dateResults, setDateResults] = useState(new Date());
    const [numOfCandidates, setNumOfCandidates] = useState(0);
    const [numOfVoters, setNumOfVoters] = useState(0);
    const [dateCreated, setDateCreated] = useState("");
    // ==== END FIELDS ====
    const [errors, setErrors] = useState({});
    const resetValues = () => {
        setStartTimeVoting("");
        setEndTimeVoting("");
        setDateResults(new Date());
        setNumOfCandidates(0);
        setNumOfVoters(0);
        setDateCreated("");
        setErrors({});
    };
    useEffect(() => {
        onPressLoadAnnouncement();
    }, []);
    const formValidation = () => {
        let errorHash = {};
        if (!startTimeVoting || !endTimeVoting)
            errorHash.electionDuration = "Election duration required.";
        if (!dateResults.toLocaleString())
            errorHash.resultDate = "Election result data required.";
        if (numOfVoters <= 0)
            errorHash.numVoters = "Number of voters required.";
        if (numOfCandidates <= 0)
            errorHash.numCandidates = "Number of candidates required.";
        setErrors(errorHash);
        return Object.keys(errorHash).length === 0;
    };
    useEffect(() => {
        setStartTimeVoting(dateRange?.from);
        setEndTimeVoting(dateRange?.to);
    }, [dateRange]);
    useEffect(() => {
        setDateResults(new Date());
        setNumOfCandidates(0);
        setNumOfVoters(0);
        setDateCreated("");
        setStartTimeVoting(dateRange?.from);
        setEndTimeVoting(dateRange?.to);
    }, []);
    const onPressLoadAnnouncement = async () => {
        await axios.get('http://' + GLOBAL_VARIABLES.LOCALHOST + '/api/committee/announcement')
            .then(response => {
            const announcement = response.data.announcement;
            if (announcement) {
                setStartTimeVoting(announcement.startTimeVoting);
                setEndTimeVoting(announcement.endTimeVoting);
                setDateResults(announcement.dateResults);
                setDateCreated(announcement.dateCreated);
                setNumOfCandidates(announcement.numOfCandidates);
                setNumOfVoters(announcement.numOfVoters);
                setDateRange((prev) => ({
                    ...prev,
                    from: new Date(announcement.startTimeVoting),
                    to: new Date(announcement.endTimeVoting)
                }));
            }
        })
            .catch(error => {
            //console.error(error)
        });
    };
    const onPressDeployAnnouncementBlockchain = async () => {
        if (formValidation()) {
            //resetValues();
            const URL = 'http://' + GLOBAL_VARIABLES.LOCALHOST + '/api/committee/deploy-announcement';
            const body = {
                startTimeVoting: dateRange?.from ?? new Date(2027, 4, 20),
                endTimeVoting: dateRange?.to ?? addDays(new Date(2027, 4, 20), 15),
                dateResults: new Date(dateResults),
                numOfCandidates: numOfCandidates,
                numOfVoters: numOfVoters,
            };
            const response = await axios.post(URL, body);
            const statusCode = response.status;
            if (statusCode === 201) {
                toast({
                    title: "Feedback",
                    description: "Success! Annoucement deployed."
                });
                return;
            }
            toast({
                title: "Feedback",
                description: "Error! Something went wrong."
            });
        }
        else {
            console.log("Failed to validate!");
        }
    };
    const onPressNotifyVoters = () => {
        axios.get('http://' + GLOBAL_VARIABLES.LOCALHOST + '/api/committee/registers')
            .then(response => {
            const registers = response.data.registers;
            const receivers = registers.map((element, index) => ({
                id: index + 1,
                name: element.name,
                email: element.email,
            }));
            receivers.forEach((element) => {
                const options = {
                    email: element.email
                };
                axios.post(`http://${GLOBAL_VARIABLES.LOCALHOST}/api/committee/send-email`, options)
                    .then(response => {
                    if (response.status === 200) {
                        const data = response.data;
                        console.log("Success response:", data);
                    }
                }).catch(error => {
                    console.error(error);
                });
            });
        })
            .catch(error => {
            //console.error(error)
        });
        toast({
            title: "Feedback",
            description: "Annoucements sent to the citzens.",
        });
    };
    const openDialog = () => {
        return _jsxs(AlertDialog, { children: [_jsx(AlertDialogTrigger, { children: _jsx("span", { className: "max-w-lg inline-block text-md bg-green-900 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-gray-800", children: "Deploy to Blockchain" }) }), _jsxs(AlertDialogContent, { children: [_jsxs(AlertDialogHeader, { children: [_jsx(AlertDialogTitle, { children: "Are you absolutely sure?" }), _jsx(AlertDialogDescription, { children: "This action cannot be undone. This will permanently erase all data stored in the smart-contract and register the new data." })] }), _jsxs(AlertDialogFooter, { children: [_jsx(AlertDialogCancel, { children: "Cancel" }), _jsx(AlertDialogAction, { onClick: onPressDeployAnnouncementBlockchain, children: "Continue" })] })] })] });
    };
    return (_jsxs("div", { className: 'flex gap-2 flex-col ', children: [_jsx("span", { className: 'font-inria-sans text-2xl text-gray-600', children: "Announce Election" }), _jsx(Toaster, {}), _jsx("div", { className: 'md:items-center md:gap-2 w-full bg-red h-screen', children: _jsx("div", { className: 'flex flex-col w-auto h-auto', children: _jsxs("div", { className: "flex flex-col w-full flex-grow items-center justify-center p-0", children: [_jsxs("div", { className: "flex flex-1 gap-2 justify-between py-4 w-[400px]", children: [_jsx(Button, { className: "max-w-lg", onClick: onPressLoadAnnouncement, children: "Load Announcement" }), _jsx(Button, { className: "max-w-lg", onClick: onPressNotifyVoters, children: "Notify all voters by e-mail" })] }), _jsx("form", { children: _jsxs(Card, { className: "w-[400px]", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Announcement" }), _jsx(CardDescription, { children: "Set the election details here." })] }), _jsxs(CardContent, { className: "space-y-2", children: [_jsxs("div", { className: "space-y-1", children: [_jsx(Label, { htmlFor: "num-candidates", children: "Number of candidates" }), _jsx(Input, { id: "num-candidates", type: "number", value: numOfCandidates, autoComplete: "shipping current-password webauthn", onChange: event => setNumOfCandidates(parseInt(event.target.value)) })] }), errors.numCandidates ? _jsx("div", { style: styles.errorText, children: errors.numCandidates }) : null, _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { htmlFor: "num-candidates", children: "Number of voters" }), _jsx(Input, { id: "num-voters", type: "number", value: numOfVoters, autoComplete: "shipping current-password webauthn", onChange: event => setNumOfVoters(parseInt(event.target.value)) })] }), errors.numVoters ? _jsx("div", { style: styles.errorText, children: errors.numVoters }) : null, _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { children: "Results date" }), _jsx(DatePicker, { date: dateResults, setDate: setDateResults })] }), errors.resultDate ? _jsx("div", { style: styles.errorText, children: errors.resultDate }) : null, _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { children: "Election duration" }), _jsx(DatePickerWithRange, {})] }), errors.electionDuration ? _jsx("div", { style: styles.errorText, children: errors.electionDuration }) : null] }), _jsx(CardFooter, { className: "flex justify-center", children: openDialog() })] }) })] }) }) })] }));
}
const styles = {
    errorText: {
        color: 'red',
        marginBottom: 5,
    }
};
export default AnnounceElection;
