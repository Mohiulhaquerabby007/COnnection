import React from 'react';

const Loader = ({ fullScreen = true, message = '' }) => {
  const loaderContent = (
    <div className="flex flex-col justify-center items-center gap-4 select-none">
      <div className="relative flex items-center justify-center">
        {/* Pulsing visual outer rings */}
        <div className="absolute w-24 h-24 bg-rose-500/20 rounded-full animate-ping duration-1000"></div>
        <div className="absolute w-16 h-16 bg-rose-500/30 rounded-full animate-pulse duration-1000"></div>
        
        {/* Sleek Tinder Heart vector logo */}
        <svg
          className="w-10 h-10 text-white fill-current relative z-10 filter drop-shadow-md animate-bounce duration-1000"
          viewBox="0 0 24 24"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>

      {message && (
        <p className="text-sm font-semibold tracking-wide text-rose-500/80 uppercase animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-900 z-[9999]">
        {loaderContent}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-12 w-full">{loaderContent}</div>;
};

export default Loader;
