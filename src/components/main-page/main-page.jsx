import "./main-page.css";

import PalettesExampleButton from "./palettes-example-btn/palettes-example-btn";
import PopularHashtag from "./popular-hashtag-bar/popular-hashtag-bar";

import palette1 from "../../assets/img/image_1.png";
import palette2 from "../../assets/img/image_2.png";
import palette3 from "../../assets/img/image_3.png";

const MainPage = () => {
  function goto(id) {
    const element = document.querySelector(id);
    element.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <main>
      <div>
        <p className="text-4xl lg:text-8xl font-bold mt-36 uppercase text-center">
          Place to store your
          <br />
          Colors Palettes
        </p>
        <p className="text-2xl lg:text-4xl font-bold uppercase text-center">
          Create the colour palette rapidly and get inspired by
          <br />
          thousands new color palettes added daily
        </p>
      </div>
      <div
        id="btn-tab"
        className="w-full flex flex-col lg:flex-row justify-center font-bold text-xl mt-14"
      >
        <button
          id="view-palettes-btn"
          className="lg:w-2/12 mx-2 lg:mr-3 h-14 capitalize rounded-lg border-4 border-black bg-blue-700 hover:bg-black hover:text-white"
        >
          view palettes
        </button>
        <button
          id="how-to-btn"
          className="lg:w-2/12 mt-6 lg:mt-0 mx-2 lg:ml-3 h-14 capitalize rounded-lg border-4 border-black bg-white hover:bg-black hover:text-white"
          onClick={() => goto("#how-to-use")}
        >
          how to use?
        </button>
      </div>
      <div className="lg:w-3/4 m-6 lg:mx-auto lg:mt-24 text-center row lg:grid lg:grid-cols-3 items-center gap-7">
        <PalettesExampleButton />
        <PalettesExampleButton />
        <PalettesExampleButton />
        <PalettesExampleButton />
        <PalettesExampleButton />
        <PalettesExampleButton />
        <PalettesExampleButton />
        <PalettesExampleButton />
        <PalettesExampleButton />
      </div>
      <div className="mt-24 flex justify-center font-bold text-xl">
        <button
          id="view-more-btn"
          className="w-full lg:w-1/12 mx-2 h-14 capitalize border-black bg-white"
        >
          view more
        </button>
      </div>
      <div id="how-to-use"></div>
      <div className="w-full h-full mt-64">
        <div className="flex flex-col lg:flex-row justify-center">
          <div className="flex flex-col justify-between h-full">
            <p className="mt-11 text-6xl font-bold uppercase text-center">
              how to use?
            </p>
            <div className="mt-12">
              <ul className="text-3xl font-bold list-disc uppercase">
                <li>sign in Colorsceil.com</li>
                <li>
                  Customize colors in
                  <br />
                  palette
                </li>
                <li>
                  Populate Name and Save
                  <br />
                  new palette
                </li>
                <li>
                  More details in help
                  <br />
                  palette
                </li>
              </ul>
            </div>
            <button
              id="gen-palettes-btn"
              className="h-14 w-full lg:w-2/3 mr-3 my-4 font-bold capitalize border-black bg-fuchsia-400 hover:bg-black hover:text-amber-500"
            >
              generate palettes
            </button>
          </div>
          <div className="flex justify-center items-center">
            <div
              id="color-palettes-show"
              className="lg:w-96 w-96 lg:h-96 lg:mx-20 h-96 grid grid-cols-5"
            >
              <div className="bg-red-400 border-2 border-black" />
              <div className="bg-orange-400 border-2 border-black" />
              <div className="bg-yellow-400 border-2 border-black" />
              <div className="bg-green-400 border-2 border-black" />
              <div className="bg-blue-400 border-2 border-black" />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-44">
        <div className="w-full h-full mt-44">
          <p className="mt-11 text-6xl font-bold uppercase text-center">
            popular palettes collections
          </p>
          <div
            id="img-palettes"
            className="w-full mt-8 flex flex-col lg:flex-row justify-center items-center"
          >
            <img src={palette1} alt="" className="w-80 mx-2 md:grid" />
            <img src={palette2} alt="" className="w-80 mx-2 md:grid" />
            <img src={palette3} alt="" className="w-80 mx-2 md:grid" />
          </div>
        </div>
        <div className="mt-16 flex justify-center font-bold text-xl">
          <button
            id="view-more-btn"
            className="w-1/12 mr-3 h-14 capitalize border-black bg-white"
          >
            view more
          </button>
        </div>
      </div>
      <div className="mt-36 text-center">
        <p className="mt-11 mb-16 text-6xl font-bold uppercase">
          popular hashtags
        </p>
        <PopularHashtag />
      </div>
    </main>
  );
};
export default MainPage;
