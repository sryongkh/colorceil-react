// import React from "react";
// import ReactDOM from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

import "./header.css";

const Header = () => {
  return (
    <>
      <div
        id="nav-menu"
        className="w-full h-24 text-xl flex font-bold border-b-4 border-black bg-white sticky top-0 z-50"
      >
        <div id="left-menu" className="w-2/6 flex">
          <button
            id="logo"
            className="w-48 h-full flex place-items-center justify-center border-r-4 border-black"
          >
            <p>
              COLOR<span>ceil</span>
            </p>
          </button>
          <button
            id="palettes"
            className="w-48 h-full grid place-items-center border-r-4 border-black"
          >
            Palettes
          </button>
          <button
            id="colors"
            className="w-48 h-full grid place-items-center border-r-4 border-black"
          >
            Color
          </button>
        </div>

        <div id="center-menu" className="w-3/6 h-full grid place-items-center">
          <div
            id="search-box"
            className="w-full h-14 flex items-center rounded-xl border-4 border-solid border-black"
          >
            <input
              type="text"
              className="w-11/12 ml-5 bg-transparent outline-none"
              placeholder="Search"
            />
            <button
              id="search-btn"
              className="w-1/12 h-full rounded-r-lg bg-black transition-colors duration-300 hover:bg-amber-500"
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

        <div id="right-menu" className="w-1/6 h-full grid place-items-center">
          <button
            id="sign-up-btn"
            className="h-14 m-5 px-10 rounded-xl border-4 border-solid border-black bg-amber-500 hover:text-amber-500"
          >
            Sign Up
          </button>
        </div>
      </div>
    </>
  );
};

export default Header;
