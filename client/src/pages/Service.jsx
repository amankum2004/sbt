// import { useAuth } from "../store/auth"
// import '../CSS/style.css'

export const Service = () => {

    return (
        <div style={{ backgroundColor: '#f4f4f4', padding: '60px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '2.5rem', color: '#333', marginBottom: '10px' }}>Our Salon Services</h2>
                <h3 style={{ fontSize: '1.875rem', color: '#666' }}>Best Salon and Barber Services for You</h3>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: '1 1 calc(33.333% - 20px)', boxSizing: 'border-box' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', overflow: 'hidden', textAlign: 'center' }}>
                        <div style={{ position: 'relative', overflow: 'hidden' }}>
                            <img src="images/service-1.jpg" alt="Hair Cutting" style={{ width: '100%', height: 'auto', display: 'block' }} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', color: '#333', margin: '15px 0' }}>Hair Cutting</h3>
                        <p style={{ fontSize: '1rem', color: '#666', padding: '0 15px', marginBottom: '20px' }}>
                            Barber is a person whose occupation is mainly to cut dress style
                        </p>
                    </div>
                </div>
                <div style={{ flex: '1 1 calc(33.333% - 20px)', boxSizing: 'border-box' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', overflow: 'hidden', textAlign: 'center' }}>
                        <div style={{ position: 'relative', overflow: 'hidden' }}>
                            <img src="images/service-2.jpg" alt="Beard Trimming" style={{ width: '100%', height: 'auto', display: 'block' }} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', color: '#333', margin: '15px 0' }}>Beard Trimming</h3>
                        <p style={{ fontSize: '1rem', color: '#666', padding: '0 15px', marginBottom: '20px' }}>
                            Barber is a person whose occupation is mainly to cut dress style
                        </p>
                    </div>
                </div>
                <div style={{ flex: '1 1 calc(33.333% - 20px)', boxSizing: 'border-box' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', overflow: 'hidden', textAlign: 'center' }}>
                        <div style={{ position: 'relative', overflow: 'hidden' }}>
                            <img src="images/service-3.jpg" alt="Smooth Shave" style={{ width: '100%', height: 'auto', display: 'block' }} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', color: '#333', margin: '15px 0' }}>Smooth Shave</h3>
                        <p style={{ fontSize: '1rem', color: '#666', padding: '0 15px', marginBottom: '20px' }}>
                            Barber is a person whose occupation is mainly to cut dress style
                        </p>
                    </div>
                </div>
                <div style={{ flex: '1 1 calc(33.333% - 20px)', boxSizing: 'border-box' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', overflow: 'hidden', textAlign: 'center' }}>
                        <div style={{ position: 'relative', overflow: 'hidden' }}>
                            <img src="images/service-3.jpg" alt="Face Masking" style={{ width: '100%', height: 'auto', display: 'block' }} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', color: '#333', margin: '15px 0' }}>Face Masking</h3>
                        <p style={{ fontSize: '1rem', color: '#666', padding: '0 15px', marginBottom: '20px' }}>
                            Barber is a person whose occupation is mainly to cut dress style
                        </p>
                    </div>
                </div>
                <div style={{ flex: '1 1 calc(33.333% - 20px)', boxSizing: 'border-box' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', overflow: 'hidden', textAlign: 'center' }}>
                        <div style={{ position: 'relative', overflow: 'hidden' }}>
                            <img src="images/service-3.jpg" alt="Hair Coloring" style={{ width: '100%', height: 'auto', display: 'block' }} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', color: '#333', margin: '15px 0' }}>Hair Coloring</h3>
                        <p style={{ fontSize: '1rem', color: '#666', padding: '0 15px', marginBottom: '20px' }}>
                            Barber is a person whose occupation is mainly to cut dress style
                        </p>
                    </div>
                </div>
                <div style={{ flex: '1 1 calc(33.333% - 20px)', boxSizing: 'border-box' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', overflow: 'hidden', textAlign: 'center' }}>
                        <div style={{ position: 'relative', overflow: 'hidden' }}>
                            <img src="images/service-3.jpg" alt="Hair Straight" style={{ width: '100%', height: 'auto', display: 'block' }} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', color: '#333', margin: '15px 0' }}>Hair Straight</h3>
                        <p style={{ fontSize: '1rem', color: '#666', padding: '0 15px', marginBottom: '20px' }}>
                            Barber is a person whose occupation is mainly to cut dress style
                        </p>
                    </div>
                </div>
                {/* <div style={{ flex: '1 1 calc(33.333% - 20px)', boxSizing: 'border-box' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', overflow: 'hidden', textAlign: 'center' }}>
                        <div style={{ position: 'relative', overflow: 'hidden' }}>
                            <img src="images/service-3.jpg" alt="Bright Facial" style={{ width: '100%', height: 'auto', display: 'block' }} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', color: '#333', margin: '15px 0' }}>Bright Facial</h3>
                        <p style={{ fontSize: '1rem', color: '#666', padding: '0 15px', marginBottom: '20px' }}>
                            Barber is a person whose occupation is mainly to cut dress style
                        </p>
                    </div>
                </div> */}
            </div>
        </div>
    </div>
    

    )
}