module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	modulePathIgnorePatterns: ['<rootDir>/build/', '<rootDir>/node_modules/'],
	transform: {
		'\\.(mustache)$': '<rootDir>/tests/rawLoader.js',
	},
};
