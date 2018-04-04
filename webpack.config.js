/*eslint-env node*/
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: './src/index.js',
	devtool: 'eval',
	devServer: {
		contentBase: path.join(__dirname, 'dist'),
		compress: true
	},
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist')
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: 'css-loader'
				})
			}
		]
	},
	plugins: [
		new ExtractTextPlugin('styles.css'),
		new HTMLWebpackPlugin({ template: 'src/index.html' })
	]
};
