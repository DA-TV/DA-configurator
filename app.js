const MODELS={node:{name:'D Node',uid:'5f9f2516df1a452c84577b989e7f3452',second:'GRILLE',body:['TELO'],secondary:['MREZICA','MREŽICA','GRILLE']},pulse:{name:'D Pulse',uid:'595f780f80004aadba6c4163b0d44ef6',second:'HANDLE',body:['TELO','BODY','KUCISTE','KUĆIŠTE','WOOFER'],secondary:['HANDLE','RUCKA','RUČKA']}};
const RAL={9003:{name:'Signal white',hex:'#F4F4F4'},9011:{name:'Graphite black',hex:'#23282B'},1018:{name:'Zinc yellow',hex:'#F3E03B'},3028:{name:'Pure red',hex:'#CB3234'},6034:{name:'Pastel turquoise',hex:'#7FB5B5'},2017:{name:'RAL orange',hex:'#FA4402'},3017:{name:'Rose',hex:'#CB555D'},6013:{name:'Reed green',hex:'#7D765A'}},codes=['9003','9011','1018','3028','6034','2017','3017','6013'];
const selection={node:{BODY:'1018',SECOND:'9011'},pulse:{BODY:'9011',SECOND:'1018'}},custom={node:{BODY:false,SECOND:false},pulse:{BODY:false,SECOND:false}};let current='node',api=null,materials=[],loadId=0,dragY=0,dragging=false;const $=s=>document.querySelector(s),linear=h=>[1,3,5].map(i=>Math.pow(parseInt(h.slice(i,i+2),16)/255,2.2)),srgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255),norm=s=>String(s||'').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
function message(t){$('#status').textContent=t;$('#status').hidden=false;setTimeout(()=>$('#status').hidden=true,2500)}
function findMaterial(group){const aliases=(group==='BODY'?MODELS[current].body:MODELS[current].secondary).map(norm);return materials.find(m=>aliases.includes(norm(m.name)))||materials.find(m=>aliases.some(a=>norm(m.name).includes(a)))}
function apply(group,hex){const m=findMaterial(group);if(!api||!m)return;const ch=m.channels?.AlbedoPBR||m.channels?.DiffusePBR||m.channels?.DiffuseColor;if(!ch)return;ch.color=linear(hex);ch.factor=1;ch.enable=true;api.setMaterial(m)}
function render(group,id){const root=$(id);root.innerHTML='';codes.forEach(code=>{const c=RAL[code],w=document.createElement('div');w.className='swatch-wrap';w.innerHTML=`<button class="swatch" style="background:${c.hex}" aria-label="RAL ${code} ${c.name}"></button><div class="swatch-label">RAL ${code}<br>${c.name}</div>`;w.querySelector('button').onclick=()=>choose(group,code);root.append(w)})}
function updateUI(){[['BODY','#bodySwatches','#bodyCustom','#bodyCustomName'],['SECOND','#secondSwatches','#secondCustom','#secondCustomName']].forEach(([g,list,circle,name])=>{document.querySelectorAll(`${list} .swatch`).forEach((b,i)=>b.classList.toggle('active',codes[i]===selection[current][g]));$(circle).style.setProperty('background-color',custom[current][g]?RAL[selection[current][g]].hex:'transparent','important');$(name).textContent=custom[current][g]?`RAL ${selection[current][g]} · ${RAL[selection[current][g]].name}`:'–'});$('#secondTitle').textContent=MODELS[current].second;$('#secondChoiceLabel').childNodes[0].nodeValue=`CHOSEN ${MODELS[current].second} COLOUR`;}
function choose(group,code){selection[current][group]=code;custom[current][group]=false;updateUI();apply(group,RAL[code].hex)}
function customRal(group){const id=group==='BODY'?'body':'second',m=$(`#${id}Ral`).value.trim().match(/^(?:RAL\s*)?(\d{4})$/i),code=m?.[1];if(!RAL[code])return message('Enter a valid RAL Classic code.');selection[current][group]=code;custom[current][group]=true;updateUI();apply(group,RAL[code].hex)}
async function loadRal(){try{const r=await fetch('https://cdn.jsdelivr.net/gh/iw365/RAL-palette-data@main/RAL-classic/ral-classic-uncategorised-rounded.json'),d=await r.json();Object.entries(d).forEach(([k,v])=>{const h=String(v.hex||'').replace('#','');if(/^\d{4}$/.test(k)&&/^[0-9a-f]{6}$/i.test(h))RAL[k]={name:v.name||`RAL ${k}`,hex:'#'+h.toUpperCase()}})}catch(e){}}
function loadModel(key){current=key;updateUI();document.querySelectorAll('.product').forEach(b=>b.classList.toggle('active',b.dataset.product===key));const token=++loadId,frame=$('#api-frame');frame.src='about:blank';$('#status').hidden=false;setTimeout(()=>new Sketchfab('1.12.1',frame).init(MODELS[key].uid,{autostart:1,preload:1,ui_infos:0,ui_watermark:0,success:v=>{if(token!==loadId)return;api=v;v.start();v.addEventListener('viewerready',()=>{v.getMaterialList((e,l)=>{materials=l||[];$('#status').hidden=true;v.setBackground({color:[...srgb($('#bgColour').value),1]});apply('BODY',RAL[selection[key].BODY].hex);apply('SECOND',RAL[selection[key].SECOND].hex);refresh()})})}}),40)}
function setOpen(open){const menu=$('#menu'),app=$('#app'),openButton=$('#openMenu');menu.classList.toggle('closed',!open);app.classList.toggle('menu-closed',!open);openButton.hidden=open;openButton.setAttribute('aria-expanded',String(open));requestAnimationFrame(()=>requestAnimationFrame(refresh));setTimeout(refresh,320)}function refresh(){try{api?.resize?.()}catch(e){}}
render('BODY','#bodySwatches');render('SECOND','#secondSwatches');loadRal().then(()=>{render('BODY','#bodySwatches');render('SECOND','#secondSwatches');updateUI();loadModel('node')});
$('.product[data-product="node"]').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();loadModel('node')});$('.product[data-product="pulse"]').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();loadModel('pulse')});$('#bodyCustom').onclick=()=>mobileRalMode()?openMobileRalBubble('BODY'):customRal('BODY');$('#secondCustom').onclick=()=>mobileRalMode()?openMobileRalBubble('SECOND'):customRal('SECOND');$('#bodyRal').onkeydown=e=>{if(e.key==='Enter')customRal('BODY')};$('#secondRal').onkeydown=e=>{if(e.key==='Enter')customRal('SECOND')};$('#closeMenu').onclick=()=>setOpen(false);$('#openMenu').onclick=()=>setOpen(true);$('#bgColour').oninput=e=>{stage.style.background=e.target.value;api?.setBackground?.({color:[...srgb(e.target.value),1]})};$('#fullscreen').onclick=()=>document.fullscreenElement?document.exitFullscreen():app.requestFullscreen();
$('#info').onclick=()=>infoDialog.showModal();$('#order').onclick=()=>{interest.value=MODELS[current].name;bodyChoice.value=`RAL ${selection[current].BODY}`;secondChoice.value=`RAL ${selection[current].SECOND}`;orderDialog.showModal()};document.querySelectorAll('.dialogClose').forEach(b=>b.onclick=()=>b.closest('dialog').close());
let extraProductCount=0;
$('#addMore').onclick=()=>{extraProductCount++;const row=document.createElement('div');row.className='additional-product';row.innerHTML=`<div class="additional-main"><label>ADDITIONAL PRODUCT<select required><option value="">Select product</option><option>D Node</option><option>D Pulse</option></select></label><label>QUANTITY<input type="number" min="1" required></label><button type="button" aria-label="Remove additional product">×</button></div><div class="additional-colours" hidden><label>CHOSEN BODY COLOUR *<input placeholder="Type RAL code" required disabled></label><label class="extra-second">CHOSEN GRILLE COLOUR *<input placeholder="Type RAL code" required disabled></label></div>`;const select=row.querySelector('select'),colours=row.querySelector('.additional-colours'),inputs=colours.querySelectorAll('input'),second=row.querySelector('.extra-second');select.onchange=()=>{const show=Boolean(select.value);colours.hidden=!show;inputs.forEach(input=>input.disabled=!show);second.childNodes[0].nodeValue=select.value==='D Pulse'?'CHOSEN HANDLE COLOUR *':'CHOSEN GRILLE COLOUR *'};row.querySelector('button').onclick=()=>row.remove();$('#additionalProducts').append(row)};
$('#inquiry').onsubmit=e=>{e.preventDefault();if(!e.currentTarget.reportValidity())return;const d=new FormData(e.currentTarget),extras=[...document.querySelectorAll('#additionalProducts .additional-product')].map(row=>{const product=row.querySelector('select').value,inputs=row.querySelectorAll('input');return `${product}, quantity ${inputs[0].value}, BODY ${inputs[1].value}, ${product==='D Pulse'?'HANDLE':'GRILLE'} ${inputs[2].value}`});const body=[`Full name: ${d.get('name')}`,`Email: ${d.get('email')}`,`Phone: ${d.get('phone')||'Not provided'}`,`Company / Organization: ${d.get('company')||'Not provided'}`,`Country: ${d.get('country')||'Not provided'}`,'',`Product of interest: ${d.get('product')}`,`Estimated quantity: ${d.get('quantity')}`,`Chosen BODY colour: ${d.get('body')}`,`Chosen ${MODELS[current].second} colour: ${d.get('second')}`,...(extras.length?['','Additional products:',...extras.map(item=>'- '+item)]:[]),'','Message:',d.get('message')].join('\n');location.href=`mailto:info@dirigent-acoustics.co.rs?subject=${encodeURIComponent('Product inquiry: '+d.get('product'))}&body=${encodeURIComponent(body)}`};
function menuSideWidth(){
  if(innerWidth<=600)return Math.min(360,innerWidth*.88);
  if(innerWidth<=900)return Math.min(420,innerWidth*.92);
  return 360;
}
function shouldUseBottomMenu(){
  const displayShorterSide=Math.min(innerWidth,visualViewport?.height||innerHeight);
  const sideModelWidth=Math.max(0,innerWidth-menuSideWidth());
  const sideModelHeight=visualViewport?.height||innerHeight;
  const modelShorterSide=Math.min(sideModelWidth,sideModelHeight);
  return modelShorterSide/displayShorterSide<2/3;
}
function updateMenuPlacement(){
  const bottom=shouldUseBottomMenu();
  app.classList.toggle('menu-bottom',bottom);
  const visibleHeight=visualViewport?.height||innerHeight;
  document.documentElement.style.setProperty('--sheet',`${Math.min(visibleHeight*.48,440)}px`);
  setTimeout(refresh,300);
}
menu.addEventListener('pointerdown',e=>{
  if(!app.classList.contains('menu-bottom'))return;
  if(e.target.closest('button,input,select,textarea,a,label,.swatches'))return;
  dragging=true;dragY=e.clientY;menu.setPointerCapture(e.pointerId);menu.style.transition='none';
});
menu.addEventListener('pointermove',e=>{
  if(!dragging)return;
  const dy=Math.max(0,e.clientY-dragY);
  menu.style.transform=`translateY(${dy}px)`;
});
menu.addEventListener('pointerup',e=>{
  if(!dragging)return;
  dragging=false;
  const dy=e.clientY-dragY;
  menu.style.transition='';menu.style.transform='';
  if(dy>70)setOpen(false);
});
addEventListener('resize',updateMenuPlacement,{passive:true});
visualViewport?.addEventListener('resize',updateMenuPlacement,{passive:true});
addEventListener('orientationchange',()=>setTimeout(updateMenuPlacement,350),{passive:true});
updateMenuPlacement();


/* Mobile Safari-safe custom RAL entry. The temporary input uses 16px text,
   preventing automatic page zoom while preserving the existing RAL logic. */
const ralMobileBubble=$('#ralMobileBubble');
const ralMobileInput=$('#ralMobileInput');
let ralMobileGroup=null;
function mobileRalMode(){return window.matchMedia('(max-width:600px)').matches}
function closeMobileRalBubble(){ralMobileBubble.hidden=true;ralMobileGroup=null}
function openMobileRalBubble(group){
  if(!mobileRalMode())return;
  ralMobileGroup=group;
  const source=$(group==='BODY'?'#bodyRal':'#secondRal');
  ralMobileInput.value=source.value;
  ralMobileBubble.hidden=false;
  requestAnimationFrame(()=>ralMobileInput.focus({preventScroll:true}));
}
function applyMobileRalBubble(){
  if(!ralMobileGroup)return;
  const source=$(ralMobileGroup==='BODY'?'#bodyRal':'#secondRal');
  source.value=ralMobileInput.value;
  customRal(ralMobileGroup);
  closeMobileRalBubble();
}
[['#bodyRal','BODY'],['#secondRal','SECOND']].forEach(([selector,group])=>{
  const source=$(selector);
  source.addEventListener('pointerdown',event=>{
    if(!mobileRalMode())return;
    event.preventDefault();
    source.blur();
    openMobileRalBubble(group);
  });
  source.addEventListener('focus',()=>{
    if(!mobileRalMode())return;
    source.blur();
    openMobileRalBubble(group);
  });
});
$('#ralMobileClose').addEventListener('click',closeMobileRalBubble);
$('#ralMobileApply').addEventListener('click',applyMobileRalBubble);
ralMobileInput.addEventListener('keydown',event=>{
  if(event.key==='Enter'){event.preventDefault();applyMobileRalBubble()}
  if(event.key==='Escape')closeMobileRalBubble();
});
window.addEventListener('resize',()=>{if(!mobileRalMode())closeMobileRalBubble()},{passive:true});
