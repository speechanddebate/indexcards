export function baseRepo(model, mapFunction) {
	const settingsAssoc = Object.values(model.associations).find(a => a.as.toLowerCase().endsWith('_settings'));
	async function getById(id, options = {}) {
		const include = [];

		if (options.settings && settingsAssoc) {
			include.push({
				model: settingsAssoc.target,
				as: settingsAssoc.as,
			});
		}
		var instance = await model.findByPk(id,
            include.length > 0 ? { include } : undefined
		);

		if (!instance) return null;

		return mapFunction(instance);
	}

	return {
		getById,
	};
}