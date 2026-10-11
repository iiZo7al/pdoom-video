#!/usr/bin/env bun
import path from 'node:path';
import {mkdirSync,existsSync,renameSync,rmSync} from 'node:fs';
import audio from '../../data/audio.json';
import { startRenderServer, type RenderServer } from './render-server';
const args=process.argv.slice(2);
const opt=(k:string,d:string)=>{const i=args.indexOf('--'+k);return i<0?d:args[i+1]!;};
const scale=Number(opt('scale','1')),fps=Number(opt('fps','60'));
if(!Number.isFinite(scale)||scale<0.1||scale>4||![30,60,120].includes(fps))throw new Error('Invalid scale or FPS');
const width=2*Math.round(1920*scale/2),height=2*Math.round(1080*scale/2);
const out=path.resolve(opt('out','../out/pdoom-arabic.mp4'));
const folder=out+'.parts-native-v6';mkdirSync(folder,{recursive:true});
const duration=Number(opt('to',String(audio.duration)));
const total=Math.round(duration*fps),step=5*fps;
async function valid(file:string,n:number){
 if(!existsSync(file))return false;
 const p=Bun.spawn(['ffprobe','-v','error','-select_streams','v:0','-count_frames','-show_entries','stream=width,height,r_frame_rate,nb_read_frames','-of','json',file],{stdout:'pipe',stderr:'ignore'});
 const text=await new Response(p.stdout).text();if(await p.exited!==0)return false;
 try{const s=JSON.parse(text).streams[0];return s.width===width&&s.height===height&&s.r_frame_rate===fps+'/1'&&Number(s.nb_read_frames)===n;}catch{return false;}
}
const files:string[]=[];const started=Date.now();let rendered=0;
let server: RenderServer | undefined;
try {
for(let frame=0,i=0;frame<total;frame+=step,i++){
 const end=Math.min(total,frame+step),n=end-frame;
 const file=path.join(folder,String(i).padStart(4,'0')+'.mp4');files.push(file);
 if(await valid(file,n)){console.log(`Resuming: ${end}/${total} frames already saved`);continue;}
 const temp=file+'.partial.mp4';rmSync(temp,{force:true});
 console.log(`\nPart ${i+1}/${Math.ceil(total/step)} | total progress ${frame}/${total} frames`);
 let completed = false;
 for (let attempt = 1; attempt <= 3; attempt++) {
  rmSync(temp,{force:true});
  try {
   server ??= await startRenderServer();
   const p=Bun.spawn([process.execPath,path.join(import.meta.dir,'render.ts'),'video','--url',server.url,'--from',String(frame/fps),'--to',String(end/fps),'--scale',String(scale),'--fps',String(fps),'--samples','1','--shutter','0.2','--workers','1','--chunk','4','--mem-gb','0.15','--spool-gb','1','--preset','veryfast','--crf','21','--noaudio','--out',temp],{cwd:path.resolve(import.meta.dir,'..'),stdout:'inherit',stderr:'inherit'});
   const code = await p.exited;
   if(code!==0||!await valid(temp,n))throw new Error(`Render process failed (exit ${code}) or its frames are incomplete`);
   completed = true;
   break;
  } catch (e) {
   console.error(`Part ${i+1}, attempt ${attempt}/3: ${e instanceof Error ? e.message : String(e)}`);
   await server?.stop(); server = undefined;
   if (attempt < 3) {
    console.log('Restarting the render server and retrying this part. Saved parts are kept.');
    await Bun.sleep(1000);
   }
  }
 }
 if(!completed)throw new Error('Part failed after 3 attempts. Run the same CMD again to resume completed parts.');
 renameSync(temp,file);rendered+=n;
 const rate=rendered/((Date.now()-started)/1000);
 console.log(`Saved ${end}/${total} frames | ${rate.toFixed(2)} fps including loading | ETA ${Math.ceil((total-end)/rate)}s`);
}
} finally { await server?.stop(); }
// Relative filenames avoid Windows drive/path escaping in the concat list.
const list=path.join(folder,'concat.txt');await Bun.write(list,files.map(f=>`file '${path.basename(f)}'`).join('\n')+'\n');
const temp=out+'.assembling.mp4';
const ff=Bun.spawn(['ffmpeg','-y','-v','error','-f','concat','-safe','0','-i',list,'-i',path.resolve(import.meta.dir,'../../audio/pdoom.mp3'),'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','320k','-t',String(total/fps),'-movflags','+faststart',temp],{stdout:'inherit',stderr:'inherit'});
if(await ff.exited!==0||!await valid(temp,total))throw new Error('Final assembly failed. Completed parts are preserved.');
renameSync(temp,out);console.log(`DONE: ${out}`);
