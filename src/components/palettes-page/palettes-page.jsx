import { Link } from "react-router-dom";

import "./palettes-page.css";
import PalettesExampleButton from "../main-page/palettes-example-btn/palettes-example-btn";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

const PalettesPage = () => {
  return (
    <>
      <div className="mt-56 px-44">
        <div
          id="search-box"
          className="w-full h-10 lg:h-14 flex items-center rounded-xl border-2 lg:border-4 border-solid border-black bg-white"
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
        <p className="mt-9 uppercase text-4xl text-left font-bold">
          Place to store your Colors Palettes
        </p>
        <p className="mt-4 flex items-center uppercase text-base text-left font-bold leading-none">
          Newest Colors palettes of Colorsceil. Brand colors codes, get colors
          inspiration. Choose colors palette Color palettes color, scheme and
          color combinations picked by users. Find HEX color codes for your next
          design project
        </p>
        <div className="w-full flex justify-end">
          <Link
            to="/generate-palettes"
            id="gen-palettes-btn"
            className="w-full lg:w-3/12 h-14 lg:mr-3 mt-4 mb-20 lg:my-4 font-bold capitalize border-black bg-fuchsia-400 hover:bg-black hover:text-amber-500 flex justify-center items-center"
          >
            generate palettes
          </Link>
        </div>
        <div className="w-full flex justify-end">
          <div
            id="frame-filter-btn"
            className="w-5/12 h-14 font-bold grid grid-cols-3 justify-center rounded-xl border-4 border-black"
          >
            <button className="filter-btn px-2 capitalize border-r-2 border-black hover:bg-slate-600 hover:rounded-l-lg">
              most viewed
            </button>
            <button className="filter-btn px-2 capitalize border-l-2 border-r-2 border-black hover:bg-slate-500">
              oldest
            </button>
            <button className="filter-btn px-2 capitalize border-l-2 border-black hover:bg-slate-400 hover:rounded-r-lg">
              newest
            </button>
          </div>
        </div>

        <div className="my-8 grid grid-cols-3 gap-2">
          <PalettesExampleButton />
          <PalettesExampleButton />
          <PalettesExampleButton />
          <PalettesExampleButton />
          <PalettesExampleButton />
          <PalettesExampleButton />
        </div>
      </div>
    </>
  );
};

export default PalettesPage;
