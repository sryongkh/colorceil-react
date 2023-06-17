// import { Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

const SearchPalettesPage = () => {
  return (
    <>
      <div className="mt-44 px-44">
        <div className="mt-9 text-4xl text-left font-bold flex">
          <p className="capitalize">Search for</p>&nbsp;&quot;<span>test</span>
          &quot;
        </div>

        <div
          id="search-box"
          className="w-full h-10 lg:h-14 mt-9 flex items-center rounded-xl border-2 lg:border-4 border-solid border-black bg-white"
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

        <div className="w-full mt-9 flex justify-end items-center">
          <p className="mr-4 text-sm font-bold">Sort by</p>
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

        <div className="mt-8 mb-40 grid grid-cols-3 gap-2">
          <p className="text-xl font-bold text-gray-400">
            Results not found, please try again
          </p>
        </div>
      </div>
    </>
  );
};

export default SearchPalettesPage;
