import "./main-page.css";

const MainPage = () => {
  return (
    <>
      <div>
        <p className="text-8xl font-bold mt-36 uppercase text-center">
          Place to store your
          <br />
          Colors Palettes
        </p>
        <p className="text-4xl font-bold uppercase text-center">
          Create the colour palette rapidly and get inspired by
          <br />
          thousands new color palettes added daily
        </p>
      </div>
      <div
        id="btn-tab"
        className="w-full flex justify-center font-bold text-xl mt-14"
      >
        <button className="w-2/12 mr-3 h-14 capitalize rounded-lg border-4 border-black bg-blue-700">
          view palettes
        </button>
        <button className="w-2/12 ml-3 h-14 capitalize rounded-lg border-4 border-black bg-white">
          how to use?
        </button>
      </div>
    </>
  );
};
export default MainPage;
