import { createRoot } from "react-dom/client";
import { Provider } from "@/components/ui/provider";

import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";
import { SocketProvider } from "./Contexts/socketContext";

createRoot(document.getElementById("root")).render(
  <RecoilRoot>
    <Provider>
      <BrowserRouter>
        <SocketProvider>
          <App />
        </SocketProvider>
      </BrowserRouter>
    </Provider>
  </RecoilRoot>
);
