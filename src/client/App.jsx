// import { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";

import Header from "./components/header/header";
import MainPage from "./components/main-page/main-page";
import SignInPage from "./components/user/sign-in-page/signin-page";
import SignUpPage from "./components/user/sign-up-page/signup-page";
import FogotPasswordPage from "./components/user/forgot-pass-page/forgot-pass-page";
import GeneratePalettesPage from "./components/gen-palettes-page/gen-palettes-page";
import PalettesPage from "./components/palettes-page/palettes-page";
import SearchPalettesPage from "./components/search-palettes-page/search-palettes-page";
import Footer from "./components/footer/footer";

function App() {
  return (
    <BrowserRouter>
      <ContentWithFooter />
    </BrowserRouter>
  );
}

function ContentWithFooter() {
  const location = useLocation();
  const pathsWithoutFooter = [
    "/signin",
    "/signup",
    "/forgotpassword",
    "/generate-palettes",
  ];

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="signin" element={<SignInPage />} />
        <Route path="signup" element={<SignUpPage />} />
        <Route path="forgotpassword" element={<FogotPasswordPage />} />
        <Route path="generate-palettes" element={<GeneratePalettesPage />} />
        <Route path="palettes" element={<PalettesPage />} />
        <Route path="search-palettes" element={<SearchPalettesPage />} />
        {/* <Route path="*" element={<NoPage />} /> */}
      </Routes>
      {!pathsWithoutFooter.includes(location.pathname) && <Footer />}
    </>
  );
}

export default App;
