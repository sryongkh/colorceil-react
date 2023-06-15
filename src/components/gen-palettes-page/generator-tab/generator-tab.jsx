import React from "react";

import "./generate-tab.css";
import "toolcool-range-slider";

const GeneratorTab = () => {
  const [red, setRed] = React.useState(0);
  const [green, setGreen] = React.useState(0);
  const [blue, setBlue] = React.useState(0);

  const redSliderRef = React.useRef(null);
  const greenSliderRef = React.useRef(null);
  const blueSliderRef = React.useRef(null);

  React.useEffect(() => {
    const redSlider = redSliderRef.current;
    const greenSlider = greenSliderRef.current;
    const blueSlider = blueSliderRef.current;

    const onChangeRed = (evt) => {
      const redValue = evt.detail.value;
      setRed(redValue);
    };

    const onChangeGreen = (evt) => {
      const greenValue = evt.detail.value;
      setGreen(greenValue);
    };

    const onChangeBlue = (evt) => {
      const blueValue = evt.detail.value;
      setBlue(blueValue);
    };

    redSlider?.addEventListener("change", onChangeRed);
    greenSlider?.addEventListener("change", onChangeGreen);
    blueSlider?.addEventListener("change", onChangeBlue);

    return () => {
      redSlider?.removeEventListener("change", onChangeRed);
      greenSlider?.removeEventListener("change", onChangeGreen);
      blueSlider?.removeEventListener("change", onChangeBlue);
    };
  }, []);

  return (
    <>
      <div
        id="hex-box"
        className="relative top-7 lg:w-2/12 h-12 lg:h-14 mt-14 mx-10 lg:mx-auto border-2 lg:border-4 border-black rounded-xl flex justify-center items-center bg-white font-bold"
      >
        <p className="w-full uppercase text-center">#FFB443</p>
      </div>
      <div
        id="generator-box"
        className="w-full h-60 lg:h-48 px-5 lg:px-40 border-t-2 lg:border-t-4 border-black grid lg:grid-cols-3 lg:items-center text-black"
      >
        <div className="flex flex-col lg:px-5">
          <div className="mt-10 lg:mt-0 flex flex-row place-content-between items-center">
            <p className="lg:text-lg font-bold">Red</p>
            <input
              type="number"
              value={red}
              onChange={(e) => setRed(e.target.value)}
              className="w-12 lg:w-20 py-2 lg:h-12 bg-black lg:text-lg font-bold text-white text-center rounded-md lg:rounded-xl outline-none"
            />
          </div>
          <div className="flex justify-center mt-4">
            <toolcool-range-slider
              slider-bg="var(--yellow)"
              slider-bg-fill="black"
              pointer-bg="black"
              pointer-bg-hover="black"
              pointer-bg-focus="black"
              pointer-border="black"
              pointer-border-hover="black"
              pointer-border-focus="black"
              pointer-width="23px"
              pointer-height="23px"
              slider-height="6px;"
              slider-width="334px"
              min="0"
              max="255"
              round="0"
              value={red}
              ref={redSliderRef}
            />
          </div>
        </div>
        <div className="flex flex-col lg:px-5">
          <div className="flex flex-row place-content-between items-center">
            <p className="lg:text-lg font-bold">Green</p>
            <input
              type="text"
              value={green}
              onChange={(e) => setGreen(e.target.value)}
              className="w-12 lg:w-20 py-2 lg:h-12 bg-black lg:text-lg font-bold text-white text-center rounded-md lg:rounded-xl outline-none"
            />
          </div>
          <div className="flex justify-center mt-4">
            <toolcool-range-slider
              slider-bg="var(--yellow)"
              slider-bg-fill="black"
              pointer-bg="black"
              pointer-bg-hover="black"
              pointer-bg-focus="black"
              pointer-border="black"
              pointer-border-hover="black"
              pointer-border-focus="black"
              pointer-width="23px"
              pointer-height="23px"
              slider-height="6px;"
              slider-width="334px"
              min="0"
              max="255"
              round="0"
              value={green}
              ref={greenSliderRef}
            />
          </div>
        </div>
        <div className="flex flex-col lg:px-5">
          <div className="flex flex-row place-content-between items-center">
            <p className="lg:text-lg font-bold">Blue</p>
            <input
              type="text"
              value={blue}
              onChange={(e) => setBlue(e.target.value)}
              className="w-12 lg:w-20 py-2 lg:h-12 bg-black lg:text-lg font-bold text-white text-center rounded-md lg:rounded-xl outline-none"
            />
          </div>
          <div className="flex justify-center mt-4">
            <toolcool-range-slider
              slider-bg="var(--yellow)"
              slider-bg-fill="black"
              pointer-bg="black"
              pointer-bg-hover="black"
              pointer-bg-focus="black"
              pointer-border="black"
              pointer-border-hover="black"
              pointer-border-focus="black"
              pointer-width="23px"
              pointer-height="23px"
              slider-height="6px;"
              slider-width="334px"
              min="0"
              max="255"
              round="0"
              value={blue}
              ref={blueSliderRef}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default GeneratorTab;
