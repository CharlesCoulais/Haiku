import terser from "@rollup/plugin-terser";

export default {
	input: 'src/main.js',
	output: {
		file: 'assets/scripts/app.js',
		format: 'iife',
    compact: true,
    minifyInternalExports: true,
		plugins: [terser()]
	}
};