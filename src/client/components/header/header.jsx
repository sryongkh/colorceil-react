import React from "react";
// import ReactDOM from "react-dom";
import { Link } from "react-router-dom";

import Banner from "./banner/banner";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

import "./header.css";

const Header = () => {
  const [isMobile, setIsMobile] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const checkIfMobile = () => {
      if (window.innerWidth < 1024) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };

    window.addEventListener("resize", checkIfMobile);
    checkIfMobile();

    // Cleanup the event listener
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  return (
    <>
      <div id="nav-menu" className="sticky top-0 bg-white">
        {isMobile ? (
          <>
            <div className="p-3 flex justify-between items-center">
              <Link id="logo" to="/">
                <p className="font-bold text-xl flex justify-center">
                  COLOR<span>ceil</span>
                </p>
              </Link>
              <div>
                <FontAwesomeIcon
                  icon={faBars}
                  size="2x"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center"
                />
              </div>
            </div>

            {isMenuOpen && (
              <div className="absolute top-14 w-full z-50 bg-red-500 text-base text-white font-bold flex flex-col">
                <div className="w-full h-16 flex justify-center items-center">
                  Palettes
                </div>
                <div className="w-full h-16 flex justify-center items-center">
                  Colors
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-12 text-md lg:h-24 lg:text-xl flex flex-col lg:flex-row font-bold border-b-4 border-black bg-white">
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
              <div className="h-full">
                <button
                  id="palettes"
                  className="w-full lg:w-48 h-12 lg:h-full peer px-5 py-2 bg-white hover:bg-black text-black hover:text-white lg:border-r-4 border-black"
                >
                  Palettes
                </button>

                <div
                  id="hover-menu"
                  className="hidden lg:peer-hover:flex lg:hover:flex lg:w-48 lg:flex-col lg:bg-black lg:text-white lg:drop-shadow-lg lg:duration-300"
                >
                  <a
                    className="hover-menu px-5 py-3 hover:bg-white hover:text-black"
                    href="#"
                  >
                    Color Tools
                  </a>
                  <a
                    className="hover-menu px-5 py-3 hover:bg-white hover:text-black"
                    href="#"
                  >
                    Top colors
                  </a>
                  <a
                    className="hover-menu px-5 py-3 hover:bg-white hover:text-black"
                    href="#"
                  >
                    Colors Codes
                  </a>
                </div>
              </div>

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
                <Link
                  to="search-palettes"
                  id="search-btn"
                  className="w-1/6 lg:w-1/12 h-full rounded-r-lg bg-black transition-colors duration-300 hover:bg-amber-500 flex justify-center items-center"
                >
                  <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    id="magnifying"
                    size="lg"
                    className="text-white"
                  />
                </Link>
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
        )}
      </div>
      <Banner />
    </>
  );
};

export default Header;
