import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Route, Routes } from 'react-router-dom';
import Dashboard from '../screens/Dashboard';
import Blockchain from '../screens/Blockchain';
import BlockchainDetails from '../screens/BlockchainDetails';
import UserManagement from '../screens/Users';
import ElectionResults from '../screens/ElectionResults';
import PopulationData from '../screens/PopulationData';
import Candidates from '../screens/Candidates';
import AnnounceElection from '../screens/AnnounceElection';
import PublicAnnouncement from '@/screens/PublicAnnouncement';
import Voters from '@/screens/Voters';
import EditAccount from '@/screens/EditAccount';
import VerificationDialog from '@/tables/voters_table/verification-modal';
import NoPage from '../screens/NoPage';
function Container() {
    return (_jsx("div", { children: _jsxs(Routes, { children: [_jsx(Route, { index: true, element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "dashboard", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "announce-election", element: _jsx(AnnounceElection, {}) }), _jsx(Route, { path: "public-announcement", element: _jsx(PublicAnnouncement, {}) }), _jsx(Route, { path: "candidates", element: _jsx(Candidates, {}) }), _jsx(Route, { path: "voters", element: _jsx(Voters, {}) }), _jsx(Route, { path: "verification", element: _jsx(VerificationDialog, { url: '' }) }), _jsx(Route, { path: "blockchain", element: _jsx(Blockchain, {}) }), _jsx(Route, { path: "blockchain/block-details/:id", element: _jsx(BlockchainDetails, {}) }), _jsx(Route, { path: "user", element: _jsx(UserManagement, {}) }), _jsx(Route, { path: "election-results", element: _jsx(ElectionResults, {}) }), _jsx(Route, { path: "population-data", element: _jsx(PopulationData, {}) }), _jsx(Route, { path: "edit-account", element: _jsx(EditAccount, {}) }), _jsx(Route, { path: "*", element: _jsx(NoPage, {}) })] }) }));
}
export default Container;
