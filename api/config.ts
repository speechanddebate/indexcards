import fs from 'fs';
import path from 'path';
import z from 'zod';

/** This schema defines the app config. add comments to a config value to get descriptions at usage. */
const ConfigSchema = z.object({
	//----------------------------------------------------------------------
	// SERVER
	// ---------------------------------------------------------------------
	host: z.string().min(1).default('0.0.0.0'),
	port: z.number().int().min(1).max(65535).default(8001),
	dockerhost: z.string().default(process.env.DOCKERHOST ?? 'unknown'),
	/** An IP address, subnet, or an array of IP addresses and subnets to trust as being a reverse proxy. */
	proxy: z.array(z.string().min(1)).min(1).optional(),
	//--------------------------------------------------------------------------
	// DATABASE 
	// ------------------------------------------------------------------------
	db: z.object({
		host: z.string(),
		port: z.int().min(1).max(65535).default(3306),
		database: z.string().default('tabroom'),
		user: z.string().default('root'),
		pass: z.string().min(1),
		sequelizeOptions : z.object({
			dialect : z.string().default('mariadb'),
			define  : z.object({
				freezeTableName : z.boolean().default(true),
				modelName       : z.string().default('singularName'),
				underscored     : z.boolean().default(true),
				timestamps      : z.boolean().default(false),
			}).prefault({}),
		}).prefault({}),
	}),
	//------------------------------------------------------------------------------
	// SECURITY
	// -----------------------------------------------------------------------------
	/** a shared secret with classic tabroom. used for shared sessions*/
	shared_secret: z.string().default(''),
	cors: z.object({
		origins: z.array(z.string().min(1)).default(['*.tabroom.com','tabroom.com']),
	}).prefault({}),
	cookie: z.object({
		name: z.string().default('TabroomToken'),
		domain: z.string().default('.tabroom.com'),
	}).prefault({}),
	csrf: z.object({
		trusted_origins: z.array(z.string()).default(['*.tabroom.com','tabroom.com']),
	}).prefault({}),
	ratelimiter: z.object({
		enabled: z.boolean().default(true),
		window: z.int().default(15*60*1000), // 15 mins
		max: z.int().default(100000),
		delay: z.int().default(0),
		message: z.object({
			window: z.int().default(1),
			max: z.int().default(15*1000),
		}).prefault({}),
		search: z.object({
			window: z.int().default(30*1000),
			max: z.int().default(5),
		}).prefault({}),
	}).prefault({}),
	// -----------------------------------------------------------------
	// LOGGING
	// ----------------------------------------------------------------
	logging: z.object({
		level: z.enum(['error','warn','info','http','verbose','debug','silly']).default('info'),
		/** The value that sets what is considered a slow query for logging */
		slowQueryLimit: z.int().default(5000),
		file: z.object({
			/** The file path to log to. */
			path: z.string().min(1),
		}).optional(),
	}).prefault({}),
	ERROR_DESTINATION: z.string().optional(), // only used in errorHandler
	//--------------------------------------------------------------------
	// EXTERNAL SERVICES
	// -------------------------------------------------------------------
	aws: z.object({
		S3_URL: z.string().default('https://s3.amazonaws.com/tabroom-files/'),
	}).prefault({}),
	jitsi: z.object({
		key: z.string(),
		uri: z.string().default('https://campus.speechanddebate.org'),
	}).optional(),
	GEMINI_API_KEY: z.string().optional(), //only used in paradigmAnalyzer
	mail: z.object({
		test: z.boolean().default(true),
		from: z.string().default('live@www.tabroom.com'),
		server: z.string().default('localhost'),
		port: z.int().default(25),
		pool: z.int().positive().default(128),
		admin: z.object({
		secure: z.boolean().default(false),	
		server: z.string().default('localhost'),
		port: z.int().default(25),
		pool: z.int().positive().default(128),
		}).optional(),
	}).prefault({}),
	//--------------------------------------------------------------------
	// MISC
	// -------------------------------------------------------------------
	/** feature flags */
	features: z.object({
		/** Hide in-progress endpoints */
		HIDE_DEV_ENDPOINTS: z.boolean().default(true)
	}).prefault({}),
	ip: z.object({
		locationDB: z.string().default('/var/lib/GeoIP/GeoLite2-City.mmdb'),
		ispDB: z.string().default('/var/lib/GeoIP/GeoIP2-ISP.mmdb'),
	}).prefault({}),
}).strict();

type RuntimeConfig = z.infer<typeof ConfigSchema>;

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
    const validated = ConfigSchema.parse(mergedData);
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

export default config;
