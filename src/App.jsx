// import { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";

import Header from "./components/header/header";
import Banner from "./components/banner/banner";
import MainPage from "./components/main-page/main-page";
import SignInPage from "./components/user/sign-in-page/signin-page";
import SignUpPage from "./components/user/sign-up-page/signup-page";
import FogotPasswordPage from "./components/user/forgot-pass-page/forgot-pass-page";
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
  const pathsWithoutFooter = ["/signin", "/signup", "/forgotpassword"];

  return (
    <>
      <Header />
      {location.pathname !== "/" && <Banner />}
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="signin" element={<SignInPage />} />
        <Route path="signup" element={<SignUpPage />} />
        <Route path="forgotpassword" element={<FogotPasswordPage />} />
        {/* <Route path="*" element={<NoPage />} /> */}
      </Routes>
      {!pathsWithoutFooter.includes(location.pathname) && <Footer />}
    </>
  );
}

export default App;
