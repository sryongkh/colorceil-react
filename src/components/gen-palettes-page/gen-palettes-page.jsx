import ColorsBox from "./colors-box/colors-box";
import GeneratorTab from "./generator-tab/generator-tab";

const GeneratePalettesPage = () => {
  return (
    <>
      <div className="w-full h-full flex justify-center">
        <div className="mt-20 flex flex-row justify-center items-center">
          <ColorsBox />
        </div>
      </div>
      <GeneratorTab />
    </>
  );
};

export default GeneratePalettesPage;
