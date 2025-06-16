
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { CommunicationsProvider } from "./contexts/CommunicationsContext";
import AuthGuard from "./components/AuthGuard";
import Layout from "./components/Layout";
import Welcome from "./components/Welcome";
import Home from "./pages/Home";
import Order from "./pages/Order";
import Cart from "./pages/Cart";
import Chat from "./pages/Chat";
import Menu from "./pages/Menu";
import Checkout from "./pages/Checkout";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancelled from "./pages/PaymentCancelled";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CommunicationsProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/welcome" element={<Welcome />} />
                <Route 
                  path="/auth" 
                  element={
                    <AuthGuard requireAuth={false}>
                      <Auth />
                    </AuthGuard>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <AuthGuard>
                      <Profile />
                    </AuthGuard>
                  } 
                />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/payment-cancelled" element={<PaymentCancelled />} />
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route 
                    path="/order" 
                    element={
                      <AuthGuard>
                        <Order />
                      </AuthGuard>
                    } 
                  />
                  <Route path="/cart" element={<Cart />} />
                  <Route 
                    path="/chat" 
                    element={
                      <AuthGuard>
                        <Chat />
                      </AuthGuard>
                    } 
                  />
                  <Route path="/menu" element={<Menu />} />
                  <Route 
                    path="/checkout" 
                    element={
                      <AuthGuard>
                        <Checkout />
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/orders" 
                    element={
                      <AuthGuard>
                        <Orders />
                      </AuthGuard>
                    } 
                  />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </CommunicationsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
