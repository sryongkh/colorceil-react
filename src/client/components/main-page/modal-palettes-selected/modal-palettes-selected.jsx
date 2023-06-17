import PropTypes from "prop-types";

import "./modal-palettes-selected.css";
import ColorsBox from "./color-box/color-box";

import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Backdrop from "@mui/material/Backdrop";
import Fade from "@mui/material/Fade";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "1065px",
  height: "850px",
  bgcolor: "background.paper",
  borderRadius: "30px",
  boxShadow: 24,
  p: 4,
  overflowY: "scroll",
};

const PaletteSelectedPage = ({ isOpen, onClose }) => {
  return (
    <>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={isOpen}
        onClose={onClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={isOpen}>
          <Box sx={style}>
            <div className="px-24 py-16">
              <div className="grid grid-cols-5 gap-6">
                <ColorsBox />
                <ColorsBox />
                <ColorsBox />
                <ColorsBox />
                <ColorsBox />
              </div>
              <div className="mt-16">
                <p className="text-2xl font-bold uppercase">
                  colors description
                </p>
              </div>
              <div className="mt-16">
                <p className="text-2xl font-bold uppercase">
                  colors description
                </p>
              </div>
              <div className="mt-16">
                <p className="text-2xl font-bold uppercase">
                  colors description
                </p>
              </div>
              <div className="mt-16">
                <p className="text-2xl font-bold uppercase">
                  colors description
                </p>
              </div>
            </div>
          </Box>
        </Fade>
      </Modal>
    </>
  );
};

PaletteSelectedPage.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PaletteSelectedPage;
