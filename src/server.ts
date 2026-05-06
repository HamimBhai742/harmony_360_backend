import app from './app';
import { config } from './app/config';

app.listen(config.port, () => {
  console.log(`Harmony 360 server running on port ${config.port}`);
});
