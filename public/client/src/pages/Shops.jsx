import { useEffect, useState } from "react";
import { useAuth } from "../store/auth";
import { Link } from "react-router-dom";
// import "./states_districts.js" 


export const Shops = () => {
    const [shop,setShop] = useState([]);
    const {authorizationToken,API} = useAuth();

    const getAllShopsData = async() => {
        try {
            const response = await fetch(`${API}/api/shop/shoplists`,{
            // const response = await fetch(`${API}/api/shop/registershop`,{
                method:"GET",
                headers:{
                    Authorization: authorizationToken,
                }
            });
            const data = await response.json();
            console.log(`shops ${data}`);
            // setShop(data);
            setShop(Array.isArray(data) ? data : []);
        }
        catch (error) {
            console.log(error);
        }
    }
    
    useEffect(() => {
      getAllShopsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])


    return <>
    <h3>Select your location manually</h3>
    {/* <form className="dropdown-group">
      <select id="State" size={1} defaultValue="">
        <option value="">
          -- Select State --
        </option>
      </select>
      
      <select id="District" size={1} defaultValue="">
        <option value="">
          -- Select District --
        </option>
      </select>
      
      <select id="City" size={1} defaultValue="">
        <option value="">
          -- Select City --
        </option>
      </select>
      
      <select id="Zip" size={1} defaultValue="">
        <option value="">
          -- Pin Code --
        </option>
      </select>
    </form>

    <script src="./states_districts.js"></script> */}


<form>
  <div className="form-group col-md-4">
    <label htmlFor="inputState">State</label>
    <select className="form-control" id="inputState">
                        <option value="SelectState">Select State</option>
                        <option value="Andra Pradesh">Andra Pradesh</option>
                        <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                        <option value="Assam">Assam</option>
                        <option value="Bihar">Bihar</option>
                        <option value="Chhattisgarh">Chhattisgarh</option>
                        <option value="Goa">Goa</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Haryana">Haryana</option>
                        <option value="Himachal Pradesh">Himachal Pradesh</option>
                        <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                        <option value="Jharkhand">Jharkhand</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Kerala">Kerala</option>
                        <option value="Madya Pradesh">Madya Pradesh</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Manipur">Manipur</option>
                        <option value="Meghalaya">Meghalaya</option>
                        <option value="Mizoram">Mizoram</option>
                        <option value="Nagaland">Nagaland</option>
                        <option value="Orissa">Orissa</option>
                        <option value="Punjab">Punjab</option>
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="Sikkim">Sikkim</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Tripura">Tripura</option>
                        <option value="Uttaranchal">Uttaranchal</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="West Bengal">West Bengal</option>
                        <option disabled>UNION Territories</option> 
                        <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                        <option value="Chandigarh">Chandigarh</option>
                        <option value="Dadar and Nagar Haveli">Dadar and Nagar Haveli</option>
                        <option value="Daman and Diu">Daman and Diu</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Lakshadeep">Lakshadeep</option>
                        <option value="Pondicherry">Pondicherry</option>
                      </select>
  </div>
  <div className="form-group col-md-4">
    <label htmlFor="inputDistrict">District</label>
    <select className="form-control" id="inputDistrict">
        <option value="">-- select one -- </option>
    </select>
  </div>

</form>
    <section className="users-section">
        <div className="container">
            <h2>List of Shops</h2>
        </div>

        <div className="container shoplist">
            <table>
                <thead>
                    <tr>
                        <th>Shop Name</th>
                        <th>Phone</th>
                        <th>Address</th>
                        <th>Location</th>
                        <th>Book appointment</th>
                    </tr>
                </thead>
                <tbody>
                    {shop.length === 0 ? (
                      <h2 style={{color:"red"}}>No Shops Exist</h2>
                      ) : (
                      shop.map((curShop, index) => (
                          <tr key={index}>
                              <td>{curShop.shopname}</td>
                              <td>{curShop.phone}</td>
                              <td>{curShop.state}</td>
                              <td>{curShop.city}</td>
                              <td>
                                  <Link to={`/nearbyShops/${curShop._id}/shopinfo`}>Select</Link>
                              </td>
                          </tr>
                          ))
                       )}
                </tbody>
            </table>
        </div>
    </section>
    </>

};




