import { BrowserRouter, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AssetsDebts from "./pages/AssetsDebts";

export default function App() {
  return (
    <>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Protected Routes - Main App */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Financial Overview Dashboard */}
            <Route index path="/" element={<Home />} />

            {/* Expenses Management */}
            <Route path="/expenses" element={<BasicTables />} />

            {/* Expense Timeline (Calendar) */}
            <Route path="/timeline" element={<Calendar />} />

            {/* Assets & Debts */}
            <Route path="/assets-debts" element={<AssetsDebts />} />

            {/* Profile & Income */}
            <Route path="/profile" element={<UserProfiles />} />

            {/* Blank page for future features */}
            <Route path="/blank" element={<Blank />} />
          </Route>

          {/* Public Auth Routes */}
          <Route path="/login" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Legacy route redirects */}
          <Route path="/signin" element={<SignIn />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
