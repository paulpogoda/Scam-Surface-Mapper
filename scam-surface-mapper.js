javascript:(function(){
try{
/* ===== SCOPED DECLARATIONS FOR BOTH GRAPHS ===== */
var D=document,W=window,now=new Date(),SRC=location.href,UA=navigator.userAgent,curHost=location.hostname.replace(/^www\./,'');
/* Single overlay per page */
var old=document.getElementById('ssm_wrap');if(old)old.remove();
var oldStyle=document.getElementById('ssm_style');if(oldStyle)oldStyle.remove();
var css="#ssm_wrap{position:fixed;inset:1%;z-index:2147483647;background:#0b0f14;color:#e6edf3;border:1px solid #233041;border-radius:10px;display:flex;flex-direction:column;font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;box-shadow:0 10px 34px rgba(0,0,0,.45);transition:inset .2s}#ssm_head{display:flex;gap:12px;align-items:center;padding:10px 12px;border-bottom:1px solid #233041;user-select:none}#ssm_tabs{display:flex;gap:8px;padding:8px 12px 8px 0;border-bottom:1px solid #233041;flex-wrap:wrap}#ssm_body{flex:1 1 0%;min-height:500px;min-width:800px;display:flex;overflow:hidden}#ssm_side{width:280px;border-right:1px solid #233041;padding:10px;overflow:auto;transition:width .2s}#ssm_main{flex:1 1 0%;overflow:auto;padding:12px;white-space:pre}#ssm_btn{background:#17202b;color:#e6edf3;border:1px solid #2b3a4a;border-radius:6px;padding:6px 10px;cursor:pointer;margin-right:6px;transition:.1s}#ssm_btn:hover{background:#1c2733}#ssm_graph,#ssm_graph_full{flex:1 1 0%;overflow:hidden;padding:0;min-width:400px;min-height:400px}#ssm_canvas,#ssm_canvas_full{width:100%;height:100%;display:block;background:#0b0f14;min-width:400px;min-height:400px;}#ssm_badge{display:inline-block;background:#17202b;border:1px solid #2b3a4a;border-radius:4px;padding:0 6px;margin:0 3px}.ssm_link{color:#9cdcfe}.ssm_small{opacity:.7}.ssm_kv{display:block;margin-bottom:6px}.ssm_tag{display:inline-block;border:1px solid #2b3a4a;background:#111827;color:#cbd5e1;border-radius:4px;padding:1px 6px;margin:2px 3px}";
var style=document.createElement('style');style.id='ssm_style';style.textContent=css;document.documentElement.appendChild(style);

/* === TAB UI vars === */
var wrap=D.createElement('div');wrap.id='ssm_wrap', head=D.createElement('div');head.id='ssm_head';
head.innerHTML='<strong>Scam Surface Mapper — Advanced</strong> <span style="margin-left:10px;font-weight:normal" class="ssm_small"> <a href="https://github.com/paulpogoda" target="_blank" style="color:#75a4da;font-weight:normal;">Created by Pavel Bannikov for Provereno.Media</a> </span><span class="ssm_small" style="margin-left:10px" id="ssm_stats"></span><span class="ssm_small" style="margin-left:auto">'+now.toISOString()+'</span>';
var closeBtn=D.createElement('button');closeBtn.textContent='Close ✕';closeBtn.type='button';closeBtn.id='ssm_btn';closeBtn.style.marginLeft='10px';closeBtn.onclick=function(){wrap.remove();};
var fsOn=false,fsBtn=document.createElement('button');fsBtn.textContent="Fullscreen";fsBtn.id='ssm_btn';fsBtn.style.marginLeft='10px';
head.appendChild(closeBtn);head.appendChild(fsBtn);
var tabs=D.createElement('div');tabs.id='ssm_tabs';
function btn(label,fn){var b=D.createElement('button');b.id='ssm_btn';b.textContent=label;b.onclick=fn;return b;}
var bodyBox=D.createElement('div');bodyBox.id='ssm_body', side=D.createElement('div');side.id='ssm_side', main=D.createElement('div');main.id='ssm_main';
var graphBox=D.createElement('div');graphBox.id='ssm_graph';graphBox.style.display='none';var canvas=D.createElement('canvas');canvas.id='ssm_canvas';graphBox.appendChild(canvas);
var graphBoxFull=D.createElement('div');graphBoxFull.id='ssm_graph_full';graphBoxFull.style.display='none';var canvasFull=D.createElement('canvas');canvasFull.id='ssm_canvas_full';graphBoxFull.appendChild(canvasFull);

var dragging,dragOff,draggingF,dragOffF;
var current='summary', DPR=W.devicePixelRatio||1;
function openUrl(u){W.open(u,'_blank')}
/* ==== DATA AGGREGATION AND STRUCTS ==== */
function isShortenerHost(h){return/^(t.co|bit.ly|tinyurl.com|is.gd|cutt.ly|ow.ly|s.id|goo.gl|buff.ly|lnkd.in|adb.ly|rebrand.ly|v.gd|clck.ru|vk.cc)$/i.test(h);}
function isSuspiciousTLD(h){return /\.(xyz|top|icu|cn|ru|rest|work|club|best|support|casa|loan|click|gq|cf|ml|tk|link|cfd|zip|mov|buzz|cam|monster|quest|beauty|hair|men|lol|review|country|gdn|kim|download|racing|stream|fit|mom|bar|host|party|date|faith|science|surf|site|online|shop|lol)$/i.test(h);}
function hasCyrLatMix(s){return/[A-Za-z]/.test(s)&&/[А-Яа-яЁё]/.test(s);}
function isIDN(h){return/xn--/i.test(h);}
var SUS_PATH=/(login|verify|wallet|bonus|promo|airdrop|claim|giveaway|prize|auth|signin|account|recovery|seed|mnemonic|withdraw|payout|investment|broker|crypto|binance|bybit|okx|pass|gift|lottery|casino|bet)\b/i;
var SUS_PARAM=/\b(sum|amount|wallet|addr|address|seed|mnemonic|key|private|bonus|promo|ref|aff|utm_|tracking|click|cid|gclid|fbclid|ysclid|yclid|msclkid)\b/i;
function csvEsc(s){return'"'+String(s??'').replace(/"/g,'""')+'"';}
function safeURL(u){try{return new URL(u,location.href)}catch(e){return null}}
/* Gather records (flat): */
var records=[],seen=new Set();
function pushURL(url,meta){
  var u=safeURL(url);if(!u)return;
  var host=u.hostname.replace(/^www\./,''),key=u.href+'|'+(meta.text||'');
  if(seen.has(key))return; seen.add(key);
  var params=[...u.searchParams.entries()];
  var utm=params.filter(([k])=>/^utm_/i.test(k)).map(x=>x[0]);
  var aff=params.filter(([k])=>/(^|)(ref|aff|partner|pid|subid|affiliate)(|$)/i.test(k)).map(x=>x[0]);
  var trackers=params.filter(([k])=>/(gclid|fbclid|ysclid|yclid|msclkid|cid|clid)/i.test(k)).map(x=>x[0]);
  var suspPath=SUS_PATH.test(u.pathname),suspParam=SUS_PARAM.test(u.search),shortener=isShortenerHost(host),
  tldSusp=isSuspiciousTLD(host),idn=isIDN(host),mixed=hasCyrLatMix(host),
  suspicion=(shortener?2:0)+(tldSusp?2:0)+(idn?1:0)+(mixed?1:0)+(suspPath?2:0)+(suspParam?1:0)+((meta.rel||'').includes('sponsored')?1:0);
  records.push({source:SRC,url:u.href,host,pathname:u.pathname||'/',is_external:host!==curHost,rel:meta.rel||'',attr:meta.attr||'',text_anchor:(meta.text||'').slice(0,160),utm_keys:[...new Set(utm)],aff_keys:[...new Set(aff)],tracker_keys:[...new Set(trackers)],shortener,has_susp_path:suspPath,has_susp_param:suspParam,suspicious_tld:tldSusp,idn,host_cyrlat_mix:mixed,suspicion_score:suspicion});
}
[...D.querySelectorAll('a[href]')].forEach(a=>{var href=a.getAttribute('href');if(!href)return;if(/^javascript:|^mailto:|^tel:|^#/.test(href))return;pushURL(href,{text:a.textContent||'',rel:(a.getAttribute('rel')||'').toLowerCase(),attr:'href'});});
[...D.querySelectorAll('[onclick]')].forEach(el=>{var s=String(el.getAttribute('onclick')||'');var m=[...s.matchAll(/(?:https?:\/\/|\/)[^'" ]+/g)].map(x=>x[0]);m.slice(0,3).forEach(u=>pushURL(u,{text:el.textContent||'',attr:'onclick'}));});
[...D.querySelectorAll('[data-href],[data-url],[data-link]')].forEach(el=>{var u=el.getAttribute('data-href')||el.getAttribute('data-url')||el.getAttribute('data-link');if(u)pushURL(u,{text:el.textContent||'',attr:'data-'});});
function getMetaRefresh(){var metas=D.querySelectorAll('meta[http-equiv]');for(var i=0;i<metas.length;i++)if((metas[i].getAttribute('http-equiv')||'').toLowerCase()==='refresh')return metas[i];return null;}
var metaRefresh=getMetaRefresh();
if(metaRefresh){var c=metaRefresh.getAttribute('content')||'';var m=c.match(/url\s*=\s*([^;]+)/i);if(m)pushURL(m[1].trim(),{attr:'meta-refresh'});}
var canon=Array.from(D.getElementsByTagName('link')).find(l=>(l.getAttribute('rel')||'').toLowerCase()=="canonical");
if(canon&&canon.href)pushURL(canon.href,{attr:'canonical'});
var ogu=Array.from(D.getElementsByTagName('meta')).find(m=>(m.getAttribute('property')||'').toLowerCase()=="og:url");
if(ogu&&ogu.content)pushURL(ogu.content,{attr:'og:url'});
/* Hosts by record: */
var byHost={},hostRows=Object.entries(records.reduce(function(all, r){
  var h=r.host,b=all[h]=all[h]||{count:0,external:0,shorteners:0,paths:new Set(),utm:new Set(),aff:new Set(),trackers:new Set(),max_score:0,flags:new Set(),samples:[]};
  b.count++;if(r.is_external)b.external++;if(r.shortener)b.shorteners++;
  r.utm_keys.forEach(k=>b.utm.add(k));r.aff_keys.forEach(k=>b.aff.add(k));r.tracker_keys.forEach(k=>b.trackers.add(k));
  b.paths.add(r.pathname);b.max_score=Math.max(b.max_score,r.suspicion_score);
  if(r.suspicious_tld)b.flags.add('tld');if(r.idn)b.flags.add('idn');if(r.host_cyrlat_mix)b.flags.add('cyrlat');
  if(r.has_susp_path)b.flags.add('path');if(r.has_susp_param)b.flags.add('param');if(r.shortener)b.flags.add('shortener');
  if(b.samples.length<3)b.samples.push(r.url);return all;
},{})).map(([h,v])=>({host:h,count:v.count,external:v.external,shorteners:v.shorteners,unique_paths:[...v.paths].slice(0,6),utm_keys:[...v.utm],aff_keys:[...v.aff],tracker_keys:[...v.trackers],max_suspicion_score:v.max_score,flags:[...v.flags],sample:v.samples.join('|')})).sort((a,b)=>b.max_suspicion_score-a.max_suspicion_score||b.external-a.external||b.count-a.count);
/* CSV, JSON, UI helpers */
var csvHosts=['host,count,external,shorteners,max_suspicion_score,flags,utm_keys,aff_keys,tracker_keys,unique_paths,sample']
.concat(hostRows.map(r=>[r.host,r.count,r.external,r.shorteners,r.max_suspicion_score,r.flags.join('|'),r.utm_keys.join('|'),r.aff_keys.join('|'),r.tracker_keys.join('|'),r.unique_paths.join('|'),r.sample].map(csvEsc).join(','))).join('\n');
var csvLinks=['source,url,host,pathname,is_external,rel,attr,text_anchor,utm_keys,aff_keys,tracker_keys,shortener,has_susp_path,has_susp_param,suspicious_tld,idn,host_cyrlat_mix,suspicion_score']
.concat(records.map(r=>[r.source,r.url,r.host,r.pathname,r.is_external,r.rel,r.attr,r.text_anchor,r.utm_keys.join('|'),r.aff_keys.join('|'),r.tracker_keys.join('|'),r.shortener,r.has_susp_path,r.has_susp_param,r.suspicious_tld,r.idn,r.host_cyrlat_mix,r.suspicion_score].map(csvEsc).join(','))).join('\n');
var snapshot={meta:{generated_at:now.toISOString(),source:SRC,user_agent:UA,total_links:records.length,total_hosts:hostRows.length},summary:hostRows,links:records};
/* === SIMPLE TABS, ACTIONS, FILTERS, HELP === */
function renderSummary(){var lines=['Host Summary (risk descending)',''];for(var i=0;i<hostRows.length;i++){var r=hostRows[i];lines.push(r.host+' [links:'+r.count+' ext:'+r.external+' short:'+r.shorteners+'] score:'+r.max_suspicion_score+' flags:'+(r.flags.join('|')||'-'));if(r.unique_paths.length)lines.push(' paths: '+r.unique_paths.join(' '));if(r.sample)lines.push(' sample: '+r.sample);lines.push('');}main.textContent=lines.join('\n');}
function renderLinks(){var lines=['Raw Links',''];for(var i=0;i<records.length;i++){var r=records[i];lines.push(r.url);lines.push(' host:'+r.host+' ext:'+r.is_external+' short:'+r.shortener+' score:'+r.suspicion_score);var ks=[];if(r.utm_keys.length)ks.push('utm='+r.utm_keys.join('|'));if(r.aff_keys.length)ks.push('aff='+r.aff_keys.join('|'));if(r.tracker_keys.length)ks.push('trk='+r.tracker_keys.join('|'));if(ks.length)lines.push(' '+ks.join(' '));if(r.text_anchor)lines.push(' txt:'+r.text_anchor);if(r.rel||r.attr)lines.push(' rel:'+(r.rel||'-')+' attr:'+(r.attr||'-'));lines.push('');}main.textContent=lines.join('\n');}
function download(name,content,type){var blob=new Blob([content],{type:type||'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=D.createElement('a');a.href=url;a.download=name;D.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(url);a.remove();},200);}
function copy(text){if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(text).catch(function(){alert('Clipboard error')});else alert('Clipboard API not available');}
function sideRender(){side.innerHTML='';
var h1=D.createElement('div');h1.className='ssm_kv';h1.textContent='Actions';side.appendChild(h1);
var actions=D.createElement('div');
[{label:'Copy JSON',on:()=>copy(JSON.stringify(snapshot,null,2))},{label:'Download hosts.csv',on:()=>download('scam_hosts.csv',csvHosts)},{label:'Download links.csv',on:()=>download('scam_links.csv',csvLinks)},{label:'Download snapshot.json',on:()=>download('scam_snapshot.json',JSON.stringify(snapshot,null,2),'application/json')},{label:'Save graph.png',on:()=>downloadCanvas()},{label:'Close window',on:()=>wrap.remove()}].forEach(a=>{var b=btn(a.label,a.on);b.style.display='block';b.style.margin='4px 0';actions.appendChild(b);});side.appendChild(actions);
var h2=D.createElement('div');h2.className='ssm_kv';h2.textContent='Quick Filters (highlight)';side.appendChild(h2);
var tags=D.createElement('div');[['shortener',r=>r.shortener],['tld',r=>r.suspicious_tld],['idn',r=>r.idn],['cyrlat',r=>r.host_cyrlat_mix],['param',r=>r.has_susp_param],['path',r=>r.has_susp_path]].forEach(([name,fn])=>{var c=records.filter(fn).length,span=D.createElement('span');span.className='ssm_tag';span.textContent=name+': '+c;tags.appendChild(span);});side.appendChild(tags);
var h3=D.createElement('div');h3.className='ssm_kv';h3.textContent='Checks (right-click on graph)';side.appendChild(h3);
var help=D.createElement('div');help.className='ssm_small';help.innerHTML="In the graph: right-click a node or edge to open urlscan or SecurityTrails. You are free to move graph blocks with your mouse/touchpad";side.appendChild(help);}
/* === HOST GRAPH STATE === */
var nodes=[],edges=[],idOf={},nid=0,pos=new Map(),vel=new Map(),cw,ch,ctx;
function addNode(key,obj){if(idOf[key]!=null)return idOf[key];idOf[key]=nid;nodes.push(Object.assign({id:nid},obj));return nid++}
var root=addNode('ROOT',{type:'root',label:curHost,score:0});
hostRows.forEach(h=>{
  var hid=addNode('H|'+h.host,{type:'host',label:h.host,score:h.max_suspicion_score,flags:h.flags});
  edges.push({from:root,to:hid,type:'src-host'});
});
function resizeCanvas(){var r=graphBox.getBoundingClientRect();cw=Math.max(300,Math.floor(r.width));ch=Math.max(260,Math.floor(r.height));canvas.width=cw*DPR;canvas.height=ch*DPR;canvas.style.width=cw+'px';canvas.style.height=ch+'px';ctx=canvas.getContext('2d');ctx.setTransform(DPR,0,0,DPR,0,0);}
function rand(min,max){return min+Math.random()*(max-min);}
function initPositions(){nodes.forEach(n=>{if(n.type==='root'){pos.set(n,{x:cw*0.12,y:ch*0.5});vel.set(n,{x:0,y:0});}else if(n.type==='host'){pos.set(n,{x:rand(cw*0.28,cw*0.90),y:rand(40,ch-40)});vel.set(n,{x:0,y:0});}});}
function stepLayout(iters){iters=iters||200;for(var k=0;k<iters;k++){for(var i=0;i<nodes.length;i++){for(var j=i+1;j<nodes.length;j++){var a=nodes[i],b=nodes[j],pa=pos.get(a),pb=pos.get(b),dx=pa.x-pb.x,dy=pa.y-pb.y,d2=dx*dx+dy*dy+0.01,f=2000/d2;dx/=Math.sqrt(d2);dy/=Math.sqrt(d2);vel.get(a).x+=dx*f;vel.get(a).y+=dy*f;vel.get(b).x-=dx*f;vel.get(b).y-=dy*f;}}edges.forEach(e=>{var a=nodes[e.from],b=nodes[e.to],pa=pos.get(a),pb=pos.get(b),dx=pb.x-pa.x,dy=pb.y-pa.y,dist=Math.sqrt(dx*dx+dy*dy)||1,kspr=0.02,desired=180,f=(dist-desired)*kspr;dx/=dist;dy/=dist;vel.get(a).x+=dx*f;vel.get(a).y+=dy*f;vel.get(b).x-=dx*f;vel.get(b).y-=dy*f;});nodes.forEach(n=>{var v=vel.get(n),p=pos.get(n);p.x+=v.x;p.y+=v.y;v.x*=0.85;v.y*=0.85;p.x=Math.max(40,Math.min(cw-40,p.x));p.y=Math.max(30,Math.min(ch-30,p.y));});}}
function drawRoundedRect(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function colorFor(n){if(n.type==='root')return'#9cdcfe';if(n.type==='host')return(n.score>=4?'#ff6b6b':n.score>=2?'#ffb86c':'#8be9fd');}
function drawGraphHosts(){resizeCanvas();ctx.clearRect(0,0,cw,ch);ctx.lineWidth=1;ctx.strokeStyle='rgba(148,163,184,.45)';edges.forEach(e=>{var a=nodes[e.from],b=nodes[e.to],pa=pos.get(a),pb=pos.get(b);ctx.beginPath();ctx.moveTo(pa.x,pa.y);ctx.lineTo(pb.x,pb.y);ctx.stroke();});nodes.forEach(n=>{var p=pos.get(n),tx=(n.label||'').slice(0,24);ctx.font='12px ui-monospace';var tw=Math.min(300,Math.max(60,ctx.measureText(tx).width+18)),th=24,x=p.x-tw/2,y=p.y-th/2;drawRoundedRect(x,y,tw,th,6);ctx.fillStyle=colorFor(n);ctx.fill();ctx.strokeStyle='rgba(35,48,65,.9)';ctx.stroke();ctx.fillStyle='#0b0f14';ctx.fillText(tx,x+9,y+16);});}
function nodeAt(mx,my){for(var i=nodes.length-1;i>=0;i--){var n=nodes[i],p=pos.get(n);ctx.font='12px ui-monospace';var tw=Math.min(300,Math.max(60,ctx.measureText((n.label||'').slice(0,24)).width+18)),th=24,x=p.x-tw/2,y=p.y-th/2;if(mx>=x&&mx<=x+tw&&my>=y&&my<=y+th)return n;}return null;}
canvas.addEventListener('mousedown',e=>{var r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,n=nodeAt(x,y);if(n){dragging=n;var p=pos.get(n);dragOff={dx:x-p.x,dy:y-p.y};}});
W.addEventListener('mouseup',()=>{dragging=null;draggingF=null;});
W.addEventListener('mousemove',e=>{
  if(current==='graph'&&dragging){
    var r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,p=pos.get(dragging);p.x=x-dragOff.dx;p.y=y-dragOff.dy;drawGraphHosts();
  }
  if(current==='graph_full'&&draggingF){
    var r=canvasFull.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,p=posF.get(draggingF);p.x=x-dragOffF.dx;p.y=y-dragOffF.dy;drawGraphFull();
  }
});
var menu=D.createElement('div');menu.style='position:fixed;z-index:2147483647;background:#111827;color:#e5e7eb;border:1px solid #2b3a4a;border-radius:6px;display:none;min-width:220px;box-shadow:0 8px 22px rgba(0,0,0,.4)';
function showMenu(x,y,items){menu.innerHTML='';items.forEach(it=>{var d=D.createElement('div');d.textContent=it.label;d.style='padding:8px 10px;cursor:pointer;border-bottom:1px solid #1f2937';d.onmouseenter=()=>d.style.background='#1f2937';d.onmouseleave=()=>d.style.background='';d.onclick=()=>{menu.style.display='none';it.on();};menu.appendChild(d);});var last=menu.lastChild;if(last)last.style.borderBottom='none';menu.style.left=x+'px';menu.style.top=y+'px';menu.style.display='block';}
graphBox.appendChild(menu);
canvas.addEventListener('contextmenu',e=>{e.preventDefault();var r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,n=nodeAt(x,y);
if(n){
  if(n.type==='host'){
    var domain=n.label;
    showMenu(e.clientX,e.clientY,[
      {label:'SecurityTrails: Domain Overview',on:()=>openUrl('https://securitytrails.com/domain/'+encodeURIComponent(domain))},
      {label:'urlscan.io: Search domain',on:()=>openUrl('https://urlscan.io/search/#domain:'+encodeURIComponent(domain))},
      {label:'urlscan.io: Latest scans',on:()=>openUrl('https://urlscan.io/domain/'+encodeURIComponent(domain))},
      {label:'Whois: Check on Whoxy',on:()=>openUrl('https://www.whoxy.com/'+encodeURIComponent(domain))}
    ]);
  }else if(n.type==='root'){
    showMenu(e.clientX,e.clientY,[
      {label:'Open Source',on:()=>openUrl(SRC)},
      {label:'urlscan.io: Search domain (source)',on:()=>openUrl('https://urlscan.io/search/#domain:'+encodeURIComponent(curHost))},
      {label:'SecurityTrails: Source Domain',on:()=>openUrl('https://securitytrails.com/domain/'+encodeURIComponent(curHost))},
      {label:'Whois: Check on Whoxy',on:()=>openUrl('https://www.whoxy.com/'+encodeURIComponent(curHost))}
    ]);
  }
}});
W.addEventListener('click',()=>{menu.style.display='none';menuF.style.display='none';});
/* ==== FULL GRAPH STATE (PROPER OUTER SCOPE) ==== */
var nodesF=[],edgesF=[],posF=new Map(),velF=new Map(),cwF,chF,ctxF;
function resizeCanvasFull(){var r=graphBoxFull.getBoundingClientRect();cwF=Math.max(300,Math.floor(r.width));chF=Math.max(260,Math.floor(r.height));canvasFull.width=cwF*DPR;canvasFull.height=chF*DPR;canvasFull.style.width=cwF+'px';canvasFull.style.height=chF+'px';ctxF=canvasFull.getContext('2d');ctxF.setTransform(DPR,0,0,DPR,0,0);}
function makeFullGraphData(){
  nodesF.length=0;edgesF.length=0;posF=new Map();velF=new Map();
  var idF={},nidF=0;
  function addNodeF(key,obj){if(idF[key]!=null)return idF[key];idF[key]=nidF;nodesF.push(Object.assign({id:nidF},obj));return nidF++;}
  var rootF=addNodeF('ROOT',{type:'root',label:curHost});
  var hIdF={};
  hostRows.forEach(h=>{hIdF[h.host]=addNodeF('H|'+h.host,{type:'host',label:h.host});edgesF.push({from:rootF,to:hIdF[h.host],type:'src-host'});});
  records.forEach(r=>{
    var nid=addNodeF('U|'+r.url,{type:'url',label:r.url,host:r.host,score:r.suspicion_score});
    edgesF.push({from:hIdF[r.host],to:nid,type:'host-url',raw:r});
  });
}
function initPositionsFull(){nodesF.forEach(n=>{
  if(n.type==='root'){posF.set(n,{x:cwF*0.12,y:chF*0.5});velF.set(n,{x:0,y:0});}
  else if(n.type==='host'){posF.set(n,{x:rand(cwF*0.28,cwF*0.48),y:rand(40,chF-40)});velF.set(n,{x:0,y:0});}
  else{posF.set(n,{x:rand(cwF*0.52,cwF*0.92),y:rand(40,chF-40)});velF.set(n,{x:0,y:0});}
});}
function stepLayoutFull(iters){iters=iters||200;for(var k=0;k<iters;k++){for(var i=0;i<nodesF.length;i++){for(var j=i+1;j<nodesF.length;j++){var a=nodesF[i],b=nodesF[j],pa=posF.get(a),pb=posF.get(b),dx=pa.x-pb.x,dy=pa.y-pb.y,d2=dx*dx+dy*dy+0.01,f=2000/d2;dx/=Math.sqrt(d2);dy/=Math.sqrt(d2);velF.get(a).x+=dx*f;velF.get(a).y+=dy*f;velF.get(b).x-=dx*f;velF.get(b).y-=dy*f;}}edgesF.forEach(e=>{var a=nodesF[e.from],b=nodesF[e.to],pa=posF.get(a),pb=posF.get(b),dx=pb.x-pa.x,dy=pb.y-pa.y,dist=Math.sqrt(dx*dx+dy*dy)||1,kspr=0.02,desired=e.type==='src-host'?160:110,f=(dist-desired)*kspr;dx/=dist;dy/=dist;velF.get(a).x+=dx*f;velF.get(a).y+=dy*f;velF.get(b).x-=dx*f;velF.get(b).y-=dy*f;});nodesF.forEach(n=>{var v=velF.get(n),p=posF.get(n);p.x+=v.x;p.y+=v.y;v.x*=0.85;v.y*=0.85;p.x=Math.max(40,Math.min(cwF-40,p.x));p.y=Math.max(30,Math.min(chF-30,p.y));});}}
function drawGraphFull(){
  resizeCanvasFull();ctxF.clearRect(0,0,cwF,chF);
  ctxF.lineWidth=1;ctxF.strokeStyle='rgba(148,163,184,.45)';
  edgesF.forEach(e=>{var a=nodesF[e.from],b=nodesF[e.to],pa=posF.get(a),pb=posF.get(b);ctxF.beginPath();ctxF.moveTo(pa.x,pa.y);ctxF.lineTo(pb.x,pb.y);ctxF.stroke();});
  nodesF.forEach(n=>{
    var p=posF.get(n),tx=(n.label||'').slice(0,n.type==='url'?42:24);
    ctxF.font='12px ui-monospace';
    var tw=Math.min(360,Math.max(60,ctxF.measureText(tx).width+18)),th=24,x=p.x-tw/2,y=p.y-th/2;
    drawRoundedRectFull(x,y,tw,th,6);ctxF.fillStyle=colorForFull(n);ctxF.fill();ctxF.strokeStyle='rgba(35,48,65,.9)';ctxF.stroke();ctxF.fillStyle='#0b0f14';ctxF.fillText(tx,x+9,y+16);
  });
}
function colorForFull(n){if(n.type==='root')return'#9cdcfe';if(n.type==='host')return'#8be9fd';return(n.score>=4?'#ff6b6b':n.score>=2?'#ffd166':'#a3e635');}
function drawRoundedRectFull(x,y,w,h,r){ctxF.beginPath();ctxF.moveTo(x+r,y);ctxF.arcTo(x+w,y,x+w,y+h,r);ctxF.arcTo(x+w,y+h,x,y+h,r);ctxF.arcTo(x,y+h,x,y,r);ctxF.arcTo(x,y,x+w,y,r);ctxF.closePath();}
function nodeAtFull(mx,my){
  for(var i=nodesF.length-1;i>=0;i--){var n=nodesF[i],p=posF.get(n);ctxF.font='12px ui-monospace';
    var tw=Math.min(360,Math.max(60,ctxF.measureText((n.label||'').slice(0,n.type==='url'?42:24)).width+18)),th=24,x=p.x-tw/2,y=p.y-th/2;if(mx>=x&&mx<=x+tw&&my>=y&&my<=y+th)return n;
  }return null;}
canvasFull.addEventListener('mousedown',e=>{var r=canvasFull.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,n=nodeAtFull(x,y);if(n){draggingF=n;var p=posF.get(n);dragOffF={dx:x-p.x,dy:y-p.y};}});
var menuF=D.createElement('div');menuF.style='position:fixed;z-index:2147483647;background:#111827;color:#e5e7eb;border:1px solid #2b3a4a;border-radius:6px;display:none;min-width:220px;box-shadow:0 8px 22px rgba(0,0,0,.4)';
function showMenuF(x,y,items){menuF.innerHTML='';items.forEach(it=>{var d=D.createElement('div');d.textContent=it.label;d.style='padding:8px 10px;cursor:pointer;border-bottom:1px solid #1f2937';d.onmouseenter=()=>d.style.background='#1f2937';d.onmouseleave=()=>d.style.background='';d.onclick=()=>{menuF.style.display='none';it.on();};menuF.appendChild(d);});var last=menuF.lastChild;if(last)last.style.borderBottom='none';menuF.style.left=x+'px';menuF.style.top=y+'px';menuF.style.display='block';}
graphBoxFull.appendChild(menuF);
canvasFull.addEventListener('contextmenu',e=>{e.preventDefault();var r=canvasFull.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,n=nodeAtFull(x,y);
if(n){
  if(n.type==='host'){
    showMenuF(e.clientX,e.clientY,[
      {label:'SecurityTrails: Domain Overview',on:()=>openUrl('https://securitytrails.com/domain/'+encodeURIComponent(n.label))},
      {label:'urlscan.io: Search domain',on:()=>openUrl('https://urlscan.io/search/#domain:'+encodeURIComponent(n.label))},
      {label:'urlscan.io: Latest scans',on:()=>openUrl('https://urlscan.io/domain/'+encodeURIComponent(n.label))},
      {label:'Whois: Check on Whoxy',on:()=>openUrl('https://www.whoxy.com/'+encodeURIComponent(n.label))}
    ]);
  }else if(n.type==='url'){
    var dom=(new URL(n.label)).hostname.replace(/^www\./,'');
    showMenuF(e.clientX,e.clientY,[
      {label:'Open URL',on:()=>openUrl(n.label)},
      {label:'urlscan.io: Submit URL',on:()=>openUrl('https://urlscan.io/scan/?url='+encodeURIComponent(n.label))},
      {label:'urlscan.io: Search URL',on:()=>openUrl('https://urlscan.io/search/#url:'+encodeURIComponent(n.label))},
      {label:'SecurityTrails: Domain Overview',on:()=>openUrl('https://securitytrails.com/domain/'+encodeURIComponent(dom))},
      {label:'Whois: Check on Whoxy',on:()=>openUrl('https://www.whoxy.com/'+encodeURIComponent(dom))}
    ]);
  }else if(n.type==='root'){
    showMenuF(e.clientX,e.clientY,[
      {label:'Open Source',on:()=>openUrl(SRC)},
      {label:'urlscan.io: Search domain (source)',on:()=>openUrl('https://urlscan.io/search/#domain:'+encodeURIComponent(curHost))},
      {label:'SecurityTrails: Source Domain',on:()=>openUrl('https://securitytrails.com/domain/'+encodeURIComponent(curHost))},
      {label:'Whois: Check on Whoxy',on:()=>openUrl('https://www.whoxy.com/'+encodeURIComponent(curHost))}
    ]);
  }
}});
/* Tabs/resize/menu logic */
function downloadCanvas(){var tmp=D.createElement('canvas');tmp.width=canvas.width;tmp.height=canvas.height;var tctx=tmp.getContext('2d');tctx.drawImage(canvas,0,0);tmp.toBlob(b=>{var url=URL.createObjectURL(b),a=D.createElement('a');a.href=url;a.download='scam_graph.png';D.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(url);a.remove();},200);});}
function updateStats(){document.getElementById("ssm_stats").textContent='links: '+records.length+', hosts: '+hostRows.length;}
/* Tabs: all three layouts! */
var tSummary=btn('Summary',()=>{current='summary';graphBox.style.display='none';graphBoxFull.style.display='none';main.style.display='block';renderSummary();});
var tLinks=btn('Raw Links',()=>{current='links';graphBox.style.display='none';graphBoxFull.style.display='none';main.style.display='block';renderLinks();});
var tGraph=btn('Hosts Graph',()=>{current='graph';main.style.display='none';graphBoxFull.style.display='none';graphBox.style.display='flex';resizeCanvas();initPositions();stepLayout();drawGraphHosts();});
var tFull=btn('Full Graph',()=>{current='graph_full';main.style.display='none';graphBox.style.display='none';graphBoxFull.style.display='flex';makeFullGraphData();resizeCanvasFull();initPositionsFull();stepLayoutFull();drawGraphFull();});
tabs.append(tSummary,tLinks,tGraph,tFull);
/* Window resize: redraw current graph/tab */
function onResize(){if(current==='graph'){resizeCanvas();initPositions();stepLayout();drawGraphHosts();}
if(current==='graph_full'){resizeCanvasFull();initPositionsFull();stepLayoutFull();drawGraphFull();}
}
W.addEventListener('resize',onResize);
/* Fullscreen handler always redraws current tab */
fsBtn.onclick=function(){fsOn=!fsOn;wrap.style.inset=fsOn?'0':'1%';fsBtn.textContent=fsOn?"Window":"Fullscreen";onResize();};
/* DOM attach: overlay on page */
renderSummary();sideRender();
bodyBox.appendChild(side);bodyBox.appendChild(main);bodyBox.appendChild(graphBox);bodyBox.appendChild(graphBoxFull);
wrap.appendChild(head);wrap.appendChild(tabs);wrap.appendChild(bodyBox);D.body.appendChild(wrap);
updateStats();
if(hostRows.length>0){current='graph';main.style.display='none';graphBox.style.display='flex';graphBoxFull.style.display='none';resizeCanvas();initPositions();stepLayout();drawGraphHosts();}
}catch(err){alert('SSM advanced error: '+(err&&err.message||err));}
})();
