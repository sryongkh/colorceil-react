import React from "react";

import "./palettes-example-btn.css";

import PaletteSelectedPage from "../modal-palettes-selected/modal-palettes-selected";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faEye, faPlus } from "@fortawesome/free-solid-svg-icons";

const PalettesExampleButton = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        id="color-palettes-example"
        className="h-36 mb-4 bg-black bg-opacity-50"
      >
        <div className="h-3/5 grid grid-cols-5">
          <div className="bg-blue-400" />
          <div className="bg-green-400" />
          <div className="bg-yellow-400" />
          <div className="bg-orange-400" />
          <div className="bg-red-500" />
        </div>
        <div className="w-full h-2/5 flex justify-between items-center text-white">
          <div className="mx-4">
            <p className="text-sm lg:font-bold text-start">
              Rainbow colors palette
            </p>
          </div>
          <div className="mx-4 flex items-center">
            <FontAwesomeIcon icon={faEye} />
            <p className="mx-1 text-sm lg:font-bold text-start">Test</p>
            <FontAwesomeIcon icon={faCopy} className="mx-1 cursor-pointer" />
            <FontAwesomeIcon icon={faPlus} className="mx-1 cursor-pointer" />
          </div>
        </div>
      </button>
      <PaletteSelectedPage isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
};

export default PalettesExampleButton;
