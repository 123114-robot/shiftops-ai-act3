import 'dotenv/config';
import { app } from './app.js';
const port = Number(process.env.BACKEND_PORT ?? 3000);
app.listen(port, () => console.log(`ShiftFlow API listening on port ${port}`));
