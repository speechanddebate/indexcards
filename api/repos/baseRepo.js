export function baseRepo(model, mapFunction) {

	function getSettingsAlias() {
		return Object.values(model.associations).find(a => a.as.toLowerCase().endsWith('_settings'))?.as || null;
	}

	async function getById(id, options = {}) {
		const include = [];

		if (options.settings && getSettingsAlias()) {
			include.push({
				model: model.associations[getSettingsAlias()].target,
				as: getSettingsAlias(),
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
