const state = {
  projects:[
    {title:'Amazon Cloud', href:'#', poster:'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400'},
    {title:'Telegram Clone', href:'#', poster:'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400'}
  ],
  movies: JSON.parse(localStorage.getItem('nova_movies')) || [],
  accounts: JSON.parse(localStorage.getItem('nova_accounts')) || [],
  contacts: JSON.parse(localStorage.getItem('nova_contacts')) || []
};

const $ = s=>document.querySelector(s);
const $$ = s=>document.querySelectorAll(s);

// 卡片模板
function cardTemplate(item,type='project'){
  const isVideo = item.href && (item.href.match(/\.(mp4|webm|ogg)$/i) || item.href.startsWith('blob:'));
  const media = isVideo ? `<video class="thumb" src="${item.href}" controls preload="metadata"></video>` 
                        : `<img class="thumb" src="${item.poster}" alt="${item.title}" loading="lazy"/>`;
  return `<div class="card">${media}<div class="meta"><span class="pill">${type==='movie'?(isVideo?'Play':'Watch'):'Open'}</span></div></div>`;
}

function renderProjects(){ $('#projectGrid').innerHTML = state.projects.map(p=>cardTemplate(p)).join(''); }
function renderMovies(){ $('#movieGrid').innerHTML = state.movies.map(m=>cardTemplate(m,'movie')).join(''); }
function renderAccounts(){
  const list = state.accounts.map((a,i)=>`<div class="card" style="padding:8px;">
    <div>${a.name}</div><div class="muted" style="font-size:12px">${a.link}</div>
    <button class="btn ghost" data-i="${i}">Copy</button></div>`).join('');
  $('#accountList').innerHTML = list;
  $$('#accountList .btn').forEach(btn=>btn.addEventListener('click',()=>{
    const i = btn.dataset.i; navigator.clipboard.writeText(state.accounts[i].link); alert('Copied!');
  }));
}
function renderContacts(){
  const list = state.contacts.map((c,i)=>`<div class="card" style="padding:8px;">
    <div>${c.name}</div><div class="muted">${c.info}</div>
    <button class="btn ghost" data-i="${i}">Delete</button></div>`).join('');
  $('#contactList').innerHTML=list;
  $$('#contactList .btn').forEach(btn=>{
    const i=btn.dataset.i; btn.addEventListener('click',()=>{
      state.contacts.splice(i,1); localStorage.setItem('nova_contacts',JSON.stringify(state.contacts)); renderContacts();
    });
  });
}

// 弹窗
let currentModal=''; // movie / account / contact
function openModal(type){
  currentModal=type; $('#inputModal').style.display='flex';
  if(type==='movie'){
    $('#modalTitle').textContent='Add Movie';
    $('#label1').textContent='Title'; $('#label2').textContent='Video URL'; $('#label3').textContent='Poster URL';
    $('#field3').style.display='block';
  } else if(type==='account'){
    $('#modalTitle').textContent='Add AI Account';
    $('#label1').textContent='Name'; $('#label2').textContent='Login Link'; $('#field3').style.display='none';
  } else {
    $('#modalTitle').textContent='Add Contact';
    $('#label1').textContent='Name'; $('#label2').textContent='Information'; $('#field3').style.display='none';
  }
  $('#input1').value=''; $('#input2').value=''; $('#input3').value='';
}
function closeModal(){ $('#inputModal').style.display='none'; }

$('#submitModal').addEventListener('click',()=>{
  const val1=$('#input1').value.trim(), val2=$('#input2').value.trim(), val3=$('#input3').value.trim();
  if(!val1) return alert('Please enter required info');
  if(currentModal==='movie'){
    state.movies.push({title:val1, href:val2, poster:val3||'https://images.unsplash.com/photo-1517602302552-471fe67acf66?q=80&w=1200'});
    localStorage.setItem('nova_movies',JSON.stringify(state.movies)); renderMovies();
  } else if(currentModal==='account'){
    state.accounts.push({name:val1, link:val2});
    localStorage.setItem('nova_accounts',JSON.stringify(state.accounts)); renderAccounts();
  } else if(currentModal==='contact'){
    state.contacts.push({name:val1, info:val2});
    localStorage.setItem('nova_contacts',JSON.stringify(state.contacts)); renderContacts();
  }
  closeModal();
});
$('#closeModal').addEventListener('click', closeModal);

// 打开弹窗按钮
$('#openMovieModal').addEventListener('click',()=>openModal('movie'));
$('#openAccountModal').addEventListener('click',()=>openModal('account'));
$('#openContactModal').addEventListener('click',()=>openModal('contact'));

// 拖拽上传
const drop = $('#dropZone');
['dragenter','dragover'].forEach(e=>drop.addEventListener(e,ev=>{ev.preventDefault(); drop.classList.add('drag');}));
['dragleave','drop'].forEach(e=>drop.addEventListener(e,ev=>{ev.preventDefault(); drop.classList.remove('drag');}));
drop.addEventListener('drop', e=>{
  const items=e.dataTransfer.items;
  for(const it of items){
    if(it.kind==='file'){
      const f=it.getAsFile();
      if(f){
        if(f.type.startsWith('image/')){ state.movies.push({title:f.name, href:'#', poster:URL.createObjectURL(f)}); }
        else if(f.type.startsWith('video/')){ state.movies.push({title:f.name, href:URL.createObjectURL(f), poster:''}); }
      }
    }
  }
  localStorage.setItem('nova_movies',JSON.stringify(state.movies)); renderMovies();
});

// 搜索
$('#searchInput').addEventListener('input',e=>{
  const q=e.target.value.toLowerCase();
  $('#projectGrid').innerHTML=state.projects.filter(p=>p.title.toLowerCase().includes(q)).map(p=>cardTemplate(p)).join('');
  $('#movieGrid').innerHTML=state.movies.filter(m=>m.title.toLowerCase().includes(q)).map(p=>cardTemplate(p,'movie')).join('');
  $('#accountList').innerHTML=state.accounts.filter(a=>a.name.toLowerCase().includes(q)).map((a,i)=>`<div class="card" style="padding:8px;"><div>${a.name}</div><div class="muted">${a.link}</div></div>`).join('');
  $('#contactList').innerHTML=state.contacts.filter(c=>c.name.toLowerCase().includes(q)).map((c,i)=>`<div class="card" style="padding:8px;"><div>${c.name}</div><div class="muted">${c.info}</div></div>`).join('');
});

// 初始渲染
renderProjects(); renderMovies(); renderAccounts(); renderContacts();
