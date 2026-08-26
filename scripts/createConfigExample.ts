import { writeFile } from "node:fs/promises";
import { ConfigSchema } from "../api/config.ts";

const defaultConfig = ConfigSchema.parse({
	db: {
		host: 'localhost',
		pass: 'root'
	}
});

await writeFile(
  "config/config.json.full",
  JSON.stringify(defaultConfig, null, 2) + "\n",
);
