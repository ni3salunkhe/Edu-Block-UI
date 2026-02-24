import React from "react";

const TopNav = ({ onMenuClick }) => {
  return (
    <header className="h-16 bg-blue-700 text-white flex items-center justify-between px-4 sm:px-6 shadow-md shrink-0 z-30">

      {/* Left: Hamburger (mobile) + Logo */}
      <div className="flex items-center gap-3">
        {/* Hamburger — only visible below lg */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-blue-600 transition focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Open menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <span className="text-lg font-bold tracking-wide select-none">
          🎓 EduBlock
        </span>
      </div>
    </header>
  );
};

export default TopNav;
