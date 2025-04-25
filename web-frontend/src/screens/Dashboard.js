import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import GoogleMap from '@/geomap/GoogleMap';
import CircularProgress from '@mui/joy/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { FaUserClock } from "react-icons/fa";
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { GLOBAL_VARIABLES } from '@/global/globalVariables';
import VerticalBars from '@/components/dashboard-components/vertical-bar';
import LineChartDemo from '@/components/dashboard-components/line-chart';
const themeLinearProgressBar = createTheme({
    palette: {
        primary: {
            light: '#DDD2D4',
            main: '#DE0031',
            dark: '#DE0031',
        },
    },
});
function Dashboard() {
    const value2 = 10;
    const { setMapData, setPartiesData, provinces, topVotesPerProvinces, setTopVotesPerProvinces } = useAuth();
    const [data, setData] = useState();
    const [percentage, setPercentage] = useState();
    const { imageList } = useAuth();
    const [dataResults, setDataResults] = useState({
        totalVotesReceived: 0,
        averageTimePerVote: 0,
        averageVotePerProvince: 0,
        candidatesResult: [],
        endTime: 0,
        startTime: 0,
        expectedTotalVotes: 0,
        totalCandidates: 0,
        votesPerDay: 0,
        votesPerParty: 0,
        votesPerProvince: 0,
        winner: {
            code: 0,
            name: '',
            acronym: '',
            party: '',
            status: '',
            toast: function (...params) {
                throw new Error('Function not implemented.');
            }
        }
    });
    useEffect(() => {
        onPressLoadResultsComputed();
    }, []);
    const onPressLoadResultsComputed = async () => {
        axios.get('http://' + GLOBAL_VARIABLES.LOCALHOST + '/api/blockchain/get-results-computed')
            .then(response => {
            const results = response.data;
            if (results !== undefined && results.candidatesResult) {
                let newDataCandidates = results.candidatesResult.map((x, index) => {
                    const candidateName = x.candidate.name.toLowerCase().split(' ').join('.');
                    const partyName = x.candidate.party.toLowerCase().split(' ').join('.');
                    return ({
                        id: index + 1,
                        numVotes: x.numVotes.toString(),
                        percentage: x.percentage.toString(),
                        party: x.candidate.party,
                        acronym: x.candidate.acronym,
                        candidate: x.candidate.name,
                        candidatePhoto: imageList ? imageList[candidateName] ?? '' : '',
                        partyImage: imageList ? imageList[partyName] ?? '' : ''
                    });
                });
                newDataCandidates = newDataCandidates.sort((a, b) => b.percentage - a.percentage);
                setData(newDataCandidates);
                const newParties = results.candidatesResult.map((x) => (x.candidate.party));
                const total_expected = results.expectedTotalVotes;
                const total_received = results.totalVotesReceived;
                let perc = (total_received * 100) / total_expected;
                perc = Number(perc.toFixed(2));
                setPercentage(perc);
                setDataResults(results);
                setMapData(results.votesPerProvince);
                setPartiesData(newParties);
                let newsTopVotesPerProvinces = provinces.map((x, index) => ({
                    id: index + 1,
                    province: x,
                    percentage: (100 * results.votesPerProvince[x]['sum']) / parseInt(results.totalVotesReceived),
                    number: `${results.votesPerProvince[x]['sum']}K`
                }));
                newsTopVotesPerProvinces = newsTopVotesPerProvinces.sort((a, b) => b.percentage - a.percentage);
                setTopVotesPerProvinces(newsTopVotesPerProvinces);
            }
        }).catch(error => { });
    };
    const iconStyle = "w-100 h-100 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white";
    if (!dataResults || !percentage) {
        return (_jsx("div", { children: "Loading ..." }));
    }
    return (_jsx("div", { className: 'flex h-full w-full', children: _jsxs("div", { className: 'grid grid-cols-4 gap-3', children: [_jsxs("div", { className: 'flex flex-col gap-3 col-span-1', children: [_jsxs("div", { className: 'bg-white rounded-xl p-5', children: [_jsx("span", { className: 'font-inria-sans text-xl text-gray-400', children: "Votes Received" }), _jsxs("div", { className: "flex items-center justify-between gap-2 pt-2", children: [_jsx(CircularProgress, { size: "lg", color: "danger", variant: "solid", determinate: true, value: value2, children: _jsxs("span", { className: 'text-xs text-gray-400', children: [percentage, "%"] }) }), dataResults?.totalVotesReceived && _jsxs("span", { className: 'text-4xl text-gray-400', children: [100 - percentage, "%"] })] }), _jsx("div", { className: 'pt-2', children: dataResults?.totalVotesReceived && _jsxs("span", { className: 'text-gray-400', children: [dataResults?.totalVotesReceived, " Votes"] }) })] }), _jsxs("div", { className: 'bg-white flex flex-row gap-2 rounded-xl p-4 justify-between', children: [_jsxs("div", { className: 'flex flex-col justify-center items-center', children: [_jsx("span", { className: 'font-inria-sans text-xl text-gray-400', children: "Total voters" }), dataResults?.totalCandidates && _jsxs("span", { className: 'text-xl text-gray-400', children: [dataResults?.expectedTotalVotes, " M"] })] }), _jsxs("div", { className: 'flex flex-col justify-center items-center', children: [_jsx("span", { className: 'font-inria-sans text-xl text-gray-400', children: "Total Candidates" }), dataResults?.totalCandidates && _jsx("span", { className: 'text-xl text-gray-400', children: dataResults?.candidatesResult.length })] })] }), _jsxs("div", { className: 'bg-whtie flex flex-col bg-white gap-2 rounded-xl p-4', children: [_jsx("span", { className: 'font-inria-sans text-xl text-gray-400', children: "Top Party" }), _jsx("div", { className: 'gap-1', children: data && data.slice(0, 5).map(party => (_jsxs("div", { className: "grid grid-cols-3 sm:grid-cols-3 gap-3 p-0.5", children: [_jsx("div", { className: "col-span-1", children: _jsx("img", { src: party.partyImage ?? '', alt: party.name, width: "32", height: "32" }) }), _jsx("div", { className: "col-span-1", children: _jsx("span", { className: "font-inria-sans text-sm", children: party.acronym }) }), _jsx("div", { className: "col-span-1", children: _jsxs("span", { className: "font-inria-sans text-sm", children: [party.numVotes, " K votes"] }) })] }, party.party))) })] }), _jsxs("div", { className: 'bg-white flex flex-col gap-5 rounded-xl p-4', children: [_jsx("span", { className: 'font-inria-sans text-xl text-gray-400', children: "Top votes by province" }), _jsx("div", { className: 'flex flex-col gap-2 justify-start', children: topVotesPerProvinces && topVotesPerProvinces.slice(0, 5).map((provinceData) => (_jsxs("div", { className: 'grid grid-cols-6 items-center gap-2', children: [_jsx("span", { className: 'flex justify-end col-span-2 font-inria-sans text-sm', children: provinceData.province }), _jsx("div", { className: 'col-span-3', children: _jsx(ThemeProvider, { theme: themeLinearProgressBar, children: _jsx(Stack, { sx: { width: '100%' }, spacing: 2, children: _jsx(LinearProgress, { variant: "determinate", value: provinceData.percentage, sx: {
                                                                height: 25,
                                                                borderRadius: 1
                                                            } }) }) }) }), _jsx("span", { className: 'flex justify-start', children: provinceData.number })] }, provinceData.province))) })] }), _jsxs("div", { className: 'grid grid-cols-2 bg-white gap-2 rounded-xl p-4 justify-between', children: [_jsxs("div", { className: 'grid grid-row-2 gap-2', children: [_jsxs("div", { className: 'flex flex-col', children: [_jsx("span", { className: 'font-inria-sans text-xl text-gray-400', children: "Average time" }), dataResults.averageTimePerVote && _jsxs("span", { className: 'font-inria-sans text-sm text-gray-400', children: [Number(dataResults.averageTimePerVote.toFixed(2)), " min / vote"] })] }), _jsxs("div", { className: 'flex flex-col', children: [_jsx("span", { className: 'font-inria-sans text-xl text-gray-400', children: "Average vote" }), dataResults.averageVotePerProvince && _jsxs("span", { className: 'font-inria-sans text-sm text-gray-400', children: [Number(dataResults.averageVotePerProvince.toFixed(2)), "  votes / prov."] })] })] }), _jsx("div", { className: 'flex justify-center items-center ', children: _jsx(FaUserClock, { className: iconStyle, size: 100 }) })] })] }), _jsx("div", { className: 'col-span-3', children: _jsxs("div", { className: 'h-max', children: [_jsxs("div", { className: 'grid grid-cols-5 gap-2', children: [_jsxs("div", { className: 'col-span-2 bg-white rounded-xl p-5', children: [_jsxs("div", { className: 'flex flex-col ', children: [_jsx("span", { className: 'font-inria-sans text-xl text-gray-400', children: "Daily increment in vote" }), _jsx("span", { className: 'font-inria-sans text-sm text-gray-300', children: "Last day x Today" })] }), _jsx("div", { children: _jsx(LineChartDemo, {}) })] }), _jsxs("div", { className: 'col-span-3 bg-white rounded-xl pl-4 pr-4 pt-4', children: [_jsx("span", { className: 'font-inria-sans text-xl text-gray-400', children: "Statistics" }), _jsx(VerticalBars, {})] })] }), _jsxs("div", { className: 'cols-span-3 flex-col rounded-xl p-4 mt-3 flex-1', children: [_jsx("span", { className: 'font-inria-sans text-xl text-gray-400', children: "Coverage Region" }), _jsx("div", { className: 'items-center justify-center', children: dataResults.votesPerProvince && _jsx(GoogleMap, {}) })] })] }) })] }) }));
}
export default Dashboard;
