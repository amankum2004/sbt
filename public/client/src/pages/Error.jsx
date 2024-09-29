import { NavLink } from "react-router-dom"

export const Error = () => {
    return (
        <>
        <section className="error-page">
            <div className="content">
                <h2 className="header">404</h2>
                <h2>Sorry!! , page not found</h2>
                {/* <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam, velit unde? Laudantium cumque voluptatum, eaque repudiandae perspiciatis placeat ea voluptatem, nesciunt aperiam distinctio corrupti deleniti in ex delectus sed voluptas eius. Perferendis labore necessitatibus, numquam amet reprehenderit incidunt optio nam, hic voluptates repudiandae voluptatum.</p> */}

                <div className="btns">
                    <NavLink to="/">return to home page</NavLink>
                    <br />
                    <NavLink to="/contact">report problem</NavLink>
                </div>
            </div>
        </section>
        </>
    )
}