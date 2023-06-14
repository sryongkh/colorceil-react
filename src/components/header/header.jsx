// import React from "react";
// import ReactDOM from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

import "./header.css";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <>
      <div id="nav-menu" className="sticky top-0 z-50 bg-white">
        <div className="w-full h-12 text-md lg:h-24 lg:text-xl flex flex-col  lg:flex-row font-bold border-b-4 border-black bg-white">
          <div id="left-menu" className="flex flex-col lg:flex-row">
            <Link
              id="logo"
              to="/"
              className="lg:w-48 h-full py-3 lg:py-0 flex justify-center items-center lg:border-r-4 border-black"
            >
              <p>
                COLOR<span>ceil</span>
              </p>
            </Link>
            <button
              id="palettes"
              className="lg:w-48 h-full py-3 lg:py-0 flex justify-center items-center lg:border-r-4 border-black"
            >
              Palettes
            </button>

            <button
              id="colors"
              className="lg:w-48 h-full py-3 lg:py-0 flex justify-center items-center lg:border-r-4 border-black"
            >
              Color
            </button>
          </div>

          <div
            id="center-menu"
            className="w-full lg:w-3/6 lg:h-full lg:mt-0 py-3 lg:py-0 flex justify-center items-center bg-white"
          >
            <div
              id="search-box"
              className="w-full h-10 lg:h-14 mx-2 lg:mx-10 flex items-center rounded-xl border-2 lg:border-4 border-solid border-black bg-white"
            >
              <input
                type="text"
                className="w-11/12 ml-5 bg-transparent outline-none"
                placeholder="Search"
              />
              <button
                id="search-btn"
                className="w-1/6 lg:w-1/12 h-full rounded-r-lg bg-black transition-colors duration-300 hover:bg-amber-500"
              >
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  id="magnifying"
                  size="lg"
                  className="text-white"
                />
              </button>
            </div>
          </div>

          <div
            id="right-menu"
            className="w-full lg:w-1/6 h-full py-3 lg:py-0 flex justify-center items-center bg-white"
          >
            <Link
              id="sign-up-btn"
              className="w-full lg:w-1/2 h-10 lg:h-14 mx-2 lg:mx-0 rounded-xl border-2 lg:border-4 border-solid border-black bg-amber-500 hover:text-amber-500 flex justify-center items-center "
              to="/signin"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
