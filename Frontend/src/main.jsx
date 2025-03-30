import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { Feed } from './features/feed/pages/Feed/Feed'
import {Login} from './features/authentication/pages/login/Login'
import {Signup} from './features/authentication/pages/signup/Signup'
import {ResetPassword} from './features/authentication/pages/resetPassword/ResetPassword'
import {VerifyEmail} from './features/authentication/pages/verifyEmail/VerifyEmail'
import { AuthenticationContextProvider } from './features/authentication/contexts/AuthenticationContextProvider'
import { AuthenticationLayout } from './features/authentication/components/authenticationLayout/AuthenticationLayout'
import { ApplicationLayout } from './components/applicationLayout/ApplicationLayout'
import { Profile } from './features/authentication/pages/profile/Profile'

const router = createBrowserRouter([

  {
    element: <AuthenticationContextProvider/>,
    children: [
      {
        path: '/',
        element: <ApplicationLayout/>,
        children: [
          {
            index: true,
            element: <Feed/>,
          },
          {
            path: "network",
            element: <div>Network</div>
          },
          {
            path: "job",
            element: <div>Job</div>
          },
          {
            path: "messaging",
            element: <div>Messaging</div>
          },
          {
            path: "notifications",
            element: <div>Notifications</div>
          },
          {
            path: "profile/:id",
            element: <div>Profile</div>
          },
          {
            path: "settings",
            element: <div>Settings & Privacy</div>
          },
        ]
      },
      {
        path: "/authentication",
        element: <AuthenticationLayout/>,
        children: [
        {
          path: 'login',
          element: <Login/>,
        },
        {
          path: 'signup',
          element: <Signup/>,
        },
        {
          path: 'request-password-reset',
          element: <ResetPassword/>,
        },
        {
          path: 'verify-email',
          element: <VerifyEmail/>,
        },
        {
          path: 'profile/:id',
          element: <Profile/>,
        }
        ]
      },
      {
        path: '*',
        element: <Navigate to="/"/>,
      }
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
