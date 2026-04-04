import App from "./app.js";
import { createModules } from "./modules/index.js";

const app = new App(createModules());
app.start();
