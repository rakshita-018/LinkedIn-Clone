import { Outlet } from "react-router-dom";
import { WebSocketContextProvider } from "../../features/ws/Ws";

import "./ApplicationLayout.css";
import { Header } from "../Header/Header";

export function ApplicationLayout() {
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
