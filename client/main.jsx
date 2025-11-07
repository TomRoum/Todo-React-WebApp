import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./src/screens/App";
import Authentication, {
  AuthenticationMode,
} from "./src/screens/Authentication";
import ProtectedRoute from "./src/components/ProtectedRoute";
import UserProvider from "./src/context/userProvider";
import { RouterProvider } from "react-router-dom";
import { createBrowserRouter } from "react-router-dom";
import NotFound from "./src/screens/NotFound";

const router = createBrowserRouter([
  {
    errorElement: <NotFound />,
  },
  {
    path: "/signin",
    element: <Authentication authenticationMode={AuthenticationMode.SignIn} />,
  },
  {
    path: "/signup",
    element: <Authentication authenticationMode={AuthenticationMode.SignUp} />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <App />,
      },
    ],
  },
]);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  </StrictMode>
);
