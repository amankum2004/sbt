import React from "react"; 
// import "../CSS/Footer.css";


export const Footer = () => {
  return (
    <>
      {/* <footer id="footer">
        <div className="cont">
          <div className="row">
            <div className="col-md-3">
              <a href="/">
                <img src="/images/sbt logo md.svg" />
              </a>
              <div className="footer-about">
                <p>Salon Booking Time</p>
              </div>

            </div>
            <div className="col-md-3">
              <div className="useful-link">
                <h2>Get to know Us</h2>
                <img src="./assets/images/about/home_line.png" alt="" className="img-fluid" />
                <div className="use-links">
                  <li><a href="/about"><i className="fa-solid fa-angles-right"></i> About Us</a></li>
                  <li><a href="/services"><i className="fa-solid fa-angles-right"></i> Services</a></li>
                  <li><a href="/contact"><i className="fa-solid fa-angles-right"></i> Contact</a></li>
                  <li><a href="/careers"><i className="fa-solid fa-angles-right"></i> Careers</a></li>
                </div>
              </div>

            </div>
            <div className="col-md-3">
              <div className="social-links">
                <h2>Connect with Us</h2>
                <img src="./assets/images/about/home_line.png" alt="" />
                <div className="social-icons">
                  <li><a href="https://www.facebook.com/" target="_blank"><i className="fa-brands fa-facebook-f"></i> Facebook</a></li>
                  <li><a href="https://www.instagram.com/" target="_blank"><i className="fa-brands fa-instagram"></i> Instagram</a></li>
                  <li><a href="https://www.linkedin.com/" target="_blank"><i className="fa-brands fa-linkedin-in"></i> Linkedin</a></li>
                </div>
              </div>


            </div>
            <div className="col-md-3">
              <div className="address">
                <h2>Address</h2>
                <img src="./assets/images/about/home_line.png" alt="" className="img-fluid" />
                <div className="address-links">
                  <li className="address1"><i className="fa-solid fa-location-dot"></i> Indian Institute of Technology Mandi,Kamand, Himachal Pradesh-175005</li>
                  <li><a href=""><i className="fa-solid fa-phone"></i> +91 8810269376</a></li>
                  <li><a href=""><i className="fa-solid fa-envelope"></i> kumaraman6012@gmail.com</a></li>
                </div>
              </div>
            </div>

          </div>
        </div>
      </footer>

      <section id="copy-right">
        <div className="copy-right-sec"><i className="fa-solid fa-copyright"></i> All copyrights reserved | SBT<a href="#"></a>
        </div>
      </section> */}

<link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.0.2/css/bootstrap.min.css"
  />
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css"
  />

<footer className="bg-gray-100 py-12 bg-cover" style={{ backgroundImage: 'url(https://arena.km.ua/wp-content/uploads/3538533.jpg)' }}>
        <div className="container mx-auto">
          <div className=" grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <a href="/">
                <img src="/images/sbt logo md.svg" alt="Salon Booking Time" />
              </a>
              <div className="mt-4">
                <p className="text-black-600 font-bold">Salon Booking Time</p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold pb-4">Get to know Us</h2>
              <img src="./assets/images/about/home_line.png" alt="" className="pb-4" />
              <ul className="space-y-3">
                <li>
                  <a href="/about" className=" text-gray-600 hover:text-black"><i className="fa-solid fa-angles-right pr-2"></i> About Us</a>
                </li>
                <li>
                  <a href="/services" className="text-gray-600 hover:text-black"><i className="fa-solid fa-angles-right pr-2"></i> Services</a>
                </li>
                <li>
                  <a href="/contact" className="text-gray-600 hover:text-black"><i className="fa-solid fa-angles-right pr-2"></i> Contact</a>
                </li>
                <li>
                  <a href="/careers" className="text-gray-600 hover:text-black"><i className="fa-solid fa-angles-right pr-2"></i> Careers</a>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold pb-4">Connect with Us</h2>
              <img src="./assets/images/about/home_line.png" alt="" className="pb-4" />
              <ul className="space-y-3">
                <li>
                  <a href="https://www.facebook.com/" target="_blank" className="text-gray-600 hover:text-black flex items-center">
                    <i className="fa-brands fa-facebook-f pr-2 text-pink-700"></i> Facebook
                  </a>
                </li>
                <li>
                  <a href="https://www.instagram.com/" target="_blank" className="text-gray-600 hover:text-black flex items-center">
                    <i className="fa-brands fa-instagram pr-2 text-pink-700"></i> Instagram
                  </a>
                </li>
                <li>
                  <a href="https://www.linkedin.com/" target="_blank" className="text-gray-600 hover:text-black flex items-center">
                    <i className="fa-brands fa-linkedin-in pr-2 text-pink-700"></i> Linkedin
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold pb-4">Address</h2>
              <img src="./assets/images/about/home_line.png" alt="" className="pb-4" />
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <i className="fa-solid fa-location-dot pr-2 text-pink-700"></i>
                  Indian Institute of Technology Mandi, Kamand, Himachal Pradesh-175005
                </li>
                <li>
                  <a href="tel: +918810269376" className="hover:text-black flex items-center">
                    <i className="fa-solid fa-phone pr-2 text-pink-700"></i> +91 8810269376
                  </a>
                </li>
                <li>
                  <a href="mailto: sbthelp123@gmail.com" className="hover:text-black flex items-center">
                    <i className="fa-solid fa-envelope pr-2 text-pink-700"></i> sbthelp123@gmail.com
                    {/* <i className="fa-solid fa-envelope pr-2 text-pink-700"></i> kumaraman6012@gmail.com */}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      <section className="bg-pink-700 text-white text-center py-4">
        <div><i className="fa-solid fa-copyright"></i> All copyrights reserved | SBT</div>
      </section>

    </>
  )
}
