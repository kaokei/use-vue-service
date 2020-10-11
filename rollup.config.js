import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import resolve from "rollup-plugin-node-resolve";

export default {
  input: "./src/index.ts",
  plugins: [
    commonjs(),
    resolve(),
    typescript({
      exclude: "node_modules/**",
      typescript: require("typescript"),
    }),
    terser(),
  ],
  external: ["vue", "reflect-metadata"],
  output: [
    {
      format: "cjs",
      file: "lib/bundle.cjs.js",
    },
    {
      format: "es",
      file: "lib/bundle.esm.js",
    },
  ],
};
