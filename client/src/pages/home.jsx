// import { useAuth } from "../store/auth";
import '../CSS/home.css'
import { useLogin } from "../components/LoginContext";

export const Home = () => {
    // const {isLoggedIn} = useAuth();
    const { loggedIn, user } = useLogin();

    return(
        <>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossOrigin="anonymous"></link>
        
        <main>
            <section className="section-hero">
                <div className="container grid grid-two-cols">
                    <div className="hero-content">
                        <section className="welcome-section">
                        <div className="welcome-container">
                        <p className='welcome-heading'>
                            Welcome 
                            {user ? (  
                            <>
                            <span style={{ color:"red",fontStyle:"italic",marginLeft:"5px",marginRight:"5px",fontWeight:"bold" }}>{user.name} </span> to our website
                            </>
                            ) : ( ` to our website ` )}
                        </p>
                        <p className="welcome-text">
                            Discover the easiest way to book your salon appointments! Whether you’re looking for a haircut, styling, manicure, or any other beauty treatment, we’ve got you covered. With just a few clicks, you can find the best salons in your area and book your preferred time slot instantly. No more waiting or unnecessary phone calls—your perfect salon experience is just a click away!
                        </p>
                        {loggedIn? (
                            <a href="/nearbyShops">
                                <button className="cta-button" type="button">Make an Appointment</button>
                            </a>
                            ):(
                            <a href="/login">
                                <button className="cta-button" type="button">Make an Appointment</button>
                            </a>  
                            )}
                        </div>
                        </section>

                        <section className="why-choose-us-section">
                        <h2 className="section-title">Why Choose Us?</h2>
                        <div className="features-container">
                            <div className="feature-item">
                                <h3 className="feature-title">Convenience</h3>
                                <p className="feature-description">Book appointments anytime, anywhere, from your mobile or desktop.</p>
                            </div>
                            <div className="feature-item">
                                <h3 className="feature-title">Choice</h3>
                                <p className="feature-description">Browse a wide range of salons and services tailored to your needs.</p>
                            </div>
                            <div className="feature-item">
                                <h3 className="feature-title">Real-Time Availability</h3>
                                <p className="feature-description">See available slots in real-time and choose what fits your schedule best.</p>
                            </div>
                            <div className="feature-item">
                                <h3 className="feature-title">Reviews & Ratings</h3>
                                <p className="feature-description">Make informed decisions with reviews and ratings from other customers.</p>
                            </div>
                            <div className="feature-item">
                                <h3 className="feature-title">Secure Payments</h3>
                                <p className="feature-description">Pay securely online and focus on your beauty experience.</p>
                            </div>
                        </div>
                    </section>

                    <section className="how-it-works-section">
                        <h2 className="section-title">How It Works</h2>
                        <div className="steps-container">
                            <div className="step-item">
                                <h3 className="step-title">Search</h3>
                                <p className="step-description">Find salons near you offering the services you need.</p>
                            </div>
                            <div className="step-item">
                                <h3 className="step-title">Select</h3>
                                <p className="step-description">Choose your preferred salon, service, and time slot.</p>
                            </div>
                            <div className="step-item">
                                <h3 className="step-title">Book</h3>
                                <p className="step-description">Confirm your booking and get instant confirmation.</p>
                            </div>
                            <div className="step-item">
                                <h3 className="step-title">Enjoy</h3>
                                <p className="step-description">Show up at the salon, relax, and enjoy your beauty treatment.</p>
                            </div>
                        </div>
                        
                        <div className="cta-container">
                            <p className="cta-text">Ready to book your next appointment?</p>
                            {loggedIn? (
                            <a href="/nearbyShops">
                                <button className="cta-button" type="button">Book your favorite salon now!</button>
                            </a>
                            ):(
                            <a href="/login">
                                <button className="cta-button" type="button">Book your favorite salon now!</button>
                            </a>  
                            )}
                        </div>
                    </section>
                    </div>

                    {/* <div id="carouselExample" className="carousel slide">
                        <div className="carousel-inner">
                            <div className="carousel-item active">
                            <img src="/images/bg1.jpg" className="d-block w-100" alt="..."/>
                            </div>
                            <div className="carousel-item">
                            <img src="/images/bg2.jpg" className="d-block w-100" alt="..."/>
                            </div>
                            <div className="carousel-item">
                            <img src="/images/bg3.jpg" className="d-block w-100" alt="..."/>
                            </div>
                        </div>
                        <button className="carousel-control-prev" type="button"             data-bs-target="#carouselExample" data-bs-slide="prev">
                            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span className="visually-hidden">Previous</span>
                        </button>
                        <button className="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
                            <span className="carousel-control-next-icon" aria-hidden="true"></span>
                            <span className="visually-hidden">Next</span>
                        </button>
                    </div> */}
                </div>
            </section>
        </main>
                    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossOrigin="anonymous"></script>
                    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js" integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r" crossOrigin="anonymous"></script>
                    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.min.js" integrity="sha384-0pUGZvbkm6XF6gxjEnlmuGrJXVbNuzT9qBBavbLwCsOGabYfZo0T0to5eqruptLy" crossOrigin="anonymous"></script>
        </>
    )

}