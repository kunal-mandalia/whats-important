import './App.css';
import HomePage from './HomePage';
import { SettingsPage } from './Settings';
import { SplashScreen } from './SplashScreen';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/splash",
    element: <SplashScreen />,
  },
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: '/settings',
    element: <SettingsPage />,
  }
]);

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
