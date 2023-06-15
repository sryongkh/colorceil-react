import { Link } from "react-router-dom";

import "./signin-page.css";

import google_icon from "../../../assets/img/google.png";
import github_icon from "../../../assets/img/github.png";

const SignInPage = () => {
  return (
    <>
      <div className="w-full flex justify-center items-start">
        <div className="w-full lg:w-1/4 h-11/12 mt-6 lg:mt-12 m-6">
          <p className="text-2xl lg:text-3xl font-bold uppercase">sign in</p>
          <div
            id="signin-box"
            className="px-2 lg:px-5 py-4 lg:py-8 lg:py-auto rounded-3xl border-2 lg:border-4 border-black"
          >
            <p className="mt-3 text-sm lg:text-base font-bold uppercase">
              e-mail
            </p>
            <div className="h-10 lg:h-14 px-4 rounded-lg border-2 lg:border-4 border-black  flex items-center shadow-input">
              <input
                type="text"
                className="lg:text-xl bg-transparent"
                placeholder="E-mail"
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
              />
            </div>
            <button className="w-full h-10 lg:h-14 lg:my-8 mt-6 uppercase font-bold rounded-lg border-2 lg:border-4 border-black bg-blue-500 shadow-input">
              sign in
            </button>
            <div className="my-4 text-center font-bold">
              <Link
                to="/forgotpassword"
                className="link uppercase hover:text-blue-500"
              >
                forgot password?
              </Link>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 lg:mt-12 text-center uppercase font-bold">
        Don&apos;t have an account?&nbsp;
        <Link to="/signup" className="link text-blue-500 hover:text-amber-500">
          sign up
        </Link>
      </p>
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

export default SignInPage;
