import './App.css';
import MainPage from './MainPage';
import { SettingsPage } from './Settings';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainPage />,
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
