import {createElement} from "react";
import { App } from "./App";
import { createRoot } from "react-dom/client";

const rootElement = document.getElementById("root") as HTMLElement;
const root = createRoot(rootElement);

root.render(createElement(
    App
));