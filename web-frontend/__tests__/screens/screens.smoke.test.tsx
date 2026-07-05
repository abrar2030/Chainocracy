import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

// Heavy or network-bound dependencies are mocked so these smoke tests verify
// that each screen mounts and wires its pieces together, without hitting the
// network, audio, or map layers.

vi.mock("axios", () => {
  const instance = {
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn().mockResolvedValue({ data: {} }),
    put: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    defaults: { headers: { common: {} } },
  };
  return {
    default: { ...instance, create: vi.fn(() => instance) },
  };
});

vi.mock("@/context/AuthContext", () => ({
  API_URL: "http://localhost:3010",
  useAuth: () => ({
    authState: {
      authenticated: true,
      name: "Ada",
      username: "ada",
      role: "admin",
    },
    onLogin: vi.fn(),
    onLogOut: vi.fn(),
    isLoggedIn: vi.fn(),
    dateRange: { from: new Date(), to: new Date() },
    setDateRange: vi.fn(),
    mapData: [],
    setMapData: vi.fn(),
    partiesData: [],
    setPartiesData: vi.fn(),
    provinces: ["Luanda", "Bengo"],
    topVotesPerProvinces: [],
    setTopVotesPerProvinces: vi.fn(),
    imageList: {},
    setImageList: vi.fn(),
    updateImages: vi.fn(),
  }),
}));

vi.mock("@/services/firebase", () => ({
  loadImages: vi.fn(),
  useFirebaseStorage: () => ({ items: [], loading: false, error: null }),
  uploadImage: vi.fn(),
}));

vi.mock("@/services/speeches", () => ({
  default: vi.fn(),
  getSpeech: vi.fn().mockResolvedValue(null),
}));

import AnnounceElection from "@/screens/AnnounceElection";
import Blockchain from "@/screens/Blockchain";
import BlockchainDetails from "@/screens/BlockchainDetails";
import Candidates from "@/screens/Candidates";
import EditAccount from "@/screens/EditAccount";
import ElectionResults from "@/screens/ElectionResults";
import NoPage from "@/screens/NoPage";
import PopulationData from "@/screens/PopulationData";
import PublicAnnouncement from "@/screens/PublicAnnouncement";
import Users from "@/screens/Users";
import Voters from "@/screens/Voters";

const withProviders = (ui: ReactElement, path = "/") => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <MemoryRouter initialEntries={[path]}>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/blockchain/block-details/:id" element={ui} />
          <Route path="*" element={ui} />
        </Routes>
      </QueryClientProvider>
    </MemoryRouter>,
  );
};

describe("feature screens mount without crashing", () => {
  it("NoPage", () => {
    expect(() => withProviders(<NoPage />)).not.toThrow();
  });
  it("Candidates", () => {
    expect(() => withProviders(<Candidates />)).not.toThrow();
  });
  it("Voters", () => {
    expect(() => withProviders(<Voters />)).not.toThrow();
  });
  it("Users", () => {
    expect(() => withProviders(<Users />)).not.toThrow();
  });
  it("Blockchain", () => {
    expect(() => withProviders(<Blockchain />)).not.toThrow();
  });
  it("BlockchainDetails", () => {
    expect(() =>
      withProviders(<BlockchainDetails />, "/blockchain/block-details/1"),
    ).not.toThrow();
  });
  it("ElectionResults", () => {
    expect(() => withProviders(<ElectionResults />)).not.toThrow();
  });
  it("AnnounceElection", () => {
    expect(() => withProviders(<AnnounceElection />)).not.toThrow();
  });
  it("PublicAnnouncement", () => {
    expect(() => withProviders(<PublicAnnouncement />)).not.toThrow();
  });
  it("PopulationData", () => {
    expect(() => withProviders(<PopulationData />)).not.toThrow();
  });
  it("EditAccount", () => {
    expect(() => withProviders(<EditAccount />)).not.toThrow();
  });
});
