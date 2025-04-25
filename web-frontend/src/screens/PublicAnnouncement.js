import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import CardCandidates from '@/components/card-candidates/page';
import SoundButton from '@/tables/election_results_table/SoundButton';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { GLOBAL_VARIABLES, TOKEN_KEY } from '@/global/globalVariables';
import axios from 'axios';
import '../style.css';
import { useState } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import { getItemAsync } from '@/context/SecureStore';
import { useAuth } from '@/context/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from "../components/ui/alert-dialog";
import { Howl } from 'howler';
import { GiSoundWaves } from "react-icons/gi";
import speech from '@/sounds/speech.mp3';
import Waveform from '@/tables/election_results_table/Waveform';
import { UltimateSpeech } from '@/services/speeches';
import TableElectionResultsPublic from '@/tables/election_results_table/page-public';
const soundSpeech = new Howl({
    src: [speech],
    autoplay: false,
    loop: false,
    volume: 1,
    onend: function () {
        // console.log('Finished!');
    }
});
function PublicAnnouncement() {
    const [isPlaying, setIsPlaying] = useState(false);
    const { toast } = useToast();
    const [animationStyle, setAnimationStyle] = useState("");
    const { imageList } = useAuth();
    useEffect(() => {
        onPressLoadResultsComputed();
    }, []);
    const [data, setData] = useState();
    const [results, setResults] = useState();
    const onPressLoadResultsComputed = () => {
        axios.get('http://' + GLOBAL_VARIABLES.LOCALHOST + '/api/blockchain/get-results-computed')
            .then(response => {
            const results = response.data;
            if (results !== undefined && results.candidatesResult) {
                let newData = results.candidatesResult.map((x, index) => {
                    const candidatePhotoName = x.candidate.name.toLowerCase().split(' ').join('.');
                    const partyPhotoName = x.candidate.party.toLowerCase().split(' ').join('.');
                    return ({
                        id: index + 1,
                        numVotes: x.numVotes.toString(),
                        percentage: Number(x.percentage.toFixed(2)),
                        party: x.candidate.party,
                        candidadePhoto: imageList[candidatePhotoName],
                        partyImage: imageList[partyPhotoName],
                        candidate: x.candidate.name
                    });
                });
                console.log("data: ", results);
                newData.sort((a, b) => b.percentage - a.percentage);
                newData = newData.map((x, index) => {
                    return {
                        ...x,
                        id: index + 1
                    };
                });
                setData([...newData]);
                setResults(results);
            }
        })
            .catch(error => console.error(error));
    };
    const onPressLoadResults = async () => {
        const token = await getItemAsync(TOKEN_KEY);
        axios.defaults.withCredentials = true;
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        axios.get('http://' + GLOBAL_VARIABLES.LOCALHOST + '/api/blockchain/get-results', { withCredentials: true })
            .then(response => {
            const results = response.data;
            if (results !== undefined && results.candidatesResult) {
                let newData = results.candidatesResult.map((x, index) => {
                    const candidatePhotoName = x.candidate.name.toLowerCase().split(' ').join('.');
                    const partyPhotoName = x.candidate.party.toLowerCase().split(' ').join('.');
                    return ({
                        id: index + 1,
                        numVotes: x.numVotes.toString(),
                        percentage: Number(x.percentage.toFixed(2)),
                        party: x.candidate.party,
                        candidadePhoto: imageList[candidatePhotoName],
                        partyImage: imageList[partyPhotoName],
                        candidate: x.candidate.name
                    });
                });
                newData.sort((a, b) => b.percentage - a.percentage);
                newData = newData.map((x, index) => {
                    return {
                        ...x,
                        id: index + 1
                    };
                });
                setData([...newData]);
                setResults(results);
            }
        })
            .catch(_ => 0);
    };
    const [clicked, setClicked] = useState(false);
    const [counter, setCounter] = useState(0);
    useEffect(() => {
        if (counter >= 100) {
            setClicked(false);
            onPressLoadResults();
            setAnimationStyle("bright glow");
        }
    }, [counter, onPressLoadResults]);
    const handleClick = () => {
        setClicked(true);
        setCounter(0);
        setAnimationStyle("");
        setInterval(() => {
            if (counter < 100) {
                setCounter(x => Math.min(x + Math.floor((Math.random() * 50) + 5), 100));
            }
            else {
                return;
            }
        }, 1000);
    };
    const onClearResults = () => {
        axios.get('http://' + GLOBAL_VARIABLES.LOCALHOST + '/api/blockchain/clear-results')
            .then(response => {
            const results = response.data;
            if (results !== undefined) {
                toast({
                    title: "Feedback",
                    description: "Success! Computed results erased ..."
                });
                setResults(null);
            }
        })
            .catch(error => console.error(error));
    };
    const onGenerateSpeech = async () => {
        try {
            if (results) {
                await UltimateSpeech(results);
                toast({
                    title: "Feedback",
                    description: "Success! New speech has been generated. Please play It ..."
                });
                // await textToSpeech();
            }
        }
        catch (e) {
            console.log(e);
        }
    };
    const onPlaySpeech = () => {
        if (!isPlaying) {
            soundSpeech.play();
            setIsPlaying(true);
        }
        else {
            soundSpeech.pause();
            setIsPlaying(false);
        }
    };
    const openDialogPlaySpeech = () => {
        return _jsxs(AlertDialog, { children: [_jsx(AlertDialogTrigger, { children: _jsx("div", { className: 'flex items-center bg-gray-200 p-2 pl-3 pr-3 rounded-sm hover:bg-gray-300', children: _jsx("div", { children: _jsx(GiSoundWaves, { color: '#6B7280' }) }) }) }), _jsxs(AlertDialogContent, { children: [_jsxs(AlertDialogHeader, { children: [_jsx(AlertDialogTitle, { children: "Are you absolutely sure?" }), _jsx(AlertDialogDescription, { children: "This action cannot be undone. This will generate a speech based on the current election's result and be charged about $1. Please, double check your action!" })] }), _jsx(AlertDialogFooter, { className: '', children: _jsxs("div", { className: 'flex flex-col w-full gap-2', children: [_jsxs("div", { className: 'flex flex-row gap-2 justify-between', children: [_jsx(AlertDialogCancel, { className: 'w-full', children: "Cancel" }), _jsx(AlertDialogAction, { className: 'w-full', onClick: onPlaySpeech, children: "Play Old Speech" })] }), _jsx("div", { className: 'flex items-center justify-center', children: _jsx(AlertDialogAction, { className: 'bg-red-800 w-auto', onClick: onGenerateSpeech, children: "Generate and Play New Speech" }) })] }) })] })] });
    };
    return (_jsxs("div", { className: 'flex gap-2 flex-col h-full', children: [_jsx("span", { className: 'font-inria-sans text-2xl text-gray-400', children: "Election Public Announcement" }), _jsxs("div", { className: 'md:items-center md:gap-2 md:flex-col w-full bg-red h-screen', children: [_jsxs("div", { className: 'flex justify-between mb-1', children: [_jsx("span", { className: 'font-inria-sans text-xl text-gray-400', children: "2027 Election Results" }), _jsxs("div", { className: 'flex gap-10 items-center', children: [_jsx(SoundButton, { type: "on" }), _jsx(SoundButton, { type: "off" }), openDialogPlaySpeech()] })] }), _jsxs("div", { className: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 xl:grid-cols-7 2xl:grid-cols-7 gap-3', children: [_jsxs("div", { className: 'col-span-3 flex flex-col gap-5 md:flex-col ', children: [_jsxs("div", { className: 'flex flex-col md:gap-2 w-full bg-red gap-2 ', children: [_jsxs("div", { className: "flex flex-row gap-2 py-1 sm:flex-row md:flex-row", children: [_jsx(Button, { className: "max-w-lg ", onClick: onClearResults, children: "Dump" }), _jsx("button", { className: `max-w-lg inline-block text-md text-white px-4 py-2 rounded-md cursor-pointer ${clicked ? 'animate-explode' : 'hover:shadow-lg animate-gradient'}`, onClick: handleClick, style: {
                                                            background: 'linear-gradient(to right, #262626, #949435, #b72424)',
                                                            border: 'none',
                                                            color: 'white', // Adjusted text color to white
                                                            boxShadow: '0px 8px 15px rgba(0, 0, 0, 0.2)', // Increased shadow for more depth
                                                            transform: 'translateY(0)',
                                                            transition: 'transform 0.2s ease, box-shadow 0.2s ease', // Added transition for hover effect
                                                        }, children: clicked ? 'Processing...' : 'Process Results' })] }), data && _jsx(TableElectionResultsPublic, { data: data })] }), _jsxs("div", { className: 'grid grid-cols-2 h-full', children: [_jsxs("div", { className: 'flex flex-col gap-1 sm:gap-2 md:gap-3 lg:gap-4 items-center justify-center', children: [_jsx("span", { className: 'font-inria-sans text-base sm:text-lg md:text-xl lg:text-2xl text-gray-500', children: "Progress" }), _jsxs("span", { className: 'font-bold font-inria-sans text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-gray-600', children: [counter, "%"] })] }), _jsx("div", { className: 'p-l', children: _jsx(Waveform, { audio: speech, isPlaying: isPlaying, setIsPlaying: setIsPlaying, soundSpeech: soundSpeech }) })] })] }), _jsxs("div", { className: 'col-span-4', children: [data && data.length >= 2 && _jsx(CardCandidates, { data: data, animationStyle: animationStyle }), !data && _jsx("span", { children: "Loading ..." })] })] }), _jsx(Toaster, {})] })] }));
}
export default PublicAnnouncement;
