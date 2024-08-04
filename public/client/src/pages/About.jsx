// import { NavLink } from "react-router-dom"
import { useAuth } from "../store/auth"
import React from "react";



export const About = () => {
    const baseStyle = {
        color: 'blue',
        fontSize: '18px',
        fontWeight: 'bold',
        padding: '10px',
        textAlign: 'center'
    };

    // Define style changes for the username
    const usernameStyle = {
        color: 'red', // Different color for the username part
        fontStyle: 'italic' ,// Italicize the username
        marginLeft:'5px',
        marginRight:'5px'
    };

    const {user} = useAuth();
    const [hover, setHover] = React.useState(false);
    const hoverStyle = hover ? { color: 'purple' } : {};

    return (
        <>
        <main>
            <section className="section-hero">
                <div className="container">
                    <div className="hero-content">
                        <p style={{ ...baseStyle, ...hoverStyle }}
                            onMouseEnter={() => setHover(true)}
                            onMouseLeave={() => setHover(false)}>
                            Welcome,  
                            {user ? (  
                            <>
                                <span style={usernameStyle}>{user.username} </span> to our website
                            </>
                            ) : ( `to our website` )}
                        </p>
                        <h3>Why choose us</h3>
                        <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sit quia voluptatem excepturi dolorum at eum itaque debitis temporibus. Velit consequuntur sed placeat corrupti aut odio molestiae itaque, quidem officia similique explicabo iste, voluptas quaerat expedita, accusantium repellat veniam. Rem quis aut nulla exercitationem expedita.</p>
                    </div>
                </div>
            </section>
        </main>
        </>
    )
}