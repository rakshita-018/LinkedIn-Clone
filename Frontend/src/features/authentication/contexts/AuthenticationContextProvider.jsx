import React, { useEffect } from "react";
import { createContext, useContext , useState} from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { Loader } from "../../../components/loader/Loader";
import { request } from "../../../utils/api";



const AuthenticationContext = createContext(null);

export function useAuthentication() {
    return useContext(AuthenticationContext);
}

export function AuthenticationContextProvider(){
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();

    const isOnAuthPage =
        location.pathname === "/authentication/login" ||
        location.pathname === "/authentication/signup" ||
        location.pathname === "/authentication/request-password-reset";

        const login = async (email, password) => {
            await request({
                endpoint: "/api/v1/authentication/login",
                method: "POST",
                body: JSON.stringify({ email, password }),
                onSuccess: ({ token }) => {
                    localStorage.setItem("token", token);
                },
                onFailure: (error) => {
                    throw new Error(error);
                },
            });
        };
        

        const signup = async (email, password) => {
            await request({
                endpoint: "/api/v1/authentication/register",
                method: "POST",
                body: JSON.stringify({ email, password }),
                onSuccess: ({ token }) => {
                    localStorage.setItem("token", token);
                },
                onFailure: (error) => {
                    throw new Error(error);
                },
            });
        };
        
        const logout = async () => {
            localStorage.removeItem("token");
            setUser(null);
        }

        const fetchUser = async () => {
            // try{
            //     const response = await fetch(import.meta.env.VITE_API_URL + "/api/v1/authentication/user", {
            //         headers: {
            //             Authorization : `Bearer ${localStorage.getItem("token")}`,
            //         },
            //     });
            //     if(!response.ok) {
            //         throw new Error("Authentication failed");
            //     }
            //     const user = await response.json();
            //     setUser(user);
            // }catch(e){
            //     console.log(e);
            // }finally{
            //     setIsLoading(false);
            // }
            await request({
                endpoint: "/api/v1/authentication/user",
                onSuccess: (data) => setUser(data),
                onFailure: (error) => {
                  console.log(error);
                },
              });
              setIsLoading(false);
        }

        useEffect(() => {
            if(user){
                return;
            }else{
                fetchUser();
            }
        },[user, location.pathname])

        if(isLoading ){
            return <Loader/>
        }

        if(!isLoading && !user && !isOnAuthPage){
            return <Navigate to="/authentication/login" />;
        }
        
        if (user && !user.emailVerified && location.pathname !== "/authentication/verify-email") {
            return <Navigate to="/authentication/verify-email" />;
        }

        // if (user && user.emailVerified && location.pathname === "/authentication/verify-email") {
        //     return <Navigate to="/" />;
        // }

        if (
            user &&
            user.emailVerified &&
            !user.profileComplete &&
            !location.pathname.includes("/authentication/profile")
        ) {
            return <Navigate to={`/authentication/profile/${user.id}`} />;
        }
    
        if (
            user &&
            user.emailVerified &&
            user.profileComplete &&
            location.pathname.includes("/authentication/profile")
        ) {
            return <Navigate to="/" />;
        }

        if(user && isOnAuthPage){
            return <Navigate to="/" />;
        }


    return(
        <AuthenticationContext.Provider value={{user, login, signup, logout, setUser,}}>
            <Outlet/>
        </AuthenticationContext.Provider>
    )
}

// import { createContext, useContext, useEffect, useState } from "react";
// import { Navigate, Outlet, useLocation } from "react-router-dom";
// import { Loader } from "../../../components/Loader/Loader";
// import { request } from "../../../utils/api";

// const AuthenticationContext = createContext(null);

// export function useAuthentication() {
//     return useContext(AuthenticationContext);
// }

// export function AuthenticationContextProvider() {
//     const location = useLocation();
//     const [user, setUser] = useState(null);
//     const [isLoading, setIsLoading] = useState(true);

//     const isOnAuthPage =
//         location.pathname === "/authentication/login" ||
//         location.pathname === "/authentication/signup" ||
//         location.pathname === "/authentication/request-password-reset";

//     const login = async (email, password) => {
//         await request({
//             endpoint: "/api/v1/authentication/login",
//             method: "POST",
//             body: JSON.stringify({ email, password }),
//             onSuccess: ({ token }) => {
//                 localStorage.setItem("token", token);
//             },
//             onFailure: (error) => {
//                 throw new Error(error);
//             },
//         });
//     };

//     const ouathLogin = async (code, page) => {
//         await request({
//             endpoint: "/api/v1/authentication/oauth/google/login",
//             method: "POST",
//             body: JSON.stringify({ code, page }),
//             onSuccess: ({ token }) => {
//                 localStorage.setItem("token", token);
//             },
//             onFailure: (error) => {
//                 throw new Error(error);
//             },
//         });
//     };

//     const signup = async (email, password) => {
//         await request({
//             endpoint: "/api/v1/authentication/register",
//             method: "POST",
//             body: JSON.stringify({ email, password }),
//             onSuccess: ({ token }) => {
//                 localStorage.setItem("token", token);
//             },
//             onFailure: (error) => {
//                 throw new Error(error);
//             },
//         });
//     };

//     const logout = async () => {
//         localStorage.removeItem("token");
//         setUser(null);
//     };

//     useEffect(() => {
//         if (user) return;

//         setIsLoading(true);
//         const fetchUser = async () => {
//             await request({
//                 endpoint: "/api/v1/authentication/users/me",
//                 onSuccess: (data) => setUser(data),
//                 onFailure: (error) => {
//                     console.log(error);
//                 },
//             });
//             setIsLoading(false);
//         };

//         fetchUser();
//     }, [user, location.pathname]);

//     if (isLoading) {
//         return <Loader />;
//     }

//     if (!isLoading && !user && !isOnAuthPage) {
//         return <Navigate to="/authentication/login" state={{ from: location.pathname }} />;
//     }

    // if (user && !user.emailVerified && location.pathname !== "/authentication/verify-email") {
    //     return <Navigate to="/authentication/verify-email" />;
    // }

    // if (user && user.emailVerified && location.pathname === "/authentication/verify-email") {
    //     return <Navigate to="/" />;
    // }

    // if (
    //     user &&
    //     user.emailVerified &&
    //     !user.profileComplete &&
    //     !location.pathname.includes("/authentication/profile")
    // ) {
    //     return <Navigate to={`/authentication/profile/${user.id}`} />;
    // }

    // if (
    //     user &&
    //     user.emailVerified &&
    //     user.profileComplete &&
    //     location.pathname.includes("/authentication/profile")
    // ) {
    //     return <Navigate to="/" />;
    // }

//     if (user && isOnAuthPage) {
//         return <Navigate to={location.state?.from || "/"} />;
//     }

//     return (
//         <AuthenticationContext.Provider
//             value={{
//                 user,
//                 login,
//                 logout,
//                 signup,
//                 setUser,
//                 ouathLogin,
//             }}
//         >
//             <Outlet />
//         </AuthenticationContext.Provider>
//     );
// }
