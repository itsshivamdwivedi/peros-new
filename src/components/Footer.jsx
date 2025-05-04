
"use client";

import React from "react";
// m

const Footer = () => {
  return (
    <div className="relative min-h-screen flex flex-col z-10" >
    
      <main
        className="h-[150vh] bg-cover bg-center   relative z-1"
        style={{
          backgroundImage: "url('/footer.jpg')",
         height: "100vh",
         
        }}
      ></main>

  
      <footer className=" w-full py-16 bg-white sticky right-0 left-0 bottom-0  z-[-1]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="text-left">
              <img
                src="/assets/logo/logo.png"
                alt="Peros Logo"
                width={190}
                height={150}
                className="mb-4"
              />
            </div>

            <div className="text-left">
              <h4 className="text-xl font-bold font-serif mb-4">About Us</h4>
              <p className="text-gray-400">
                Peros has been making quality peanut butter since 1805. We
                combine organic, natural, and quality ingredients.
              </p>
            </div>

            <div className="text-left">
              <h4 className="text-xl font-bold font-serif mb-4">Quick Links</h4>
              {["Home", "About", "Products", "Contact"].map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className="block text-gray-400 hover:text-black mb-2"
                >
                  {link}
                </a>
              ))}
            </div>

            <div className="text-left">
              <h4 className="text-xl font-bold font-serif mb-4">Contact</h4>
              <p className="text-gray-400">Email:Support@peros.in</p>
              <p className="text-gray-400">Phone: +123 456 7890</p>
              <p className="text-gray-400">
                Address: 123 Peros Street, Switzerland
              </p>
            </div>

            <div className="text-left">

              <h4 className="text-xl font-bold font-serif mb-4">Follow Us</h4>
              <div className="flex gap-3">
                {[
                  { name: "https://www.instagram.com/peros.in?igsh=MTVjYzJxbzc2a2JhNw== ", url: "/assets/footer/instagram.png" ,href:"https://x.com/peros_in"},
                  { name: "Facebook", url: "/assets/footer/facebook.png" },
                  { name: "https://x.com/peros_in", url: "/assets/footer/twitter.png" },
                ].map((icon) => (
                  <a
                    key={icon.name}
                    href={`${icon.name.toLowerCase()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      className="h-6 w-6 hover:scale-110 transition-transform"
                      src={icon.url}
                      alt={icon.name}
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center mt-8 font-serif font-bold text-black text-sm">
            <p>&copy; 2025 Peros. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
