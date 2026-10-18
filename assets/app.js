(()=>{
'use strict';
const TOPICS={ai:{name:'AI 大模型',icon:'🤖'},dev:{name:'开发与开源',icon:'💻'},market:{name:'纳指与投资',icon:'📈'},digital:{name:'数码科技',icon:'📱'},world:{name:'全球要闻',icon:'🌍'},obsidian:{name:'Obsidian 专题',icon:'💎'}};
const $=s=>document.querySelector(s);let issue=null;let filter='all';let q='';let archiveIndex=[];
let privatePayload=null;
const personalImpact=a=>{if(!privatePayload||privatePayload.date!==issue?.date)return ''; const x=(privatePayload.items||[]).find(i=>i.url&&i.url===a.url);return x&&typeof x.impact==='string'?x.impact:''};
let saved=[];try{saved=JSON.parse(localStorage.getItem('island-saved')||'[]')}catch{}if(!Array.isArray(saved))saved=[];
const tzDate=iso=>{if(!iso)return '日期待核实';const d=new Date(iso);return isNaN(d)?'日期待核实':new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}).format(d)};
const safeLink=u=>{try{const v=new URL(u);return ['https:','http:'].includes(v.protocol)?v.href:'#'}catch{return '#'}};
const text=(tag,txt,cls)=>{const e=document.createElement(tag);if(cls)e.className=cls;e.textContent=txt||'';return e};
const link=(label,url,cls)=>{const a=text('a',label,cls);a.href=safeLink(url);a.target='_blank';a.rel='noopener noreferrer';return a};
const selection=()=>{if(!issue)return[];let items=Array.isArray(issue.items)?issue.items:[];if(filter==='saved')items=items.filter(a=>saved.includes(a.url));else if(filter!=='all')items=items.filter(a=>a.category===filter);if(q)items=items.filter(a=>([a.title,a.summary,a.source].join(' ')).toLowerCase().includes(q.toLowerCase()));return items;};
function badge(a){const el=text('span',a.is_recent?'近期回顾':'最新动态','fresh'+(a.is_recent?' old':''));return el}
function personalSpotlight(){
 const node=$('#personal-focus');node.replaceChildren();node.hidden=true;
 if(!issue||!privatePayload||privatePayload.date!==issue.date)return;
 const all=Array.isArray(issue.items)?issue.items:[];
 let items=filter==='all'?['obsidian','ai','market'].map(k=>all.find(a=>a.category===k)).filter(Boolean):selection();
 items=items.filter(a=>personalImpact(a)).slice(0,filter==='all'?3:2);
 if(!items.length)return; node.hidden=false;
 const head=text('div','','personal-head');const titlebox=text('div','');
 titlebox.append(text('div','✦ PRIVATE · 私人内容','personal-overline'),text('h2','与你最相关的消息'),text('p','这部分已使用端到端式本地解密，不对公开访客提供明文。'));
 head.append(titlebox,text('span','🔐','personal-mark'));node.append(head);
 const grid=text('div','','personal-grid');
 for(const a of items){const item=link('',a.url,'personal-item');item.append(text('span',`${TOPICS[a.category]?.icon||'📰'} ${TOPICS[a.category]?.name||'资讯'}`,'personal-cat'),text('strong',personalImpact(a)),text('span',a.title+' ↗','personal-news'));grid.append(item)}
 node.append(grid);
}
function card(a){
 const c=document.createElement('article');c.className='card';
 let header=text('div','','cmeta');let tag=text('span',`${TOPICS[a.category]?.icon||'📰'} ${TOPICS[a.category]?.name||'资讯'}`,'ctag');header.append(tag,text('span',tzDate(a.published_at),'ctime'));c.append(header);
 {const impact=personalImpact(a);if(impact){const im=text('div','','impact');im.append(text('strong','✨ 与你有关'),document.createTextNode(impact));c.append(im)}}
 c.append(text('h3',a.title));
 if(a.image&&safeLink(a.image)!=='#'){let img=document.createElement('img');img.className='thumb';img.src=safeLink(a.image);img.alt='文章来源提供的配图';img.loading='lazy';img.referrerPolicy='no-referrer';img.onerror=()=>img.remove();c.append(img)}
 c.append(text('p',a.summary,'desc'));
 const foot=text('div','','card-foot');const source=text('div','','');source.append(link((a.source||'原始来源')+' ↗',a.url,'read'));foot.append(source);
 const btn=text('button',saved.includes(a.url)?'★':'☆','save'+(saved.includes(a.url)?' saved':''));btn.type='button';btn.setAttribute('aria-label',saved.includes(a.url)?'取消收藏':'收藏新闻');btn.onclick=()=>{saved=saved.includes(a.url)?saved.filter(x=>x!==a.url):[...saved,a.url];try{localStorage.setItem('island-saved',JSON.stringify(saved))}catch{}render()};foot.append(btn);c.append(foot);return c
}
function featured(a){
 const section=$('#featured');section.replaceChildren();if(!a||!(['all','obsidian'].includes(filter))||q||filter==='saved')return;
 let box=text('div','','featured');const meta=text('div','','feature-meta');meta.append(text('span','💎 OBSIDIAN WATCH','feat-kicker'),badge(a));box.append(meta);
 {const impact=personalImpact(a);if(impact){const im=text('div','','feature-impact');im.append(text('strong','✨ 与你有关'),document.createTextNode(impact));box.append(im)}}
 box.append(text('h2',a.title),text('p',a.summary));
 const foot=text('div','','featured-foot');foot.append(text('span',`${a.source||'Obsidian 官方'} · ${tzDate(a.published_at)}${a.is_recent?' · 历史更新回顾':''}`,'source-text'),link('查看官方来源 ↗',a.url,'feature-link'));box.append(foot);section.append(box)
}
function render(){if(!issue)return;personalSpotlight();const featuredItem=(issue.items||[]).find(x=>x.category==='obsidian');featured(featuredItem);const items=selection().filter(x=>!(['all','obsidian'].includes(filter)&&!q&&x.category==='obsidian'));const cards=$('#cards');cards.replaceChildren();items.forEach(a=>cards.append(card(a)));if(!items.length)cards.append(text('div',filter==='obsidian'&&featuredItem?'本期 Obsidian 专题已在上方展示。':'这个筛选条件下没有资讯。','empty'));$('#articles-title').textContent=filter==='obsidian'?'Obsidian 其他资讯':filter==='saved'?'收藏的新闻':filter==='all'?'其他五大领域':TOPICS[filter]?.name||'今日资讯';$('#count').textContent=`${selection().length} 条内容`;
const day=issue.date||'—';$('#issue-date').textContent=day.replace(/^(\d{4})-/,'').replace('-','月')+'日';$('#issue-weekday').textContent=issue.demo?'演示版 · 自动更新后替换':'最新已发布数据';let info=issue.demo?'当前是示例数据；尚未连接每日自动采集。上传至 GitHub 后运行一次“更新晨报数据”即可替换。':`上次成功生成：${tzDate(issue.generated_at)}（北京时间）。网站读取 GitHub 上已发布的内容，不会凭空生成新闻。`;
if(issue.ai_generated===false)info+=issue.machine_translated?' · 已尝试免费机器翻译；内容请以来源为准。':' · 自动中文翻译尚未完成，部分资讯可能为原文语言。';$('#notice').textContent=info;
$('#statusline').textContent='⚠️ 文章来源与标题由 RSS 提供，AI 摘要可能有误。重要新闻及行情请以原始来源为准；新闻不是投资建议。';}
async function loadIssue(path){$('#cards').replaceChildren(text('div','正在读取资讯…','loading'));try{const r=await fetch(path,{cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);const data=await r.json();if(!Array.isArray(data.items))throw Error('无效数据');issue=data;render()}catch(err){issue=window.__DEMO_NEWS__;render();$('#notice').textContent='离线预览 / 无法读取已发布数据：正在展示内置演示资讯。提示：本地直接打开 HTML 时无法使用 fetch，上传 GitHub Pages 即可读取每日 JSON。';}}
async function loadArchives(){try{const r=await fetch('data/archive/index.json',{cache:'no-store'});if(!r.ok)throw Error();const data=await r.json();archiveIndex=Array.isArray(data)?data:[];for(const a of archiveIndex){const o=document.createElement('option');o.value=a.path;o.textContent=a.date;$('#archive').append(o)}}catch{}}
for(const b of document.querySelectorAll('.tab'))b.addEventListener('click',()=>{filter=b.dataset.filter;document.querySelectorAll('.tab').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-selected',x===b?'true':'false')});render()});$('#search').addEventListener('input',e=>{q=e.target.value.trim();render()});$('#archive').addEventListener('change',e=>loadIssue(e.target.value==='latest'?'data/news.json':e.target.value));$('#reload').addEventListener('click',()=>{const path=$('#archive').value;loadIssue(path==='latest'?'data/news.json':path)});let dark=false;try{dark=localStorage.getItem('island-theme')==='dark'}catch{}document.documentElement.dataset.theme=dark?'dark':'light';$('#theme').textContent=dark?'☀':'☾';$('#theme').onclick=()=>{dark=!dark;document.documentElement.dataset.theme=dark?'dark':'light';$('#theme').textContent=dark?'☀':'☾';try{localStorage.setItem('island-theme',dark?'dark':'light')}catch{}};

// 私人数据只以 AES-256-GCM 密文保存在公共站点，密钥只在本次页面会话中使用。
const b64bytes=s=>Uint8Array.from(atob(s),ch=>ch.charCodeAt(0));
const privateDialog=$('#private-dialog');
$('#private-unlock').addEventListener('click',()=>{
 $('#private-message').textContent='';
 if(typeof privateDialog.showModal==='function')privateDialog.showModal();else privateDialog.hidden=false;
 $('#private-password').focus();
});
$('#private-close').addEventListener('click',()=>{privateDialog.close?.();privateDialog.hidden=true;$('#private-password').value=''});
$('#private-form').addEventListener('submit',async event=>{
 event.preventDefault();
 const input=$('#private-password');const password=input.value;
 const message=$('#private-message');input.value='';
 if(password.length<12){message.textContent='请输入完整密钥。';return}
 message.textContent='正在本地验证并解密…';
 try{
   const response=await fetch('data/private/personal.enc.json',{cache:'no-store'});
   if(!response.ok)throw Error('not-configured');
   const encrypted=await response.json();
   if(encrypted.version!==1||encrypted.kdf!=='PBKDF2-SHA256'||encrypted.cipher!=='AES-256-GCM')throw Error('format');
   const keyMaterial=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveKey']);
   const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:b64bytes(encrypted.salt),iterations:encrypted.iterations,hash:'SHA-256'},keyMaterial,{name:'AES-GCM',length:256},false,['decrypt']);
   const plaintext=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64bytes(encrypted.nonce),additionalData:new TextEncoder().encode('island-daily-private-v1')},key,b64bytes(encrypted.ciphertext));
   const payload=JSON.parse(new TextDecoder().decode(plaintext));
   if(!payload||typeof payload.date!=='string'||!Array.isArray(payload.items))throw Error('payload');
   privatePayload=payload;message.textContent='';
   privateDialog.close?.();privateDialog.hidden=true;
   $('#private-unlock').textContent='🔓 私人分析';
   render();
 }catch(error){privatePayload=null;render();message.textContent=error.message==='not-configured'?'私人分析尚未配置，公开新闻可正常阅读。':'密钥不匹配，或私人文件已损坏。'}
});

loadIssue('data/news.json');loadArchives();
})();