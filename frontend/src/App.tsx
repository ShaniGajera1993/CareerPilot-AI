import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { CallToAction } from "./components/CallToAction";
import { Features } from "./components/Features";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { HowItWorks } from "./components/HowItWorks";
import { Navbar } from "./components/Navbar";
import { SocialProof } from "./components/SocialProof";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import "./App.css";

function App() {
  const [notice, setNotice] = useState("");
  const notify = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  };

  const landing = (
    <div className="landing-page">
      {notice && (
        <div className="toast" role="status">
          {notice}
        </div>
      )}
      <Navbar onAction={notify} />
      <main>
        <Hero onAction={notify} />
        <SocialProof />
        <Features />
        <HowItWorks />
        <CallToAction onAction={notify} />
      </main>
      <Footer />
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={landing} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
