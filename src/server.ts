import { createApp, startApp } from "./app.js";
import { createModules } from "./modules/index.js";

const app = createApp(createModules());
startApp(app);
