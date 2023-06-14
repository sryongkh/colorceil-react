import { Link } from "react-router-dom";

import "./signup-page.css";

import google_icon from "../../../assets/img/google.png";
import github_icon from "../../../assets/img/github.png";

const SignUpPage = () => {
  return (
    <>
      <div className="w-full flex justify-center items-start">
        <div className="w-1/4 h-11/12 mt-12">
          <p className="text-3xl font-bold uppercase">sign up</p>
          <div
            id="signup-box"
            className="px-5 py-8 py-auto rounded-3xl border-4 border-black"
          >
            <p className="mt-3 text-base font-bold uppercase">e-mail</p>
            <div className="h-14 px-4 rounded-lg border-4 border-black  flex items-center shadow-input">
              <input
                type="text"
                className="text-xl bg-transparent"
                placeholder="E-mail"
              />
            </div>
            <p className="mt-3 text-base font-bold uppercase">password</p>
            <div className="h-14 px-4 rounded-lg border-4 border-black  flex items-center shadow-input">
              <input
                type="password"
                className="text-xl bg-transparent"
                placeholder="Password"
              />
            </div>
            <p className="mt-3 text-base font-bold uppercase">re-password</p>
            <div className="h-14 px-4 rounded-lg border-4 border-black  flex items-center shadow-input">
              <input
                type="password"
                className="text-xl bg-transparent"
                placeholder="Re-password"
              />
            </div>
            <button className="w-full h-14 my-8 uppercase font-bold rounded-lg border-4 border-black bg-blue-500 shadow-input">
              sign up
            </button>
            <div className="text-center font-bold">
              <Link
                to="/signin"
                className="link uppercase text-blue-500 hover:text-amber-500"
              >
                sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-12 text-center uppercase font-bold">social login</p>
      <div className="mt-5 flex flex-row justify-center">
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
