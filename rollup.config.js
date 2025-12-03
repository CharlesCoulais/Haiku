import terser from "@rollup/plugin-terser";
import html from "rollup-plugin-html";
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default [
	{
		input: 'src/main.js',
		plugins: [
			nodeResolve(),
			html({
				include: "**/*.html",
			}),
		],
		output: {
			file: 'app/assets/scripts/app.js',
			format: 'iife',
			compact: true,
			minifyInternalExports: true,
			plugins: [terser()],
			sourcemap: true,
		},
	},
	{
		input: 'src/background.js',
		output: {
			file: 'app/assets/scripts/background.js',
			format: 'iife',
			compact: true,
			minifyInternalExports: true,
			plugins: [terser()],
			sourcemap: true,
		},
	},
];