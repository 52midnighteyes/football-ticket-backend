import app from "./app.js";
import { PORT } from "./config/config.js";
import { startExpirationCron } from "./jobs/expiration-cron.job.js";

startExpirationCron();
app.listen(PORT, () => console.log(`server running on port ${PORT}`));
