import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { AuthProvider } from "./context/AuthContext";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";

import Home from "./pages/Home";
import { CategoriesIndex, CategoryDetail } from "./pages/Category";
import { TechnologyIndex, TechnologyDetail } from "./pages/Technology";
import { Privacy, Terms, Guidelines } from "./pages/Legal";

const Discover = lazy(() => import("./pages/Discover"));
const Search = lazy(() => import("./pages/Search"));
const Trending = lazy(() => import("./pages/Trending"));
const Developers = lazy(() => import("./pages/Developers"));
const DeveloperProfile = lazy(() => import("./pages/DeveloperProfile"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const ProductForm = lazy(() => import("./pages/ProductForm"));
const ProductLaunched = lazy(() => import("./pages/ProductLaunched"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Saved = lazy(() => import("./pages/Saved"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="animate-spin text-brand-purple" size={28} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" toastOptions={{ style: { fontSize: "14px", borderRadius: "12px" } }} />
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/search" element={<Search />} />
              <Route path="/trending" element={<Trending />} />
              <Route path="/categories" element={<CategoriesIndex />} />
              <Route path="/category/:name" element={<CategoryDetail />} />
              <Route path="/technology" element={<TechnologyIndex />} />
              <Route path="/technology/:name" element={<TechnologyDetail />} />
              <Route path="/developers" element={<Developers />} />
              <Route path="/developer/:username" element={<DeveloperProfile />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/product/:slug/launched" element={<ProductLaunched />} />

              <Route path="/product/new" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
              <Route path="/product/:id/edit" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/saved" element={<ProtectedRoute><Saved /></ProtectedRoute>} />

              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              <Route path="/legal/privacy" element={<Privacy />} />
              <Route path="/legal/terms" element={<Terms />} />
              <Route path="/legal/guidelines" element={<Guidelines />} />

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
