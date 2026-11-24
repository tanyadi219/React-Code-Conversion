import React from 'react'

const home = () => {
  return (
    <>
      {/* The keyframes live inside the component, so the CSS and markup stay together.
          Template literal (backticks) lets us write multi-line CSS inside JSX. */}
      <style>{`
        @keyframes hs-hero-day-night {
          0%, 18% { opacity: 0; }
          42%, 62% { opacity: 1; }
          86%, 100% { opacity: 0; }
        }
      `}</style>

      {/* Hero */}
      <div className="relative overflow-hidden">
        {/* Background layers (decorative, so hidden from screen readers) */}
        <div
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
          aria-hidden="true"
        >
          {/* Day image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('https://i.pinimg.com/1200x/67/a1/37/67a13709a9ddbf259c5c3d166d64f23a.jpg')" }}
          ></div>

          {/* Night image: fades in and out using the keyframes above */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-0 motion-reduce:animate-none animate-[hs-hero-day-night_10s_ease-in-out_infinite]"
            style={{ backgroundImage: "url('https://i.pinimg.com/736x/57/9b/7d/579b7d54e7e462bf1c162bcc54e08708.jpg')" }}
          ></div>

          {/* Dark overlay so the white text is easier to read */}
          <div className="absolute inset-0 bg-gray-800/10"></div>
        </div>

        {/* Content sits above the background (z-10) */}
        <div className="relative z-10 max-w-340 mx-auto px-4 sm:px-6 lg:px-8 py-24 min-h-dvh flex flex-col justify-center space-y-8">
          {/* Announcement Banner */}
          <div className="flex justify-center">
            <a
              className="group inline-flex items-center bg-white/40 hover:bg-white/50 p-1 ps-4 rounded-full shadow-lg shadow-transparent backdrop-blur-xl focus:outline-hidden focus:bg-white/50"
              href="/signup"
            >
              <p className="me-2 text-gray-800 text-sm">We Know what you want</p>
              <span className="group-hover:bg-white/50 py-1.5 px-2.5 flex justify-center items-center gap-x-2 rounded-full bg-white/50 font-semibold text-gray-800 text-sm">
                <svg
                  className="shrink-0 size-4"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </span>
            </a>
          </div>
          {/* End Announcement Banner */}

          {/* Title */}
          <div className="max-w-3xl text-center mx-auto">
            <h1 className="block font-semibold text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
              Convert with ease.
            </h1>
          </div>

          <div className="max-w-3xl text-center mx-auto">
            <p className="text-lg text-white/80">
              Convert smarter with AI that understands you. So you can take a breath.
            </p>
          </div>

          {/* Buttons */}
          <div className="text-center">
  <div className="inline-flex flex-wrap justify-center items-center gap-3">
    {/* Get Started button */}
    {/* transition-all duration-300 = animate every change over 0.3 seconds
        hover:scale-105 = grow to 105% size on hover
        hover:-translate-y-1 = move up a little on hover
        hover:shadow-xl = bigger shadow, so it looks like it's floating
        active:scale-95 = shrink slightly while clicking, like a real button press
        hover:bg-gray-100 = fixed, gray-20 doesn't exist in Tailwind */}
    <a
      className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-full bg-white border border-gray-200 text-gray-800 shadow-2xs transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-xl hover:bg-gray-100 active:scale-95 focus:outline-hidden focus:bg-gray-100"
      href="/Convertor"
    >
      Get Started
      <svg
        className="shrink-0 size-4"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </a>

    {/* Login button */}
    {/* Same pop-up effect. hover:bg-white/10 gives a faint glass background on hover
        (fixed, "plain" isn't a Tailwind color, so it did nothing before) */}
    <a
      className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-full border border-transparent text-white transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-xl hover:bg-white/10 active:scale-95 focus:outline-hidden focus:bg-white/10"
      href="/login"
    >
      <svg
        className="shrink-0 size-4"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
      Login
    </a>
  </div>
</div>
          {/* End Buttons */}
        </div>
      </div>
      {/* End Hero */}
    </>
  )
}

export default home;