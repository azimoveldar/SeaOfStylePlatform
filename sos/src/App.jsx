import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { pagesConfig } from './pages.config';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/components/AuthContext';
import { CartProvider } from '@/components/CartContext';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Checkout from '@/pages/Checkout';
import NotFound from '@/pages/NotFound';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) =>
  Layout ? <Layout currentPageName={currentPageName}>{children}</Layout> : <>{children}</>;

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <Routes>
              ...
              <Route path="/checkout" element={<Checkout />} />
              ...
            </Routes>
          </Router>
          <Toaster />
        </QueryClientProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
