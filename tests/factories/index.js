const modules = import.meta.glob('./*.js', { eager: true });

const factories = {};

for (const path in modules) {
	const name = path
    .replace('./', '')
    .replace('.js', '');

	factories[name] = modules[path].default;
}

export default factories;