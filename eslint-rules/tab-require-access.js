export default {
	meta: {
		type: 'problem',
		docs: {
			description: 'Ensure all /tab routes call requireAccess',
		},
		schema: [],
	},

	create(context) {

		// Check if any of the middleware args includes requireAccess
		function hasRequireAccess(middlewares) {
			return middlewares.some((mw) => {
				if (mw.type === 'Identifier') return mw.name === 'requireAccess';
				if (mw.type === 'CallExpression') return mw.callee.name === 'requireAccess';
				return false;
			});
		}

		const filename = context.getFilename().replace(/\\/g, '/');

		return {
			CallExpression(node) {
			// Only enforce on /v1/tab files
				if (!filename.includes('/tab/')) return;

				// Simple router.method(...)
				if (
					node.callee.type === 'MemberExpression' &&
			node.callee.object.name === 'router' &&
			['get', 'post', 'put', 'delete', 'all', 'patch'].includes(node.callee.property.name)
				) {
					const middlewares = node.arguments.slice(1);
					if (!hasRequireAccess(middlewares)) {
						context.report({
							node,
							message: 'All tab routes must include a call to requireAccess',
						});
					}
					return;
				}

				// router.route(...).method(...)
				if (
					node.callee.type === 'MemberExpression' &&
			node.callee.object.type === 'CallExpression' &&
			node.callee.object.callee.type === 'MemberExpression' &&
			node.callee.object.callee.object.name === 'router' &&
			node.callee.object.callee.property.name === 'route' &&
			['get', 'post', 'put', 'delete', 'all', 'patch'].includes(node.callee.property.name)
				) {
					// Check for .all(...)
					if (node.callee.property.name === 'all') {
						const middlewares = node.arguments;
						if (!hasRequireAccess(middlewares)) {
							context.report({
								node,
								message: 'All tab routes must include a call to requireAccess',
							});
						}
						return;
					}

					// Other methods: we only require access if .all(...) wasn't used
					// We'll assume requireAccess must be defined for each individual method
					const middlewares = node.arguments;
					if (!hasRequireAccess(middlewares)) {
						context.report({
							node,
							message: 'All tab route methods must include a call to requireAccess',
						});
					}
				}
			},
		};
	},
};
