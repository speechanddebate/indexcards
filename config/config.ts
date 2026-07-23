import fs from 'fs';
import path from 'path';
import { z } from 'zod';

// Zod doesn't have a great way to say if the object isn't present, build it with it's defaults so this is my solution
function withSchemaDefaults<T extends z.ZodObject<any>>(schema: T): z.ZodDefault<T> {
  return schema.default(() => schema.parse({}) as any);
}

// Zod schema with built-in defaults for runtime config
const RuntimeConfigSchema = z.object({
  DOCKERHOST: z.string().default(''),
  ERROR_DESTINATION: z.array(z.string()).default(['errors@tabroom.com']),
  HIDE_DEV_ENDPOINTS: z.boolean().default(true),
  PROXY_NUMBER: z.number().default(0),
  PORT: z.number().default(8001),
  TRUSTED_ORIGINS: z.array(z.string()).default(['']),
  BASE_URL: z.string().default('localhost'),
  DB: withSchemaDefaults(z.object({
    HOST: z.string(),
    PORT: z.number().default(3306),
    USER: z.string(),
    PASS: z.string(),
    DATABASE: z.string().default('tabroom'),
    SLOW_QUERY_MS: z.number().default(5000),
    sequelizeOptions: withSchemaDefaults(z.object({
      dialect: z.enum(['mariadb', 'mysql', 'postgres', 'sqlite']).default('mariadb'),
      logging: z.boolean().default(true),
      define: withSchemaDefaults(z.object({
        freezeTableName: z.boolean().default(true),
        modelName: z.string().default('singularName'),
        underscored: z.boolean().default(true),
        timestamps: z.boolean().default(false),
      })),
    })),
  })),
  logging: withSchemaDefaults(z.object({
    level: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
	console: withSchemaDefaults(z.object({
		silent: z.boolean().default(false),
		level: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
	})),
	file: withSchemaDefaults(z.object({
		path: z.string().optional(),
		maxSize: z.number().default(10485760), // 10 MB
		maxFiles: z.number().default(8),
		tailable: z.boolean().default(true)
	})),
	loki: z.object({
		host: z.string(),
	}).optional()
  })),
  ratelimit: withSchemaDefaults(z.object({
    window: z.number().default(15 * 60 * 1000),
    max: z.number().default(100000),
	delay: z.number().default(0),
	message: withSchemaDefaults(z.object({
		max: z.number().default(15 * 1000),
		window: z.number().default(1),
	})),
	search: withSchemaDefaults(z.object({
		max: z.number().default(5),
		window: z.number().default(30 * 1000),
	})),
  })),
  jitsi: z.object({
	key: z.string(),
	uri: z.string().default('https://campus.speechanddebate.org'),
  }).optional(),
  caselist: z.object({
	key: z.string()
  }).optional(),
  cookie: withSchemaDefaults(z.object({
    name: z.string().default('TabroomToken'),
    domain: z.string().default('localhost'),
  })),
}).strict();

type RuntimeConfig = z.infer<typeof RuntimeConfigSchema>;

// Load a config file from path
function loadConfigFile(filePath: string): Record<string, any> {
  try {
    if (!fs.existsSync(filePath)) {
      return {};
    }
    const configText = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(configText);
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.warn(`Invalid JSON in ${filePath}: ${error.message}`);
    } else {
      console.warn(`Error loading ${filePath}: ${error}`);
    }
    return {};
  }
}

// Load and validate runtime config from JSON files
async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  const configDir = process.env.CONFIG_DIR || './config';
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  const baseConfigPath = path.join(configDir, 'config.json');
  const envConfigPath = path.join(configDir, `config.${nodeEnv}.json`);

  // Load base config
  const baseConfig = loadConfigFile(baseConfigPath);
  if (Object.keys(baseConfig).length > 0) {
    console.info(`Loaded base configuration from ${baseConfigPath}`);
  }

  // Load environment-specific override
  const envConfig = loadConfigFile(envConfigPath);
  if (Object.keys(envConfig).length > 0) {
    console.info(`Loaded ${nodeEnv}-specific overrides from ${envConfigPath}`);
  }

  // Merge: base → env-specific
  const mergedData = { ...baseConfig, ...envConfig };

  // Validate against schema
  try {
    const validated = RuntimeConfigSchema.parse(mergedData);
    console.info('Configuration validated successfully against schema');
    
    return validated;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Configuration validation error:', error.issues);
      throw new Error(`Invalid configuration: ${error.message}`);
    }
    throw error;
  }
}

// Load runtime config with schema defaults
const config = await loadRuntimeConfig();

console.log(JSON.stringify(config, null, 2));

export default config;

