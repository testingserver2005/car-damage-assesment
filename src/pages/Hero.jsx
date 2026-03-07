import React from "react";
import { ArrowDown } from "lucide-react";

function Hero() {
  return (
    <section class="relative flex items-center justify-center py-8 md:py-12 px-4 sm:px-6 md:px-8 bg-white">

      <div className="max-w-5xl mx-auto text-center space-y-8">

        {/* Logo */}
        <div className="flex justify-center">
          <a href="http://quickrepair.dk/" target="_blank" rel="noopener noreferrer">
    <img
      src="/logo.png"
      alt="Company Logo"
      className="w-40 sm:w-52 md:w-64 object-contain"
    />
  </a>
        </div>

        {/* Heading */}
      <h1 className="text-2xl sm:text-4xl md:text-5xl font-semibold uppercase text-[#fb5c14] ">
  Skadesanmeldelse
</h1>

        {/* Optional small subtitle (keep OR remove) */}
        {/* <p className="text-black-500 text-base sm:text-2xl font-bold uppercase max-w-xl mx-auto">
  Indtast registreringsnummer og anmeld din skade hurtigt og nemt.
</p> */}

        {/* Scroll indicator */}
        <div className="flex justify-center pt-4">
          <ArrowDown className="w-6 h-6 animate-bounce text-[#FB5C14]" />
        </div>

      </div>
    </section>
  );
}

export default Hero;