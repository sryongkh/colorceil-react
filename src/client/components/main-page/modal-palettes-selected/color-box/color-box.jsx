const ColorsBox = () => {
  return (
    <>
      <div>
        <div className="colors-box w-full h-96 bg-slate-700 flex flex-col-reverse">
          <div className="w-full py-4 text-center bg-black opacity-50">
            <p className="text-white uppercase">#7289da</p>
          </div>
        </div>
        <p className="font-bold text-black text-center border-1 border-emerald-500">
          RGB(114, 137, 218)
        </p>
      </div>
    </>
  );
};

export default ColorsBox;
