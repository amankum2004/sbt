import "../CSS/Footer.css";

export const Footer = () => {
  return (
    <>
      <footer id="footer">
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
      </section>
    </>
  )
}
