import { mergeConfig } from 'vite';
import base from './vite.config';
export default mergeConfig(base,{build:{outDir:'../preview-build',rolldownOptions:{output:{inlineDynamicImports:true}}}});
