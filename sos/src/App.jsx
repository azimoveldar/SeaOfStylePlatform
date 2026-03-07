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
import CheckoutSuccess from '@/pages/CheckoutSuccess';
import CheckoutCancel from '@/pages/CheckoutCancel';
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
              {/* Auth */}
              <Route path="/login"  element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Checkout flow */}
              <Route path="/checkout"         element={<Checkout />} />
              {/*
                Stripe success_url must match exactly what your Lambda sets.
                Lambda should set: success_url = "https://yourdomain.com/CheckoutSuccess?session_id={CHECKOUT_SESSION_ID}"
                That ?session_id param lands here and CheckoutSuccess reads it.
              */}
              <Route path="/CheckoutSuccess"  element={<LayoutWrapper currentPageName="CheckoutSuccess"><CheckoutSuccess /></LayoutWrapper>} />
              <Route path="/CheckoutCancel"   element={<LayoutWrapper currentPageName="CheckoutCancel"><CheckoutCancel /></LayoutWrapper>} />

              {/* Main landing page */}
              <Route
                path="/"
                element={
                  <LayoutWrapper currentPageName={mainPageKey}>
                    <MainPage />
                  </LayoutWrapper>
                }
              />

              {/* All other pages from config */}
              {Object.entries(Pages).map(([path, Page]) => (
                <Route
                  key={path}
                  path={`/${path}`}
                  element={
                    <LayoutWrapper currentPageName={path}>
                      <Page />
                    </LayoutWrapper>
                  }
                />
              ))}

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster />
        </QueryClientProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
