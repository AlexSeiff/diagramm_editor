// Compatibility entry point for the former standalone table check.
const {spawnSync}=require('node:child_process');
const result=spawnSync(process.execPath,['--test','tests/model.test.mjs'],{cwd:__dirname,stdio:'inherit'});
process.exitCode=result.status??1;
