import Link from 'next/link';
import React from 'react'

const Navbar = () => {
  return (
    <div>
      {/* fixed top-0 inset-x-0 = stick to the top and stretch full width, floating over the hero
          z-50 = stay above the hero content
          bg-[#1e1e1e]/40 = same dark color, but only 40% solid so the background shows through
          backdrop-blur-md = blurs whatever is behind the navbar (this is the glass effect)
          border-b border-white/10 = thin faint line at the bottom, replaces the <hr> */}
      <header className="fixed top-0 inset-x-0 z-50 text-gray-900 body-font bg-[#1e1e1e]/10 backdrop-blur-md border-b border-white/0">
        <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
          <a className="flex title-font font-medium items-center text-white mb-4 md:mb-0">
            {/* PASTE YOUR IMAGE URL between the quotes in src="" */}
            <img
              src="https://i.pinimg.com/736x/8b/39/61/8b3961205dbb6fdfeacdb1cdac0227f9.jpg"
              alt="CC logo"
              className="w-10 h-10 rounded-full object-cover"
            />
          </a>

          {/* Button is also see-through now (white/10) so it matches the glass look */}
         <a
            href="/"
            className="ml-auto inline-flex items-center text-white bg-white/10 border-0 py-1 px-3 focus:outline-none hover:bg-white/20 rounded text-base mt-4 md:mt-0"
          >
            Home
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
          </a>
        </div>
      </header>
    </div>
  )
}

export default Navbar;