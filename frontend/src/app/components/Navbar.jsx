import Link from 'next/link';
import React from 'react'

const Navbar = () => {
  return (
    <div>
      {/* bg-[#1e1e1e] = VS Code dark background */}
      {/* text-gray-300 = light text so it's readable on dark */}
      <header className="text-gray-300 body-font bg-[#1e1e1e]">
        <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
          {/* text-white so the logo text shows up on the dark background */}
          <a className="flex title-font font-medium items-center text-white mb-4 md:mb-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              className="w-10 h-10 text-white p-2 bg-blue-500 rounded-full"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="ml-3 text-xl">Tailblocks</span>
          </a>

          <nav className="md:ml-auto md:mr-auto flex flex-wrap items-center text-base justify-center">
            {/* hover:text-white makes the link brighten when hovered */}
            <a className="mr-5 hover:text-white" href='/signup'>Signup</a>
            <a className="mr-5 hover:text-white" href='/login'>login</a>
            <a className="mr-5 hover:text-white" href='/Convertor'>Convertor</a>
            <a className="mr-5 hover:text-white" href='/'>Home</a>
          </nav>

          {/* Button: slightly lighter dark gray (#2d2d2d) so it stands out from the header */}
          <button className="inline-flex items-center bg-[#2d2d2d] border-0 py-1 px-3 focus:outline-none hover:bg-[#3c3c3c] rounded text-base mt-4 md:mt-0">
            Button
            <svg
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              className="w-4 h-4 ml-1"
              viewBox="0 0 24 24"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </header>
      {/* border-gray-700 so the divider lines aren't bright white */}
      <hr className="border-gray-700" />
    </div>
  )
}

export default Navbar;