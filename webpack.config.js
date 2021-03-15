const path = require('path');

module.exports = {
	target: 'node',
	mode: 'development',
	entry: {
		changelog: './bin/changelog.ts',
		release: './bin/release.ts',
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.(mustache)$/i,
				type: 'asset/source',
			},
		],
	},
	resolve: {
		extensions: ['.ts', '.js'],
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'build'),
	},
	watch: true,
};
