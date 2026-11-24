import 'dotenv/config';
import { app } from './app.js';
const port = Number(process.env.PORT ?? process.env.BACKEND_PORT ?? 3000);
app.listen(port, '0.0.0.0', () => console.log(`ShiftFlow API listening on port ${port}`));
