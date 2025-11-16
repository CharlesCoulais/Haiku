import terser from "@rollup/plugin-terser";

export default {
	input: 'src/main.js',
	output: {
		file: 'bundle.js',
		format: 'iife',
    compact: true,
    minifyInternalExports: true,
		plugins: [terser()]
	}
};