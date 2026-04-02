import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { pagesConfig } from './pages.config';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/components/AuthContext';
import { CartProvider } from '@/components/CartContext';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Checkout from '@/pages/Checkout';
import CheckoutSuccess from '@/pages/CheckoutSuccess';
import CheckoutCancel from '@/pages/CheckoutCancel';
import NotFound from '@/pages/NotFound';
import LexChatbot from '@/components/common/LexChatbot';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) =>
  Layout ? <Layout currentPageName={currentPageName}>{children}</Layout> : <>{children}</>;

/**
 * ChatbotWrapper reads auth state and passes isAuthenticated to LexChatbot.
 * It must live inside <AuthProvider> so useAuth() works.
 * We do NOT render the chatbot on Admin, Login, or Signup pages.
 */
function ChatbotWrapper() {
  const { isAuthenticated } = useAuth();
  return <LexChatbot isAuthenticated={isAuthenticated} />;
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <Routes>
              {/* Auth pages — no chatbot overlay needed but it still renders harmlessly */}
              <Route path="/login"  element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Checkout flow */}
              <Route path="/checkout" element={<Checkout />} />
              <Route
                path="/CheckoutSuccess"
                element={
                  <LayoutWrapper currentPageName="CheckoutSuccess">
                    <CheckoutSuccess />
                  </LayoutWrapper>
                }
              />
              <Route
                path="/CheckoutCancel"
                element={
                  <LayoutWrapper currentPageName="CheckoutCancel">
                    <CheckoutCancel />
                  </LayoutWrapper>
                }
              />

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

            {/* Global chatbot — rendered outside <Routes> so it persists across navigation */}
            <ChatbotWrapper />
          </Router>

          <Toaster />
        </QueryClientProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
