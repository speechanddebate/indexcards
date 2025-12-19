
export const tabroomLinter = {
	'rules' : {

		'no-else-return'           : 1,
		'operator-linebreak'       : 0,
		'class-methods-use-this'   : 0,
		'prefer-regex-literals'    : 0,
		'default-param-last'       : 0,
		'no-tabs'                  : 0,
		'no-use-before-define'     : 0,
		'comma-spacing'            : 0,
		'implicit-arrow-linebreak' : 0,
		'global-require'           : 0,
		'padded-blocks'            : 0,
  		'no-mixed-spaces-and-tabs' : 1,
		'no-trailing-spaces'       : 1,
		'no-lonely-if'             : 0,
		'object-curly-newline'     : 0,
		'prefer-destructuring'     : 0,
		'no-console'               : 0,
		'func-names'               : 0,
		'function-paren-newline'   : 0,
		'no-param-reassign'        : 0,
		'no-buffer-constructor'    : 0,
		'radix'                    : 0,
		'consistent-return'        : 0,
		'arrow-body-style'         : 0,
		'arrow-parens'             : 0,
		'no-underscore-dangle'     : 0,

		'no-return-assign' : [2, 'except-parens'],

		'quotes' : [
			2,
			'single',
			{
				'avoidEscape': true,
				'allowTemplateLiterals': true
			}
		],

		'camelcase' : [
			2,
			{
				'properties': 'never',
				'allow': ['UNSAFE_componentWillMount', 'UNSAFE_componentWillReceiveProps'],
			}
		],

		'no-shadow' : [
			2,
			{
				'builtinGlobals' : false,
				'hoist' : 'functions',
				'allow': ['err', 'error', 'req', 'res', 'request', 'response', 'rows', 'done', 'next', 'callback', 'props']
			}
		],

		'no-unused-vars' : [
			2,
			{
				'argsIgnorePattern': 'err|rows|req|res|next'
			}
		],

		'indent': [
			'error',
			'tab',
			{
				'SwitchCase'             : 1,
				'MemberExpression'       : 'off',
				'flatTernaryExpressions' : true,
				'ignoredNodes'           : ['ConditionalExpression']
			}
		],

		'no-restricted-syntax'	: [
			'error',
			'LabeledStatement',
			'WithStatement'
		],

		'no-multi-spaces': [
			0,
			{
				'exceptions' : {
					'Property'           : true,
					'VariableDeclarator' : true
				}
			}
		],
		'no-multiple-empty-lines' : [
			'error', {
				'max'    : 1,
				'maxEOF' : 1
			}
		],

		'comma-dangle': ['error',
			{
				'arrays'	: 'always-multiline',
				'objects'   : 'always-multiline',
				'imports'   : 'always-multiline',
				'exports'   : 'always-multiline',
				'functions' : 'ignore',
			}
		],
		'max-len': ['error',
			128,
			2,
			{
				ignoreUrls             : true,
				ignoreComments         : true,
				ignoreRegExpLiterals   : true,
				ignoreStrings          : true,
				ignoreTemplateLiterals : true,
			}
		],

		'import/no-named-as-default'        : 0,
		'import/no-mutable-exports'         : 0,
		'import/no-extraneous-dependencies' : 0,
		'import/no-useless-path-segments'   : 1,
		'import/no-named-as-default-member' : 0,
		'import/extensions'                 : 0,
		'import/namespace'                  : 0,
	}
};

export default tabroomLinter;
