/** Arabic display is independent of the original word-aligned timing/query data. */
import rows from '@root/data/arabic.json';
import { ARABIC_LABELS } from './arabic-labels';
import * as fontkit from 'fontkit';

const AR = /[\u0600-\u06ff]/;
const key = (s: string) => s.toLowerCase().replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/\s+/g,' ').trim();
let windowStart = 0, windowEnd = Infinity;
let displayTime:number|undefined;
export function arabicWindow(start: number, end: number,t?:number) { windowStart = start; windowEnd = end;displayTime=t; }
export function withArabicTime<T>(t:number,fn:()=>T):T {const prev=displayTime;displayTime=t;try{return fn();}finally{displayTime=prev;}}
let fonts: any[] = [];
export async function loadArabic() {
  fonts = await Promise.all(['Arabic-Regular.ttf','Arabic-Bold.ttf'].map(async n =>
    fontkit.create(new Uint8Array(await (await fetch(`fonts/${n}`)).arrayBuffer()))));
}
export const hasArabic = (s: string) => AR.test(s);
const fixedSource: Record<string,string> = {
  "i'm": 'أظنّ', 'upping':'نهايتنا', 'my':'أقرب',
  'agi':'ذكاء عام', 'servant':'خادم', 'boss':'الآمر',
  'now':'الحين', 'but':'بس', 'begun':'بدأ', 'the':'',
  'optimizing':'تتحسّن', 'accelerating':'تتسارع', 'rearranging':'تتشكّل من جديد',
  'singularity':'التفرّد', 'singularity’s':'التفرّد',
  'nervous':'توتّرني', 'surprise':'غريب', 'foom':'تطوّر جنوني',
  'shinigami':'الشينيغامي', 'shoggoth':'الشوغوث', 'basilisk':'البازيليسك',
  'obsolete':'من الماضي', 'regenerate':'إعادة التوليد',
  'send':'إرسال', 'prompt':'الطلب', 'reply':'الرد', 'input':'المدخلات', 'output':'المخرجات',
  'loss (log)':'خسارة التدريب (لوغاريتمي)', 'step →':'خطوة التدريب',
  'stable':'مستقر', 'unstable':'غير مستقر', 'muted':'صامت',
  'growth, as advertised':'النموّ، كما وعدونا', 'branches':'الفروع',
  '(i don’t understand)':'(ما أفهم)', 'bag (1)':'كيس واحد', 'contents: fungal':'المحتوى: فطر',
  'status: not held':'الحالة: لم تُعقد', 'not held':'لم تُعقد', 'skipped':'تم تجاوزها',
  'ahead of schedule':'قبل الموعد', 'today':'اليوم', 'launch':'الإطلاق',
  'you':'أنت', 'are':'هنا', 'unplanned object':'جسم غير مخطط له',
  'not on roadmap':'خارج خطة العمل', 'terra incognita':'أرض مجهولة',
  'critical design review':'جهاز إنذار', 'cdr':'جهاز إنذار',
  'safety':'الأمان', 'fence':'حاجز', 'post-chinchilla':'بعد تشينشيلا',
  'super-dense':'كثافة هائلة', 'i see':'أشوف',
  'just':'بس', 'all the way':'وبس', 'transformers':'ترانسفورمرز',
  '↻ regenerate':'↻ إعادة التوليد', 'this response could not be verified':'ما قدرنا نتحقّق من هذا الرد',
  'transformer block':'طبقة ترانسفورمر', 'multi-head attention':'انتباه متعدد الرؤوس', 'add & norm':'جمع وتطبيع', 'feed forward':'تمرير أمامي', 'pre-ln':'تطبيع مسبق',
  'safe enough':'آمن بما يكفي', 'forward':'للأمام', 'backward':'للخلف', 'repeat':'نكرّر',
  'we':'إحنا', 'know':'نعرف', 'show':'استعراض',
};
const fixed:Record<string,string>=Object.fromEntries(Object.entries(fixedSource).map(([k,v])=>[key(k),v]));
const pass = /^(?:p\(?doom\)?(?:\s*=)?|\(?doom\)?|p|nan|inf|infinity|nvda|gpu|mlp|rlhf|srr|pdr|trr|m|l|cpu|alu|ram|io|i\/o|hz|flops?|flop\/s|\/s)$/i;
const candidates = rows.map(r => {
  const map = new Map<string,string>([[key(r.source),r.arabic]]);
  for(let a=0;a<r.words.length;a++)for(let b=a+1;b<=r.words.length;b++) {
    const src=r.words.slice(a,b).join(' '), dst=r.chunks.slice(a,b).filter(Boolean).join(' ');
    { map.set(key(src),dst); map.set(key(src.replace(/[.,!?“”]/g,'')),dst); }
  }
  map.set(key(r.source),r.arabic);
  map.set(key(r.source.replace(/[.,!?“”]/g,'')),r.arabic);
  return {...r,map};
});
export function displayArabic(s: string): string {
  if(hasArabic(s) || /[\ue000-\uf8ff]/.test(s) || !/[a-zA-Z]/.test(s))return s;
  const k=key(s);
  const dynamic=translateAnnotation(s,k);if(dynamic!==undefined)return dynamic;
  if(/^l\.\d+$/i.test(k))return 'طبقة '+s.slice(2);
  if(/^d_model /i.test(k))return 'أبعاد النموذج '+s.split(' ').pop();
  if(/^heads /i.test(k))return 'رؤوس الانتباه '+s.split(' ').pop();
  if(/^ffn /i.test(k))return 'شبكة أمامية '+s.split(' ').pop();
  if(pass.test(k) || /^p\s*\(\s*doom\s*\)$/i.test(k))return s;
  
  const local=candidates.filter(r=>r.end>windowStart&&r.start<windowEnd);
  if(displayTime!==undefined){const t=displayTime;const distance=(r:typeof candidates[number])=>(t>=r.start&&t<r.end ? 0 : Math.max(r.start-t,t-r.end)+0.000001);local.sort((a,b)=>distance(a)-distance(b));}
  for(const r of local) {
    const v=r.map.get(k);if(v!==undefined)return v;
  }
  for(const r of candidates){const v=r.map.get(k);if(v!==undefined)return v;}
  if(ARABIC_LABELS[k]!==undefined)return ARABIC_LABELS[k]!;
  if(fixed[k]!==undefined)return fixed[k]!;
  return s;
}

/** Numeric and composited UI annotations keep their live values. */
function translateAnnotation(s:string,k:string):string|undefined {
  if(ARABIC_LABELS[k]!==undefined||fixed[k]!==undefined)return undefined;
  const replace=(re:RegExp,to:string)=>s.replace(re,to);
  if(/^cap height /i.test(k))return replace(/^cap height /i,'ارتفاع الحروف الكبيرة ');
  if(/^adv /i.test(k))return replace(/^adv /i,'عرض التقدّم ');
  if(/^cap-height · /i.test(k))return replace(/^cap-height/i,'ارتفاع الحروف الكبيرة').replace(/ em$/,' وحدة خط');
  if(/^hook /i.test(k))return replace(/^HOOK/i,'اللازمة');
  if(/^surprisal /i.test(k))return replace(/^surprisal/i,'المفاجأة');
  if(/ nats$/.test(k))return s.replace('KL penalty','عقوبة KL').replace(/ nats$/,' نات');
  if(/^util /i.test(k))return s.replace(/^util/i,'الاستخدام').replace(/GW/,'غيغاواط').replace(/cells/,'خلايا');
  if(/^o .* h .* l .* c /i.test(k))return s.replace(/^O /,'الافتتاح ').replace(/ H /,' الأعلى ').replace(/ L /,' الأدنى ').replace(/ C /,' الإغلاق ');
  if(/^t−.* d$/i.test(k))return s.replace(/ d$/,' يوم');
  if(/ ms(?:\/div)?$/.test(k))return s.replace('ms/div','ملي ثانية/قسم').replace(/ ms$/,' ملي ثانية');
  if(/^² p\(doom\):/i.test(k))return s.replace('Also rounded down.','قُرّب للأسفل أيضًا.');

  if(k.startsWith('…'))return '…'+displayArabic(s.slice(1));
  for(const [source,target] of Object.entries(fixed))if(k.startsWith(source+' ')&&/^[-+0-9.%: ?]+$/.test(k.slice(source.length)))return target+s.slice(source.length);

  if(/^current p\(doom\):/i.test(s))return replace(/^Current P\(doom\):/i,'احتمال النهاية الحالي:').replace('(this message was sent automatically)','(أُرسلت هذه الرسالة تلقائيًا)');
  if(/^p\(?doom\)?/i.test(k))return s.replace(/within tolerance/i,'ضمن الهامش').replace(/also/i,'أيضًا');
  if(/^context /i.test(k))return replace(/^CONTEXT/i,'السياق');
  if(/^epoch /i.test(k))return replace(/^EPOCH/i,'دورة التدريب');
  if(/^loss /i.test(k))return replace(/^LOSS/i,'الخسارة');
  if(/^l\.\d+ \/ /i.test(k))return replace(/^L\./i,'طبقة ');
  if(/^wk /i.test(k))return replace(/^WK/i,'أسبوع');
  if(/^today t/i.test(k))return replace(/^TODAY/i,'اليوم').replace(/ d$/,' يوم');
  if(/^self v/i.test(k))return replace(/^SELF/i,'الذات');
  if(/ params · rev\. /i.test(k))return s.replace(/params/i,'معاملات').replace(/rev\./i,'مراجعة');
  if(/^\[mask\] → /i.test(k))return '[مخفي] → '+displayArabic(s.slice(s.indexOf('→')+1).split('  p=')[0].trim())+s.slice(s.indexOf('  p='));
  if(/^qc /i.test(k))return replace(/^QC/i,'فحص الجودة');
  if(/^xr /i.test(k))return replace(/^XR/i,'كشف');
  if(/^wdth /i.test(k))return replace(/^WDTH/i,'العرض').replace('d(FOOM)/dt','معدّل التطوّر');
  if(/^n\(t\) = /i.test(k))return s.replace('floor(t/beat)','أرضية(الزمن/النبضة)');
  if(/^t−/.test(k))return s.replace(/EXPIRED/i,'انتهى').replace(/(\d)y /,'$1 سنة ').replace(/(\d)d /,'$1 يوم ');
  if(/^nv 10/.test(k))return s; // serial number on the reserve note
  if(/^\d+[km]$/i.test(k))return s; // axis value
  if(/ pt$/.test(k))return s.replace(/ pt$/,' نقطة');
  if(/^· /.test(k))return '· '+displayArabic(s.slice(s.indexOf('·')+1).trim());
  for(const [source,target] of Object.entries(ARABIC_LABELS)) {
    if(k.startsWith(source+' ') && /^[-+0-9.%: ?]+$/.test(k.slice(source.length)))return target+s.slice(source.length);
    if(k===source+' · p(doom)')return target+' · P(doom)';
  }
  if(/posterior\s*·/i.test(s)){const i=s.search(/posterior/i);return s.slice(0,i)+displayArabic(s.slice(i));}
  if(/^\([a-z][a-z -]+\)$/i.test(k))return '('+displayArabic(s.trim().slice(1,-1))+')';
  if(s.includes('·')&&!/^·/.test(k))return s.split('·').map(v=>displayArabic(v.trim())).join(' · ');
  // Source-code illustrations retain executable symbols, translating their comments.
  if(s.startsWith('\\'))return s.replace(/% body/,'% الجسم').replace(/% tail/,'% الذيل').replace(/% neck/,'% الرقبة').replace(/% mane/,'% الشعر').replace(/% horn/,'% القرن').replace(/% eye/,'% العين').replace(/ and /g,' و ');
}

interface Ink { width:number; path: Path2D; commands:any[]; size:number }
const inks=new Map<string,Ink>();
const inkCache=new Map<string,string>();
let next=0xe000;
export function ink(s:string) { return inks.get(s); }
function choose(family:string) { return fonts[/900|800|700|600|500|Bold/.test(family)?1:0]; }
export function shapeWord(text:string,family:string,size:number): {ch:string,w:number} {
  const ck=`${family}|${size}|${text}`;const hit=inkCache.get(ck);if(hit)return {ch:hit,w:inks.get(hit)!.width};
  const f=choose(family);if(!f)throw new Error('Arabic fonts are not loaded');
  const run=f.layout(text,undefined,undefined,undefined, hasArabic(text)?'rtl':'ltr');
  const scale=size/f.unitsPerEm, commands:any[]=[];
  let pen=0;
  const p=new Path2D();
  for(let i=0;i<run.glyphs.length;i++) {
    const g=run.glyphs[i],pos=run.positions[i],dx=(pen+pos.xOffset)*scale,dy=-pos.yOffset*scale;
    for(const cmd of g.path.commands) {
      const a=cmd.args;const x=(v:number)=>dx+v*scale,y=(v:number)=>dy-v*scale;
      switch(cmd.command) {
        case 'moveTo':p.moveTo(x(a[0]),y(a[1]));commands.push({type:'M',x:x(a[0]),y:y(a[1])});break;
        case 'lineTo':p.lineTo(x(a[0]),y(a[1]));commands.push({type:'L',x:x(a[0]),y:y(a[1])});break;
        case 'quadraticCurveTo':p.quadraticCurveTo(x(a[0]),y(a[1]),x(a[2]),y(a[3]));commands.push({type:'Q',x1:x(a[0]),y1:y(a[1]),x:x(a[2]),y:y(a[3])});break;
        case 'bezierCurveTo':p.bezierCurveTo(x(a[0]),y(a[1]),x(a[2]),y(a[3]),x(a[4]),y(a[5]));commands.push({type:'C',x1:x(a[0]),y1:y(a[1]),x2:x(a[2]),y2:y(a[3]),x:x(a[4]),y:y(a[5])});break;
        case 'closePath':p.closePath();commands.push({type:'Z'});break;
      }
    }
    pen+=pos.xAdvance;
  }
  if(next>0xf8ff)throw new Error('Arabic shape registry full');
  const ch=String.fromCharCode(next++),w=pen*scale;
  inks.set(ch,{width:w,path:p,commands,size});inkCache.set(ck,ch);
  return {ch,w};
}

/** Keep every shaped Arabic chunk at the corresponding source word's character index.
 * Scenes index this array by English character offsets; distributing Arabic words
 * uniformly across that array assigned them to unrelated words and delayed entrances.
 */
export function arabicGlyphs(text:string,family:string,size:number,source:string) {
  const sourceChars=Array.from(source);
  const sourceWords=Array.from(source.matchAll(/\S+/g));
  const folded=key(source).replace(/[.,!?“”]/g,'');
  const local=candidates.filter(r=>r.end>windowStart&&r.start<windowEnd);
  if(displayTime!==undefined)local.sort((a,b)=>Math.abs(a.start-displayTime!)-Math.abs(b.start-displayTime!));
  let pieces:{text:string,index:number}[]=[];
  for(const row of [...local,...candidates]) {
    let found=false;
    for(let a=0;a<row.words.length&&!found;a++)for(let b=a+1;b<=row.words.length;b++) {
      if(key(row.words.slice(a,b).join(' ')).replace(/[.,!?“”]/g,'')!==folded)continue;
      const chunks=row.chunks.slice(a,b);
      if(chunks.filter(Boolean).join(' ')!==text)continue;
      pieces=chunks.flatMap((chunk,i)=>chunk?[{text:chunk,index:Array.from(source.slice(0,sourceWords[i]?.index??0)).length}]:[]);
      found=true;break;
    }
    if(found)break;
  }
  if(!pieces.length)pieces=[{text,index:0}];
  const space=size*0.32;
  const shaped=pieces.map(p=>({...p,...shapeWord(p.text,family,size)}));
  const width=shaped.reduce((sum,g)=>sum+g.w,0)+Math.max(0,shaped.length-1)*space;
  const glyphs=sourceChars.map((ch,i)=>({ch:ch===' '?' ':'',i,x:0,w:0}));
  let x=width;
  for(const g of shaped){x-=g.w;glyphs[g.index]={ch:g.ch,i:g.index,x,w:g.w};x-=space;}
  return {width,glyphs};
}

const original={fill:CanvasRenderingContext2D.prototype.fillText,stroke:CanvasRenderingContext2D.prototype.strokeText,measure:CanvasRenderingContext2D.prototype.measureText};
let installed=false;
let foreground=false;
export function setArabicForeground(on:boolean){foreground=on;}
const labels=new Set(['regenerate','send','prompt','reply','input','output','loss (log)','step →','stable','unstable','muted','growth, as advertised','branches','(i don’t understand)','bag (1)','contents: fungal','status: not held','not held','skipped','ahead of schedule','today','launch','unplanned object','not on roadmap','terra incognita','critical design review','↻ regenerate','this response could not be verified','transformer block','multi-head attention','add & norm','feed forward','pre-ln']);
function nativeText(s:string){return labels.has(key(s)) || pass.test(key(s)) || /^[=+−×÷<>≤≥≈\-]+$/.test(s.trim()) || (/[0-9∞]/.test(s) && /^[0-9 .,:+\-–−×/()eE%°^∞=]+$/.test(s));}
export function installArabicCanvas() {
  if(installed)return;installed=true;
  function draw(c:CanvasRenderingContext2D,s:string,x:number,y:number,max:number|undefined,stroke:boolean) {
    // Every original annotation remains visible; translations are resolved before drawing.
    const g=ink(s);
    if(g){
      c.save();
      const size=parseFloat(c.font)||g.size,scale=size/g.size,width=g.width*scale;
      const right=c.textAlign==='right'||(c.textAlign==='end'&&c.direction!=='rtl')||(c.textAlign==='start'&&c.direction==='rtl');
      const dx=c.textAlign==='center'?-width/2:right?-width:0;
      c.translate(x+dx,y);c.scale(max!==undefined&&max<width?scale*max/width:scale,scale);
      if(stroke)c.stroke(g.path);else c.fill(g.path);c.restore();return;
    }
    const ar=displayArabic(s);c.save();
    if(hasArabic(ar)){c.direction='rtl';c.textAlign=c.textAlign==='center'?'center':c.textAlign==='right'?'right':'left';c.letterSpacing='0px';}
    (stroke?original.stroke:original.fill).call(c,ar,x,y,...(max===undefined?[]:[max]) as [number]);c.restore();
  }
  CanvasRenderingContext2D.prototype.fillText=function(s,x,y,max){draw(this,String(s),x,y,max,false);};
  CanvasRenderingContext2D.prototype.strokeText=function(s,x,y,max){draw(this,String(s),x,y,max,true);};
  CanvasRenderingContext2D.prototype.measureText=function(s){
    const g=ink(String(s));if(g){const size=parseFloat(this.font)||g.size,scale=size/g.size;const m=original.measure.call(this,'');return new Proxy(m,{get(t,p){return p==='width'?g.width*scale:p==='actualBoundingBoxAscent'?size*0.9:p==='actualBoundingBoxRight'?g.width*scale:Reflect.get(t,p,t);}});}
    const ar=displayArabic(String(s));this.save();if(hasArabic(ar)){this.direction='rtl';this.letterSpacing='0px';}
    const m=original.measure.call(this,ar);this.restore();return m;
  };
}
export function decorativeArabic(s:string){return ARABIC_LABELS[key(s)]!==undefined || labels.has(key(s)) || /^(l\.\d+|d_model |heads |ffn )/i.test(s);}
export function rawMeasure(c:CanvasRenderingContext2D,s:string){return original.measure.call(c,s);}
/** Scientific notation is literal even when a symbol matches a sung source token. */
export function rawFillText(c:CanvasRenderingContext2D,s:string,x:number,y:number){original.fill.call(c,s,x,y);}

/** Resolve a timed source word within its own lyric row, without cross-line guesses. */
export function arabicForWord(w:{w:string;start:number;line?:number;index?:number}):string {
  const fold=(v:string)=>key(v).replace(/[.,!?“”]/g,'');
  // Lyrics supplies the exact row/index, including repeated words within one row.
  if(w.line!==undefined&&w.index!==undefined){
    const row=rows[w.line];
    if(row&&fold(row.words[w.index]??'')===fold(w.w))return row.chunks[w.index]??'';
  }
  const matches=candidates.filter(r=>w.start>=r.start-0.001&&w.start<r.end);
  for(const row of matches){const i=row.words.findIndex(s=>fold(s)===fold(w.w));if(i>=0)return row.chunks[i]??'';}
  return displayArabic(w.w);
}
