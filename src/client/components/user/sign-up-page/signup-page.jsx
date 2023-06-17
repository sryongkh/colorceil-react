import React from "react";
import { Link } from "react-router-dom";

import "./signup-page.css";

import { register } from "../../../api/auth";

import google_icon from "../../../assets/img/google.png";
import github_icon from "../../../assets/img/github.png";

const SignUpPage = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [passwordError, setPasswordError] = React.useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      console.log("PASSWORD NOT MATCH");
    } else {
      await register(email, password);
      console.log("REGISTER SUCCESS");
    }
  };

  return (
    <>
      <div className="w-full flex justify-center items-start">
        <div className="w-full lg:w-1/4 h-11/12 mt-6 lg:mt-24 m-6">
          <p className="text-2xl lg:text-3xl font-bold uppercase">sign up</p>

          <form
            onSubmit={handleRegister}
            id="signup-box"
            className="px-2 lg:px-5 py-4 lg:py-8 lg:py-auto
            rounded-3xl border-2 lg:border-4 border-black"
          >
            <p className="mt-3 text-sm lg:text-base font-bold uppercase">
              e-mail
            </p>
            <div className="h-10 lg:h-14 px-4 rounded-lg border-2 lg:border-4 border-black  flex items-center shadow-input">
              <input
                type="text"
                className="lg:text-xl bg-transparent"
                placeholder="E-mail"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <p className="mt-3 text-sm lg:text-base font-bold uppercase">
              password
            </p>
            <div className="h-10 lg:h-14 px-4 rounded-lg border-2 lg:border-4 border-black  flex items-center shadow-input">
              <input
                type="password"
                className="lg:text-xl bg-transparent"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <p className="mt-3 text-sm lg:text-base font-bold uppercase">
              re-password
            </p>
            <div className="h-10 lg:h-14 px-4 rounded-lg border-2 lg:border-4 border-black  flex items-center shadow-input">
              <input
                type="password"
                className="lg:text-xl bg-transparent"
                placeholder="Re-password"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {passwordError && <p>{passwordError}</p>}
            <button
              type="submit"
              className="w-full h-10 lg:h-14 lg:my-8 mt-6 uppercase font-bold rounded-lg border-2 lg:border-4 border-black bg-blue-500 shadow-input"
            >
              sign up
            </button>
            <div className="my-3 text-center font-bold">
              <Link
                to="/signin"
                className="uppercase text-blue-500 hover:text-amber-500"
              >
                sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
      <p className="mt-3 lg:mt-12 text-center uppercase font-bold">
        social login
      </p>
      <div className="mt-2 lg:mt-5 flex flex-row justify-center">
        <button className="alt-login-btn w-12 h-12 mx-4 rounded-full bg-amber-500 border-black flex items-center justify-center">
          <img src={google_icon} className="w-8 h-8" />
        </button>
        <button className="alt-login-btn w-12 h-12 mx-4 rounded-full bg-amber-500 border-black flex items-center justify-center">
          <img src={github_icon} className="w-8 h-8" />
        </button>
      </div>
    </>
  );
};

export default SignUpPage;
