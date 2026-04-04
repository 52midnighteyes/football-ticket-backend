import app from "./app.js";
import { PORT } from "./config/config.js";

app.listen(PORT, () => `server running on port ${PORT}`);
