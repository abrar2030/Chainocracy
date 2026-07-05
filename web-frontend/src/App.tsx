import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedLayout from "./components/routing/ProtectedLayout";
import { AuthProvider } from "./context/AuthContext";
import DashboardHome from "./pages/DashboardHome";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import AnnounceElection from "./screens/AnnounceElection";
import Blockchain from "./screens/Blockchain";
import BlockchainDetails from "./screens/BlockchainDetails";
import Candidates from "./screens/Candidates";
import EditAccount from "./screens/EditAccount";
import ElectionResults from "./screens/ElectionResults";
import NoPage from "./screens/NoPage";
import PopulationData from "./screens/PopulationData";
import PublicAnnouncement from "./screens/PublicAnnouncement";
import Users from "./screens/Users";
import Voters from "./screens/Voters";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />

              {/* Authenticated (modern shell wraps the existing feature screens) */}
              <Route element={<ProtectedLayout />}>
                <Route path="/dashboard" element={<DashboardHome />} />
                <Route path="/candidates" element={<Candidates />} />
                <Route path="/voters" element={<Voters />} />
                <Route path="/blockchain" element={<Blockchain />} />
                <Route
                  path="/blockchain/block-details/:id"
                  element={<BlockchainDetails />}
                />
                <Route path="/election-results" element={<ElectionResults />} />
                <Route
                  path="/announce-election"
                  element={<AnnounceElection />}
                />
                <Route
                  path="/public-announcement"
                  element={<PublicAnnouncement />}
                />
                <Route path="/user" element={<Users />} />
                <Route path="/population-data" element={<PopulationData />} />
                <Route path="/edit-account" element={<EditAccount />} />
              </Route>

              <Route path="*" element={<NoPage />} />
            </Routes>
          </QueryClientProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
