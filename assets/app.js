(()=>{
'use strict';
const TOPICS={ai:{name:'AI 大模型',icon:'🤖'},dev:{name:'开发与开源',icon:'💻'},market:{name:'纳指与投资',icon:'📈'},digital:{name:'数码科技',icon:'📱'},world:{name:'全球要闻',icon:'🌍'},obsidian:{name:'Obsidian 专题',icon:'💎'}};
const $=s=>document.querySelector(s);let issue=null;let filter='all';let q='';let archiveIndex=[];
let accessGranted=false;
const personalImpact=a=>accessGranted&&typeof a?.impact==='string'?a.impact:'';
let saved=[];try{saved=JSON.parse(localStorage.getItem('island-saved')||'[]')}catch{}if(!Array.isArray(saved))saved=[];
const tzDate=iso=>{if(!iso)return '日期待核实';const d=new Date(iso);return isNaN(d)?'日期待核实':new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}).format(d)};
const safeLink=u=>{try{const v=new URL(u);return ['https:','http:'].includes(v.protocol)?v.href:'#'}catch{return '#'}};
const text=(tag,txt,cls)=>{const e=document.createElement(tag);if(cls)e.className=cls;e.textContent=txt||'';return e};
const link=(label,url,cls)=>{const a=text('a',label,cls);a.href=safeLink(url);a.target='_blank';a.rel='noopener noreferrer';return a};
const selection=()=>{if(!issue)return[];let items=Array.isArray(issue.items)?issue.items:[];if(filter==='saved')items=items.filter(a=>saved.includes(a.url));else if(filter!=='all')items=items.filter(a=>a.category===filter);if(q)items=items.filter(a=>([a.title,a.summary,accessGranted?a.impact:'',a.source].join(' ')).toLowerCase().includes(q.toLowerCase()));return items;};
function badge(a){const el=text('span',a.is_recent?'近期回顾':'最新动态','fresh'+(a.is_recent?' old':''));return el}
function personalSpotlight(){
 const node=$('#personal-focus');node.replaceChildren();node.hidden=true;
 if(!issue||!accessGranted)return;
 const all=Array.isArray(issue.items)?issue.items:[];
 let items=filter==='all'?['obsidian','ai','market'].map(k=>all.find(a=>a.category===k)).filter(Boolean):selection();
 items=items.filter(a=>personalImpact(a)).slice(0,filter==='all'?3:2);
 if(!items.length)return; node.hidden=false;
 const head=text('div','','personal-head');const titlebox=text('div','');
 titlebox.append(text('div','✦ FOR YOU · 与你有关','personal-overline'),text('h2','与你最相关的消息'),text('p','只有输入正确密钥才显示此区域。'));
 head.append(titlebox,text('span','🔐','personal-mark'));node.append(head);
 const grid=text('div','','personal-grid');
 for(const a of items){const item=link('',a.url,'personal-item');item.append(text('span',`${TOPICS[a.category]?.icon||'📰'} ${TOPICS[a.category]?.name||'资讯'}`,'personal-cat'),text('strong',personalImpact(a)),text('span',a.title+' ↗','personal-news'));grid.append(item)}
 node.append(grid);
}
function card(a){
 const c=document.createElement('article');c.className='card';
 let header=text('div','','cmeta');let tag=text('span',`${TOPICS[a.category]?.icon||'📰'} ${TOPICS[a.category]?.name||'资讯'}`,'ctag');header.append(tag,text('span',(a.date_kind==='observed'?'本站观察时间 · ':'发布时间 · ')+tzDate(a.published_at),'ctime'));c.append(header);
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
 const foot=text('div','','featured-foot');foot.append(text('span',`${a.source||'Obsidian 官方'} · ${a.date_kind==='observed'?'本站观察时间':'发布时间'} ${tzDate(a.published_at)}${a.is_recent?' · 历史更新回顾':''}`,'source-text'),link('查看官方来源 ↗',a.url,'feature-link'));box.append(foot);section.append(box)
}
function render(){if(!issue)return;personalSpotlight();const featuredItem=(issue.items||[]).find(x=>x.category==='obsidian');featured(featuredItem);const items=selection().filter(x=>!(featuredItem&&['all','obsidian'].includes(filter)&&!q&&x.url===featuredItem.url));const cards=$('#cards');cards.replaceChildren();items.forEach(a=>cards.append(card(a)));if(!items.length)cards.append(text('div',filter==='obsidian'&&featuredItem?'本期 Obsidian 专题已在上方展示。':'这个筛选条件下没有资讯。','empty'));$('#articles-title').textContent=filter==='obsidian'?'Obsidian 其他资讯':filter==='saved'?'收藏的新闻':filter==='all'?'六大领域最新资讯':TOPICS[filter]?.name||'今日资讯';$('#count').textContent=`${selection().length} 条内容`;
const day=issue.date||'—';$('#issue-date').textContent=day.replace(/^(\d{4})-/,'').replace('-','月')+'日';$('#issue-weekday').textContent=issue.demo?'演示版 · 自动更新后替换':'最新已发布数据';let info=issue.demo?'当前是示例数据；尚未连接每日自动采集。上传至 GitHub 后运行一次“更新晨报数据”即可替换。':`上次成功生成：${tzDate(issue.generated_at)}（北京时间）。网站读取 GitHub 上已发布的内容，不会凭空生成新闻。`;
if(issue.ai_generated===false)info+=issue.machine_translated?' · 已尝试免费机器翻译；内容请以来源为准。':' · 自动中文翻译尚未完成，部分资讯可能为原文语言。';$('#notice').textContent=info;
$('#statusline').textContent='⚠️ 文章来源与标题由 RSS 提供，AI 摘要可能有误。重要新闻及行情请以原始来源为准；新闻不是投资建议。';}
async function loadIssue(path){$('#cards').replaceChildren(text('div','正在读取资讯…','loading'));try{const r=await fetch(path,{cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);const data=await r.json();if(!Array.isArray(data.items))throw Error('无效数据');issue=data;render()}catch(err){issue=window.__DEMO_NEWS__;render();$('#notice').textContent='离线预览 / 无法读取已发布数据：正在展示内置演示资讯。提示：本地直接打开 HTML 时无法使用 fetch，上传 GitHub Pages 即可读取每日 JSON。';}}
async function loadArchives(){try{const r=await fetch('data/archive/index.json',{cache:'no-store'});if(!r.ok)throw Error();const data=await r.json();archiveIndex=Array.isArray(data)?data:[];for(const a of archiveIndex){const o=document.createElement('option');o.value=a.path;o.textContent=a.date;$('#archive').append(o)}}catch{}}
for(const b of document.querySelectorAll('.tab'))b.addEventListener('click',()=>{filter=b.dataset.filter;document.querySelectorAll('.tab').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-selected',x===b?'true':'false')});render()});$('#search').addEventListener('input',e=>{q=e.target.value.trim();render()});$('#archive').addEventListener('change',e=>loadIssue(e.target.value==='latest'?'data/news.json':e.target.value));$('#reload').addEventListener('click',()=>{const path=$('#archive').value;loadIssue(path==='latest'?'data/news.json':path)});let dark=false;try{dark=localStorage.getItem('island-theme')==='dark'}catch{}document.documentElement.dataset.theme=dark?'dark':'light';$('#theme').textContent=dark?'☀':'☾';$('#theme').onclick=()=>{dark=!dark;document.documentElement.dataset.theme=dark?'dark':'light';$('#theme').textContent=dark?'☀':'☾';try{localStorage.setItem('island-theme',dark?'dark':'light')}catch{}};

// 轻量访问码：只负责网页显示控制。公开仓库里的 impact 明文仍可被直接查看。
const privateDialog=$('#private-dialog');
const unlock=$('#private-unlock');
unlock.addEventListener('click',()=>{
  if(accessGranted){
    accessGranted=false;unlock.textContent='🔒 与你有关';
    render();return;
  }
  $('#private-message').textContent='';
  if(typeof privateDialog.showModal==='function')privateDialog.showModal();else privateDialog.hidden=false;
  $('#private-password').focus();
});
$('#private-close').addEventListener('click',()=>{privateDialog.close?.();privateDialog.hidden=true;$('#private-password').value='';});
$('#private-form').addEventListener('submit',async event=>{
  event.preventDefault();
  const input=$('#private-password'),value=input.value;
  input.value='';
  const msg=$('#private-message');
  msg.textContent='正在验证密钥…';
  try{
    if(!crypto?.subtle)throw Error('https');
    const res=await fetch('data/access.json',{cache:'no-store'});
    if(!res.ok)throw Error('config');
    const cfg=await res.json();
    const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));
    const hash=Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
    if(!cfg.key_sha256 || hash!==cfg.key_sha256)throw Error('invalid');
    accessGranted=true;msg.textContent='';
    privateDialog.close?.();privateDialog.hidden=true;
    unlock.textContent='🔓 隐藏私人分析';
    render();
  }catch(e){accessGranted=false;render();msg.textContent=e.message==='invalid'?'访问密钥不匹配。':e.message==='https'?'请通过 HTTPS 打开网页。':'暂时无法验证密钥。';}
});

// 手动更新任务从 Cloudflare Worker 触发；GitHub Token 只保存在 Worker 的 Secret。
// GitHub Token 只在 Cloudflare Worker Secret 内。此处仅保存用户自愿记住的更新密码。
const UPDATE_ENDPOINT='https://island-daily-refresh.evinvin486.workers.dev/refresh';
const REMEMBER_KEY='island-daily-update-password-v1';
const manualState=$('#manual-refresh-state');
const manualButton=$('#manual-refresh-news');
const forgetButton=$('#forget-refresh-password');
const refreshDialog=$('#refresh-dialog');
const refreshForm=$('#refresh-form');
const refreshInput=$('#refresh-password');
const refreshRemember=$('#refresh-remember');
const refreshFeedback=$('#refresh-feedback');
const refreshSubmit=$('#refresh-submit');
let manualPollId=null,manualPollCount=0,requestBusy=false;
const rememberedPassword=()=>{try{return localStorage.getItem(REMEMBER_KEY)||''}catch{return ''}};
const forgetRemembered=()=>{try{localStorage.removeItem(REMEMBER_KEY)}catch{};forgetButton.hidden=true};
const syncRememberedButton=()=>{forgetButton.hidden=!rememberedPassword()};
syncRememberedButton();

function closeUpdateDialog(){
  refreshInput.value='';
  if(typeof refreshDialog.close==='function')refreshDialog.close();
  else refreshDialog.removeAttribute('open');
}
function showUpdateDialog(reason=''){
  refreshInput.value='';refreshFeedback.textContent=reason;
  if(typeof refreshDialog.showModal==='function')refreshDialog.showModal();
  else refreshDialog.setAttribute('open','');
  refreshInput.focus();
}
forgetButton.addEventListener('click',()=>{
  forgetRemembered();
  manualState.textContent='已清除当前浏览器保存的更新密码。下次采集时需要重新输入。';
});

function watchForPublishedNews(previousVersion){
  if(manualPollId)clearInterval(manualPollId);
  manualPollCount=0;
  manualPollId=setInterval(async()=>{
    manualPollCount++;
    try{
      const r=await fetch('data/news.json?refresh='+Date.now(),{cache:'no-store'});
      if(r.ok){
        const updated=await r.json();
        if(Array.isArray(updated.items)&&updated.generated_at&&updated.generated_at!==previousVersion){
          issue=updated;$('#archive').value='latest';render();
          manualState.textContent='✅ 新闻已更新，本期共 '+updated.items.length+' 条。';
          clearInterval(manualPollId);manualPollId=null;return;
        }
      }
    }catch{}
    if(manualPollCount>=20){
      clearInterval(manualPollId);manualPollId=null;
      manualState.textContent='尚未检测到新的公开数据。请稍后刷新，或查看 GitHub Actions 是否成功。';
    }
  },15000);
}

async function submitUpdate(password, remember, fromCache=false){
  if(requestBusy||!password)return;
  requestBusy=true;
  manualButton.disabled=true;refreshSubmit.disabled=true;
  refreshFeedback.textContent='正在联系 Cloudflare Worker…';
  manualState.textContent='正在验证并提交更新任务…';
  const previousVersion=issue?.generated_at||'';
  try{
    const r=await fetch(UPDATE_ENDPOINT,{
      method:'POST',mode:'cors',credentials:'omit',cache:'no-store',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({password})
    });
    let result=null;try{result=await r.json()}catch{}
    if(!r.ok||result?.success!==true){
      let msg=result?.error||'Worker 未返回预期数据，请确认已部署更新接口。';
      if(r.status===401)msg='更新密码错误，请重新输入。';
      if(r.status===503)msg='Worker 的两个 Secret 尚未生效。';
      if(r.status===502)msg='Worker 触发 GitHub 失败，请检查 GitHub Token 的 Actions 权限。';
      const error=new Error(msg);
      error.status=r.status;throw error;
    }
    if(remember){try{localStorage.setItem(REMEMBER_KEY,password)}catch{}}
    else forgetRemembered();
    syncRememberedButton();
    closeUpdateDialog();
    manualState.textContent='✅ 已提交更新任务，正在等待 GitHub 发布（自动检查约5分钟）。';
    watchForPublishedNews(previousVersion);
  }catch(err){
    const msg=err instanceof TypeError
      ? '无法连接 Worker，请检查 Worker 的代码部署和 CORS 设置。'
      : err.message||'请求失败，请稍后重试。';
    if(fromCache){
      // 密码失效时自动丢弃缓存，其他连接错误仍允许稍后重试。
      if(err.status===401){forgetRemembered();showUpdateDialog('已保存的密码失效，请重新输入。')}
      else manualState.textContent=msg;
    }else refreshFeedback.textContent=msg;
  }finally{
    requestBusy=false;manualButton.disabled=false;refreshSubmit.disabled=false;
  }
}

manualButton.addEventListener('click',()=>{
  if(requestBusy)return;
  const saved=rememberedPassword();
  if(saved){submitUpdate(saved,true,true);return}
  showUpdateDialog();
});
$('#refresh-cancel').addEventListener('click',closeUpdateDialog);
refreshForm.addEventListener('submit',e=>{
  e.preventDefault();
  const password=refreshInput.value;
  refreshInput.value='';
  if(!password){refreshFeedback.textContent='请输入更新密码。';return}
  submitUpdate(password,refreshRemember.checked,false);
});
$('#manual-read-latest').addEventListener('click',()=>{
  $('#archive').value='latest';loadIssue('data/news.json');
  manualState.textContent='已重新读取当前发布的数据；没有执行新一轮新闻采集。';
});

loadIssue('data/news.json');loadArchives();
})();