import { useAuth } from "../store/auth";

export const Home = () => {
    const {isLoggedIn} = useAuth();

    return(
        <>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossOrigin="anonymous"></link>
        
        <main>
            <section className="section-hero">
                <div className="container grid grid-two-cols">
                    <div className="hero-content">
                        <h1>SBT</h1>
                        <p>Hello everyone</p>
                        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Optio quibusdam perspiciatis odit dolor sunt, quas quia nemo officia beatae id! Aperiam nemo commodi architecto provident nobis tempora id cupiditate, voluptatibus necessitatibus aliquam at, earum minima beatae minus? Totam quibusdam exercitationem illum pariatur fugiat quod?</p>
                        <div className="btn btn-group">
                            <a href="/contact">
                                <button className="button">Connect Us</button>
                            </a>
                            
                            <a href="/about">
                                <button className="button">Learn more</button>
                            </a>
                        </div>
                    </div>

                    {isLoggedIn? (
                        <a href="/nearbyShops">
                            <button className="btn btn-secondary" type="button">Book nearby salon</button>
                        </a>
                        ):(
                            <a href="/login">
                            <button className="btn btn-secondary" type="button">Book nearby salon</button>
                        </a>  
                    )}
                        <br/>

                        {isLoggedIn? (
                            <a href="/registershop">
                                <button className="btn btn-primary" type="button">Register your Salon</button>
                            </a>
                            ):(
                                <a href="/login">
                                <button className="btn btn-primary" type="button">Register your Salon</button>
                            </a>
                        )}
                    

                        

                    {/* hero images */}
                    <div id="carouselExample" className="carousel slide">
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
                        <button className="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
                            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span className="visually-hidden">Previous</span>
                        </button>
                        <button className="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
                            <span className="carousel-control-next-icon" aria-hidden="true"></span>
                            <span className="visually-hidden">Next</span>
                        </button>
                        </div>
                </div>
            </section>
        </main>
                    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossOrigin="anonymous"></script>
                    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js" integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r" crossOrigin="anonymous"></script>
                    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.min.js" integrity="sha384-0pUGZvbkm6XF6gxjEnlmuGrJXVbNuzT9qBBavbLwCsOGabYfZo0T0to5eqruptLy" crossOrigin="anonymous"></script>
        </>
    )

}