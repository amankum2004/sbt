import { NavLink } from "react-router-dom"
import React from "react"; 

export const Error = () => {
    return (
        <>
            <section
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    backgroundColor: '#f8f9fa',
                    textAlign: 'center'
                }}
            >
                <div
                    style={{
                        maxWidth: '600px',
                        margin: '0 auto',
                        padding: '20px',
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    <h2
                        style={{
                            fontSize: '120px',
                            fontWeight: 'bold',
                            color: '#dc3545',
                            margin: '0'
                        }}
                        className="header"
                    >
                        404
                    </h2>
                    <h2
                        style={{
                            fontSize: '24px',
                            color: '#333',
                            margin: '10px 0'
                        }}
                    >
                        Sorry!! , page not found
                    </h2>

                    <div
                        style={{
                            marginTop: '30px'
                        }}
                        className="btns"
                    >
                        <NavLink
                            to="/"
                            style={{
                                display: 'inline-block',
                                padding: '10px 20px',
                                margin: '5px',
                                textDecoration: 'none',
                                fontSize: '16px',
                                borderRadius: '5px',
                                color: '#fff',
                                backgroundColor: '#007bff',
                                transition: 'background-color 0.3s, color 0.3s'
                            }}
                        >
                            Return to home page
                        </NavLink>
                        <br />
                        <NavLink
                            to="/contact"
                            style={{
                                display: 'inline-block',
                                padding: '10px 20px',
                                margin: '5px',
                                textDecoration: 'none',
                                fontSize: '16px',
                                borderRadius: '5px',
                                color: '#fff',
                                backgroundColor: '#dc3545',
                                transition: 'background-color 0.3s, color 0.3s'
                            }}
                        >
                            Report problem
                        </NavLink>
                    </div>
                </div>
            </section>

        </>
    )
}