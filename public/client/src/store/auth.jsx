import { createContext, useContext, useEffect, useState } from "react";

const API = import.meta.env.VITE_APP_API_KEY;

export const AuthContext = createContext();

// eslint-disable-next-line react/prop-types
export const AuthProvider = ({children}) => {

    const [token,setToken] = useState(localStorage.getItem("token"));
    const [user,setUser] = useState("");
    const [services,setServices] = useState([]);
    const [isLoading,setIsLoading] = useState(true);
    const authorizationToken = `Bearer ${token}`


    const storeTokenInLS = (serverToken) => {
        setToken(serverToken);
        return localStorage.setItem("token",serverToken)
    };

    let isLoggedIn = !!token;
    console.log("isLoggedIN",isLoggedIn);

    // tackling the logout function
    const LogoutUser = () => {
        setToken("");
        return localStorage.removeItem("token");
    };

    // AUTHENTICATION - GET THE CURRENTLY LOGGEDIN USER DATA
    const userAuthentication = async() => {
        try {
            setIsLoading(true);
            // const response = await fetch("http://localhost:27017/api/auth/user",{
            const response = await fetch(`${API}/api/auth/user`,{
                method:"GET",
                headers:{
                    Authorization:authorizationToken
                }
            });
            if (response.ok) {
                const data = await response.json();
                console.log("user data: ",data.userData);
                setUser(data.userData);
                setIsLoading(false);
            }else{
                setIsLoading(false);
                console.error("Error!! loading user data")
            }
        } catch (error) {
            console.error("Error!! fetching user data")
            // console.log(error);
        }
    }

    // FETCH THE SERVICES DATA FROM DATABASE
    const getServices = async() => {
        try {
            // const response = await fetch("http://localhost:27017/api/data/service",{
            const response = await fetch(`${API}/api/data/service`,{
                method:"GET"
            })

            if(response.ok){
                const data = await response.json();
                console.log(data.msg);
                setServices(data.msg);
            }
        } catch (error) {
            console.log(`services frontend error ${error}`)
        }
    }

    useEffect(() => {
        getServices();
        userAuthentication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    return <AuthContext.Provider 
        value={{isLoggedIn,
            storeTokenInLS,
            LogoutUser,
            user,
            services,
            authorizationToken,
            isLoading,
            API,
        }}>

        {children}
    </AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const authContextValue =  useContext(AuthContext);
    if (!authContextValue) {
        throw new Error("useAuth used outside of the provider")
    }
    return authContextValue;
}

