import { Link } from "react-router-dom";

const Banner = () => {
  return (
    <>
      <div
        className="fixed top-18 w-full h-16 font-bold text-center bg-black flex justify-center items-center"
        style={{ zIndex: 98 }}
      >
        <p className="text-white">
          Haven&apos;t account yet?{" "}
          <Link
            to="/signup"
            className="link uppercase text-blue-500 hover:text-amber-500"
          >
            sign up
          </Link>
        </p>
      </div>
    </>
  );
};

export default Banner;
