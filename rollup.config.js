import terser from "@rollup/plugin-terser";

export default {
	input: 'src/main.js',
	output: {
		file: 'app/assets/scripts/app.js',
		format: 'iife',
    compact: true,
    minifyInternalExports: true,
		plugins: [terser()]
	}
};