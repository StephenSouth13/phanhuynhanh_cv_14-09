(function(){
  const apiBase = '../api';

  const state = {
    user: null,
    section: 'home',
    saving: false,
    saveTimer: null,
    data: {
      home: {}, about: {}, resume: {}, portfolio: {}, services: {}, contact: {}
    }
  };

  const sections = [
    { id: 'home', icon: '🏠', label: 'Trang chủ' },
    { id: 'about', icon: '👤', label: 'Về tôi' },
    { id: 'resume', icon: '📄', label: 'Hồ sơ' },
    { id: 'portfolio', icon: '🗂️', label: 'Danh mục' },
    { id: 'services', icon: '🎓', label: 'Chương trình đào tạo' },
    { id: 'contact', icon: '✉️', label: 'Liên hệ' }
  ];

  function h(html){ const t=document.createElement('template'); t.innerHTML=html.trim(); return t.content.firstChild; }
  function qs(sel,root=document){ return root.querySelector(sel); }
  function qsa(sel,root=document){ return Array.from(root.querySelectorAll(sel)); }

  function persistTheme(theme){ try{ localStorage.setItem('admin-theme', theme); document.documentElement.setAttribute('data-theme', theme);}catch(e){} }
  function loadTheme(){ const t = localStorage.getItem('admin-theme') || 'light'; document.documentElement.setAttribute('data-theme', t); }

  async function api(path, opts={}){
    const res = await fetch(`${apiBase}/${path}`, Object.assign({
      headers: opts.body && !(opts.body instanceof FormData) ? { 'Content-Type':'application/json' } : undefined,
      credentials: 'same-origin'
    }, opts));
    const data = await res.json().catch(()=>({}));
    if(!res.ok){ throw new Error(data.error || 'Request failed'); }
    return data.data ?? data;
  }

  function appShell(){
    return h(`
      <div class="admin-layout">
        <aside class="sidebar bg-base-200">
          <div class="p-4 flex items-center gap-3">
            <img src="${state.user?.avatar || '../assets/img/PROFILE.png'}" class="w-10 h-10 rounded-full object-cover" alt="avatar" />
            <div>
              <div class="font-semibold">${state.user?.name || 'Admin'}</div>
              <div class="text-sm opacity-70">${state.user?.email || ''}</div>
            </div>
          </div>
          <ul class="menu p-2">
            ${sections.map(s=>`<li><a class="section-link" data-id="${s.id}">${s.icon} ${s.label}</a></li>`).join('')}
          </ul>
        </aside>
        <main class="content">
          <header class="p-3 flex items-center justify-between border-b border-base-300 bg-base-100">
            <div class="flex items-center gap-3">
              <span class="text-lg font-semibold">Quản trị nội dung</span>
              <span id="saveStatus" class="status-badge badge badge-ghost">Chưa lưu</span>
            </div>
            <div class="flex items-center gap-2">
              <label class="swap swap-rotate mr-2">
                <input id="themeToggle" type="checkbox" />
                <svg class="swap-off fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5.64,17l-.71.71a1,1,0,0,0,1.41,1.41l.71-.71A1,1,0,1,0,5.64,17ZM4,12a1,1,0,0,0-1-1H2a1,1,0,0,0,0,2H3A1,1,0,0,0,4,12Zm1.64-7.36a1,1,0,0,0-1.41,1.41l.71.71A1,1,0,0,0,6.35,5.64Zm12.72,0-.
                71.71a1,1,0,1,0,1.41,1.41l.71-.71A1,1,0,0,0,17.36,4.64ZM12,4a1,1,0,0,0,1-1V2a1,1,0,1,0-2,0V3A1,1,0,0,0,12,4Zm7,7a1,1,0,0,0,1-1H20a1,1,0,0,0,0,2h1A1,1,0,0,0,19,12Zm-7,7a1,1,0,0,0-1,1v1a1,1,0,1,0,2,0V20A1,1,0,0,0,12,19ZM7.05,7.05A7,7,0,1,0,16.95,16.95,7,7,0,0,0,7.05,7.05Z"/></svg>
                <svg class="swap-on fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21.64,13a1,1,0,0,0-1.05-.14,8,8,0,0,1-10.45-10.45,1,1,0,0,0-.14-1.05A1,1,0,0,0,8,1a10,10,0,1,0,10,10A1,1,0,0,0,21.64,13Z"/></svg>
              </label>
              <button id="logoutBtn" class="btn btn-outline btn-sm">Đăng xuất</button>
            </div>
          </header>
          <section id="sectionContainer" class="p-4 section-form"></section>
        </main>
      </div>`);
  }

  function loginView(){
    return h(`
      <div class="min-h-screen flex items-center justify-center p-4">
        <div class="card w-full max-w-md bg-base-100 shadow">
          <div class="card-body">
            <h2 class="card-title">Đăng nhập quản trị</h2>
            <label class="form-control w-full">
              <div class="label"><span class="label-text">Email</span></div>
              <input id="email" type="email" class="input input-bordered w-full" placeholder="admin@example.com" />
            </label>
            <label class="form-control w-full">
              <div class="label"><span class="label-text">Mật khẩu</span></div>
              <input id="password" type="password" class="input input-bordered w-full" placeholder="••••••••" />
            </label>
            <div class="card-actions justify-end mt-2">
              <button id="loginBtn" class="btn btn-primary">Đăng nhập</button>
            </div>
            <p id="loginErr" class="text-error text-sm"></p>
          </div>
        </div>
      </div>`);
  }

  function setSaveStatus(text, kind){
    const el = qs('#saveStatus'); if(!el) return; el.textContent = text; el.className = `status-badge badge ${kind||'badge-ghost'}`;
  }

  function debounceSave(section){
    clearTimeout(state.saveTimer);
    setSaveStatus('Đang lưu...', 'badge-warning');
    state.saveTimer = setTimeout(()=> saveSection(section), 800);
  }

  async function saveSection(section){
    state.saving = true;
    try{
      await api(`page.php?section=${section}`, { method: 'PUT', body: JSON.stringify(state.data[section]) });
      setSaveStatus('Đã lưu ✓', 'badge-success');
    }catch(e){ setSaveStatus('Lỗi lưu', 'badge-error'); }
    finally{ state.saving = false; }
  }

  async function loadSection(section){
    try{
      const res = await api(`page.php?section=${section}`, { method: 'GET' });
      state.data[section] = res || {};
    }catch(e){ state.data[section] = {}; }
  }

  function uploadInput(label, valuePath, section){
    const id = `u_${Math.random().toString(36).slice(2)}`;
    const el = h(`
      <div class="form-control">
        <div class="label"><span class="label-text">${label}</span></div>
        <div class="flex items-center gap-2">
          <input type="file" id="${id}" class="file-input file-input-bordered file-input-sm" accept="image/*" />
          <button class="btn btn-sm" type="button">Tải lên</button>
        </div>
      </div>`);
    const fileInput = qs(`#${id}`, el.parentElement || document);
    const btn = qs('button', el);
    btn.addEventListener('click', async ()=>{
      if(!fileInput.files || !fileInput.files[0]) return;
      const fd = new FormData(); fd.append('file', fileInput.files[0]);
      try{
        const res = await api('upload.php', { method:'POST', body: fd });
        setValueByPath(state.data[section], valuePath, res.url);
        debounceSave(section);
        renderSection(section);
      }catch(e){ alert('Upload thất bại'); }
    });
    return el;
  }

  function setValueByPath(obj, path, value){
    const parts = path.split('.');
    let cur = obj;
    for(let i=0;i<parts.length-1;i++){ if(!(parts[i] in cur)) cur[parts[i]] = {}; cur = cur[parts[i]]; }
    cur[parts[parts.length-1]] = value;
  }

  function input(label, value, oninput, type='text'){
    const el = h(`
      <label class="form-control w-full">
        <div class="label"><span class="label-text">${label}</span></div>
        <input type="${type}" class="input input-bordered w-full" />
      </label>`);
    const inp = qs('input', el); inp.value = value || '';
    inp.addEventListener('input', ev => oninput(ev.target.value));
    return el;
  }

  function textarea(label, value, oninput){
    const el = h(`
      <label class="form-control w-full">
        <div class="label"><span class="label-text">${label}</span></div>
        <textarea class="textarea textarea-bordered min-h-36"></textarea>
      </label>`);
    const inp = qs('textarea', el); inp.value = value || '';
    inp.addEventListener('input', ev => oninput(ev.target.value));
    return el;
  }

  function checkbox(label, checked, onchange){
    const el = h(`<label class="label cursor-pointer gap-3"><span class="label-text">${label}</span><input type="checkbox" class="toggle" ${checked? 'checked':''}/></label>`);
    const to = qs('input', el); to.addEventListener('change', ev => onchange(!!ev.target.checked));
    return el;
  }

  function listEditor({title, items, onChange}){
    const root = h(`<div class="card bg-base-100 shadow"><div class="card-body"><h3 class="card-title">${title}</h3><div class="space-y-2" data-list></div><button class="btn btn-sm" type="button">Thêm</button></div></div>`);
    const list = qs('[data-list]', root);
    function render(){
      list.innerHTML='';
      items.forEach((t, idx)=>{
        const row = h(`<div class="card-draggable flex items-center gap-2"><span class="drag text-xl">↕</span><input class="input input-bordered input-sm flex-1" /></div>`);
        const inp = qs('input', row); inp.value = t;
        inp.addEventListener('input', ev => { items[idx]=ev.target.value; onChange([...items]); debounceSave(state.section);});
        row.draggable = true;
        row.addEventListener('dragstart', e=>{ e.dataTransfer.setData('text/plain', idx.toString()); });
        row.addEventListener('dragover', e=>{ e.preventDefault(); });
        row.addEventListener('drop', e=>{ e.preventDefault(); const from = +e.dataTransfer.getData('text/plain'); const to = idx; const moved = items.splice(from,1)[0]; items.splice(to,0,moved); onChange([...items]); render(); debounceSave(state.section); });
        list.appendChild(row);
      })
    }
    render();
    qs('button', root).addEventListener('click', ()=>{ items.push(''); onChange([...items]); render(); debounceSave(state.section); });
    return root;
  }

  function cardEditor({title, items, onChange}){
    const root = h(`<div class="card bg-base-100 shadow"><div class="card-body"><h3 class="card-title">${title}</h3><div class="grid gap-2" data-list></div><button class="btn btn-sm" type="button">Thêm</button></div></div>`);
    const list = qs('[data-list]', root);
    function render(){
      list.innerHTML='';
      items.forEach((it, idx)=>{
        const card = h(`<div class="p-3 border border-base-300 rounded card-draggable grid gap-2">
          <div class="grid md:grid-cols-2 gap-2">
            <input class="input input-bordered input-sm" placeholder="Tên"/>
            <input class="input input-bordered input-sm" placeholder="Liên kết (URL)"/>
          </div>
          <input class="input input-bordered input-sm" placeholder="Mô tả"/>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3"><span>Hiển thị</span><input type="checkbox" class="toggle"/></div>
            <button class="btn btn-xs btn-error">Xóa</button>
          </div>
        </div>`);
        const [nameInp, urlInp] = qsa('input.input', card);
        const descInp = qsa('input.input')[2] || qs('input[placeholder="Mô tả"]', card);
        const toggle = qs('input.toggle', card);
        nameInp.value = it.name||''; urlInp.value = it.url||''; descInp.value = it.description||''; toggle.checked = it.visible!==false;
        nameInp.addEventListener('input', e=>{ it.name=e.target.value; onChange([...items]); debounceSave(state.section);});
        urlInp.addEventListener('input', e=>{ it.url=e.target.value; onChange([...items]); debounceSave(state.section);});
        descInp.addEventListener('input', e=>{ it.description=e.target.value; onChange([...items]); debounceSave(state.section);});
        toggle.addEventListener('change', e=>{ it.visible=!!e.target.checked; onChange([...items]); debounceSave(state.section);});
        const del = qs('button.btn-error', card);
        del.addEventListener('click', ()=>{ items.splice(idx,1); onChange([...items]); render(); debounceSave(state.section);});
        card.draggable=true;
        card.addEventListener('dragstart', e=>{ e.dataTransfer.setData('text/plain', idx.toString()); });
        card.addEventListener('dragover', e=>{ e.preventDefault(); });
        card.addEventListener('drop', e=>{ e.preventDefault(); const from = +e.dataTransfer.getData('text/plain'); const to = idx; const moved = items.splice(from,1)[0]; items.splice(to,0,moved); onChange([...items]); render(); debounceSave(state.section); });
        list.appendChild(card);
      });
    }
    render();
    qs('button', root).addEventListener('click', ()=>{ items.push({name:'', description:'', image:'', url:'', visible:true}); onChange([...items]); render(); debounceSave(state.section); });
    return root;
  }

  function renderHome(container){
    const d = state.data.home = Object.assign({heading:'', subtitle:'', bannerImage:''}, state.data.home||{});
    const form = h('<div class="grid gap-3"></div>');
    form.appendChild(input('Tiêu đề chính', d.heading, v=>{d.heading=v; debounceSave('home');}));
    form.appendChild(input('Mô tả ngắn', d.subtitle, v=>{d.subtitle=v; debounceSave('home');}));
    form.appendChild(uploadInput('Ảnh nền / banner', 'bannerImage', 'home'));

    const preview = h(`<div class="preview-pane"><div class="mockup-window border bg-base-300"><div class="bg-base-200 p-4"><h3 class="text-xl font-bold">${d.heading||''}</h3><p class="opacity-70">${d.subtitle||''}</p><div class="mt-2 text-xs">${d.bannerImage||''}</div></div></div></div>`);

    container.appendChild(form);
    container.appendChild(preview);
  }

  function renderAbout(container){
    const d = state.data.about = Object.assign({portraitImage:'', headline:'', bioHtml:'', quote:'', socials:{x:'',facebook:'',linkedin:''}, bulletsLeft:[], bulletsRight:[]}, state.data.about||{});
    const form = h('<div class="grid gap-3"></div>');
    form.appendChild(uploadInput('Ảnh chân dung', 'portraitImage', 'about'));
    form.appendChild(input('Tiêu đề nghề nghiệp / học vị', d.headline, v=>{d.headline=v; debounceSave('about');}));
    form.appendChild(textarea('Mô tả (HTML/Markdown)', d.bioHtml, v=>{d.bioHtml=v; debounceSave('about');}));
    form.appendChild(input('Facebook URL', d.socials.facebook||'', v=>{d.socials.facebook=v; debounceSave('about');}));
    form.appendChild(input('LinkedIn URL', d.socials.linkedin||'', v=>{d.socials.linkedin=v; debounceSave('about');}));
    form.appendChild(input('X (Twitter) URL', d.socials.x||'', v=>{d.socials.x=v; debounceSave('about');}));
    form.appendChild(listEditor({title:'Nội dung trái', items: d.bulletsLeft || [], onChange:(arr)=>{d.bulletsLeft=arr;}}));
    form.appendChild(listEditor({title:'Nội dung phải', items: d.bulletsRight || [], onChange:(arr)=>{d.bulletsRight=arr;}}));

    const preview = h(`<div class="preview-pane"><div class="prose max-w-none"><h3>${d.headline||''}</h3>${d.bioHtml||''}</div></div>`);
    container.appendChild(form); container.appendChild(preview);
  }

  function renderResume(container){
    const d = state.data.resume = Object.assign({summary:'', degrees:[], nationalProjects:[], contributions:[], experiences:[], teaching:[], achievements:[]}, state.data.resume||{});
    const form = h('<div class="grid gap-3"></div>');
    form.appendChild(textarea('Tóm tắt', d.summary, v=>{d.summary=v; debounceSave('resume');}));
    form.appendChild(listEditor({title:'Bằng cấp & Chuyên môn', items: d.degrees || [], onChange:(arr)=>{d.degrees=arr;}}));
    form.appendChild(listEditor({title:'Dự án cấp quốc gia', items: d.nationalProjects || [], onChange:(arr)=>{d.nationalProjects=arr;}}));
    form.appendChild(listEditor({title:'Dự án & Đóng góp', items: d.contributions || [], onChange:(arr)=>{d.contributions=arr;}}));

    // Experiences
    const expRoot = h('<div class="grid gap-2"></div>');
    const expHeader = h('<h3 class="font-semibold">Kinh nghiệm chuyên môn</h3>');
    expRoot.appendChild(expHeader);
    const addBtn = h('<button class="btn btn-sm" type="button">Thêm kinh nghiệm</button>');
    expRoot.appendChild(addBtn);
    const list = h('<div class="grid gap-2"></div>');
    expRoot.appendChild(list);
    function renderExp(){
      list.innerHTML='';
      (d.experiences||[]).forEach((it, idx)=>{
        const row = h(`<div class="p-3 border border-base-300 rounded card-draggable grid md:grid-cols-3 gap-2">
          <input class="input input-bordered input-sm" placeholder="Chức danh"/>
          <input class="input input-bordered input-sm" placeholder="Thời gian"/>
          <input class="input input-bordered input-sm" placeholder="Địa điểm"/>
          <button class="btn btn-xs btn-error md:col-span-3">Xóa</button>
        </div>`);
        const [a,b,c] = qsa('input', row);
        a.value = it.title||''; b.value = it.date||''; c.value = it.location||'';
        a.addEventListener('input', e=>{ it.title=e.target.value; debounceSave('resume');});
        b.addEventListener('input', e=>{ it.date=e.target.value; debounceSave('resume');});
        c.addEventListener('input', e=>{ it.location=e.target.value; debounceSave('resume');});
        qs('button', row).addEventListener('click', ()=>{ d.experiences.splice(idx,1); renderExp(); debounceSave('resume');});
        row.draggable=true;
        row.addEventListener('dragstart', e=>{ e.dataTransfer.setData('text/plain', idx.toString()); });
        row.addEventListener('dragover', e=>{ e.preventDefault(); });
        row.addEventListener('drop', e=>{ e.preventDefault(); const from = +e.dataTransfer.getData('text/plain'); const to = idx; const moved = d.experiences.splice(from,1)[0]; d.experiences.splice(to,0,moved); renderExp(); debounceSave('resume'); });
        list.appendChild(row);
      });
    }
    addBtn.addEventListener('click', ()=>{ d.experiences = d.experiences||[]; d.experiences.push({title:'',date:'',location:''}); renderExp(); debounceSave('resume');});
    renderExp();
    form.appendChild(expRoot);

    form.appendChild(listEditor({title:'Giảng dạy', items: d.teaching || [], onChange:(arr)=>{d.teaching=arr;}}));
    form.appendChild(listEditor({title:'Thành tựu KH&CN và sản xuất kinh doanh', items: d.achievements || [], onChange:(arr)=>{d.achievements=arr;}}));

    const preview = h(`<div class="preview-pane"><div class="prose max-w-none"><h3>${d.summary||''}</h3><ul>${(d.degrees||[]).map(x=>`<li>${x}</li>`).join('')}</ul></div></div>`);
    container.appendChild(form); container.appendChild(preview);
  }

  function renderPortfolio(container){
    const d = state.data.portfolio = Object.assign({items:[]}, state.data.portfolio||{});
    const form = h('<div class="grid gap-3"></div>');
    const items = d.items = d.items || [];
    // card editor without image upload inline; add separate upload per item when selected? Keep simple: text-only + show URL
    const cards = cardEditor({title:'Danh sách dự án / lĩnh vực', items, onChange: arr=>{ d.items = arr; }});
    form.appendChild(cards);
    const preview = h(`<div class="preview-pane"><div class="prose max-w-none"><ul>${(items||[]).filter(x=>x.visible!==false).map(x=>`<li>${x.name||''} - ${x.description||''}</li>`).join('')}</ul></div></div>`);
    container.appendChild(form); container.appendChild(preview);
  }

  function renderServices(container){
    const d = state.data.services = Object.assign({programs:[]}, state.data.services||{});
    const form = h('<div class="grid gap-3"></div>');
    form.appendChild(cardEditor({title:'Chương trình', items: d.programs || [], onChange: arr=>{ d.programs = arr; }}));
    const preview = h(`<div class="preview-pane"><div class="prose max-w-none"><ol>${(d.programs||[]).map(x=>`<li>${x.title||''}</li>`).join('')}</ol></div></div>`);
    container.appendChild(form); container.appendChild(preview);
  }

  async function loadMessages(){
    try{ const res = await api('messages.php'); return res.items||[]; }catch(e){ return []; }
  }

  function renderContact(container){
    const d = state.data.contact = Object.assign({email:'', googleSheetWebhook:''}, state.data.contact||{});
    const form = h('<div class="grid gap-3"></div>');
    form.appendChild(input('Email nhận', d.email, v=>{d.email=v; debounceSave('contact');}, 'email'));
    form.appendChild(input('Google Sheet webhook URL', d.googleSheetWebhook, v=>{d.googleSheetWebhook=v; debounceSave('contact');}, 'url'));

    const messagesWrap = h('<div class="mt-4"><h3 class="font-semibold mb-2">Tin nhắn đã gửi</h3><div class="overflow-x-auto"><table class="table table-zebra"><thead><tr><th>Thời gian</th><th>Tên</th><th>Email</th><th>Chủ đề</th><th></th></tr></thead><tbody></tbody></table></div></div>');
    const tbody = qsa('tbody', messagesWrap)[0];
    loadMessages().then(items=>{
      tbody.innerHTML = (items||[]).map(m=>`<tr><td>${m.createdAt||''}</td><td>${m.name||''}</td><td>${m.email||''}</td><td>${m.subject||''}</td><td><button class="btn btn-xs btn-error" data-del="${m.id}">Xóa</button></td></tr>`).join('');
      qsa('[data-del]', messagesWrap).forEach(btn=>{
        btn.addEventListener('click', async ()=>{
          try{ await api(`messages.php?id=${btn.getAttribute('data-del')}`, { method:'DELETE' }); btn.closest('tr').remove(); }catch(e){ alert('Xóa thất bại'); }
        });
      });
    });

    const preview = h(`<div class="preview-pane"><div class="prose max-w-none"><p>Liên hệ sẽ gửi về: ${d.email||''}</p></div></div>`);
    container.appendChild(form); container.appendChild(messagesWrap); container.appendChild(preview);
  }

  function renderSection(id){
    state.section = id;
    const container = qs('#sectionContainer'); container.innerHTML='';
    switch(id){
      case 'home': renderHome(container); break;
      case 'about': renderAbout(container); break;
      case 'resume': renderResume(container); break;
      case 'portfolio': renderPortfolio(container); break;
      case 'services': renderServices(container); break;
      case 'contact': renderContact(container); break;
    }
  }

  async function initApp(){
    loadTheme();
    // try get session
    try{ const me = await api('me.php'); state.user = me.user; }catch(e){}
    const app = document.getElementById('app');

    if(!state.user){
      const lv = loginView();
      app.appendChild(lv);
      qs('#loginBtn', lv).addEventListener('click', async ()=>{
        const email = qs('#email', lv).value.trim();
        const password = qs('#password', lv).value;
        try{
          const res = await api('login.php', { method:'POST', body: JSON.stringify({ email, password }) });
          state.user = res.user; location.reload();
        }catch(err){ qs('#loginErr', lv).textContent = 'Sai email hoặc mật khẩu'; }
      });
      return;
    }

    const shell = appShell(); app.appendChild(shell);
    // theme toggle
    const t = localStorage.getItem('admin-theme')||'light';
    const themeToggle = qs('#themeToggle', shell); themeToggle.checked = (t==='dark');
    themeToggle.addEventListener('change', ()=>{ persistTheme(themeToggle.checked?'dark':'light'); });
    qs('#logoutBtn', shell).addEventListener('click', async ()=>{ await api('logout.php'); location.reload(); });

    // load all sections data initially
    for(const s of sections){ await loadSection(s.id); }
    renderSection('home');

    qsa('.section-link', shell).forEach(a=>{
      a.addEventListener('click', async ()=>{ setSaveStatus('','badge-ghost'); renderSection(a.getAttribute('data-id')); });
    });
  }

  document.addEventListener('DOMContentLoaded', initApp);
})();
