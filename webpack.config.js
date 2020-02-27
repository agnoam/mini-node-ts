const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: './src/server.ts',
    mode: 'production',
    target: 'node',
    externals: [ nodeExternals() ],
    module: {
        rules: [
            { test: /\.ts$/, use: 'ts-loader' }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js', '.json']
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'server.bundle.js'
    }
}