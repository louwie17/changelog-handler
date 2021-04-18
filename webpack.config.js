const path = require('path');
const webpack = require('webpack');

module.exports = {
	target: 'node',
	mode: 'production',
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
	plugins: [
		new webpack.BannerPlugin({
			banner: '#!/usr/bin/env node',
			raw: true,
		}),
	],
};
