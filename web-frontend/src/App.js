import { jsx as _jsx } from "react/jsx-runtime";
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Entrance from './screens/Entrance';
const queryClient = new QueryClient();
const App = () => {
    return (_jsx("div", { className: 'flex h-full w-full', children: _jsx(AuthProvider, { children: _jsx(BrowserRouter, { children: _jsx(QueryClientProvider, { client: queryClient, children: _jsx(Entrance, {}) }) }) }) }));
};
export default App;
