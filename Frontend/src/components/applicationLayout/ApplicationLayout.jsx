import { Outlet } from "react-router-dom";
import { WebSocketContextProvider } from "../../features/ws/Ws";

import "./ApplicationLayout.css";
import { Header } from "../header/Header";
import { usePageTitle } from "../../hooks/usePageTitle";
export function ApplicationLayout() {
  usePageTitle("Home")
  return (
    <WebSocketContextProvider>
      <div className="appLayout-root">
        <Header/>
        <main className="app-container">
          <Outlet />
        </main>
      </div>
    </WebSocketContextProvider>
  );
}
