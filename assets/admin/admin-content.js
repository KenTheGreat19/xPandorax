/* xPandorax Admin CMS (static, no backend)
   Requirements covered:
   - Auth gate via localStorage.xpandorax_auth.role === 'admin'
   - PH clock (UTC+8) refresh each second
   - Drag&Drop + paste link parsing for 25 hosts + image URLs
   - Video modal: required + optional fields, embeds per host
   - Unified entity tagging system with localStorage DBs
   - Entity management with CRUD and on-demand profile page generation (download)
   - Content list with edit/delete/preview/download JSON
   - Theme (dark/light/auto) and toasts
   - Sanitization allowing only <b>, <i>, <a>
*/
(function(){
  const STATE = {
    theme: localStorage.getItem('theme') || 'auto',
    content: [], // array of video entries
    queue: [], // pending parsed items for modal
    activeModal: null,
    entities: {
      studios: [],
      directors: [],
      models: [],
      series: [],
      labels: [],
      genres: []
    },
    currentEntityTab: 'studios'
  };

  const LS_KEYS = {
    auth: 'xpandorax_auth',
    theme: 'xp_theme',
    studios: 'xpandorax_studios',
    directors: 'xpandorax_directors',
    models: 'xpandorax_models',
    series: 'xpandorax_series',
    labels: 'xpandorax_labels',
    genres: 'xpandorax_genres',
    content: 'xpandorax_content_draft'
  };

  const HOSTS = [
    { key:'doodstream', label:'Doodstream', rx:/doodstream.com\/e\/([a-z0-9]+)/i, thumb:(id)=>`https://doodstream.com/thumbs/${id}.jpg` },
    { key:'streamtape', label:'Streamtape', rx:/streamtape.com\/e\/([a-z0-9]+)/i },
    { key:'vidguard', label:'VidGuard', rx:/vidguard.to\/embed-([a-z0-9]+)/i },
    { key:'filegram', label:'FileGram', rx:/filegram.org\/embed-([a-z0-9]+)/i },
    { key:'mixdrop', label:'MixDrop', rx:/mixdrop.co\/e\/([a-z0-9]+)/i },
    { key:'voe', label:'VOE', rx:/voe.sx\/([a-z0-9]+)/i },
    { key:'filemoon', label:'FileMoon', rx:/filemoon.sx\/e\/([a-z0-9]+)/i },
    { key:'onefichier', label:'1fichier', rx:/1fichier.com\/embed\/([a-z0-9]+)/i },
    { key:'streamwish', label:'StreamWish', rx:/streamwish.com\/embed\/([a-z0-9]+)/i },
    { key:'streamsb', label:'StreamSB', rx:/streamsbig.com\/e\/([a-z0-9]+)/i },
    { key:'streamhub', label:'StreamHub', rx:/streamhub.net\/embed\/([a-z0-9]+)/i },
    { key:'streamlare', label:'StreamLare', rx:/streamlare.com\/e\/([a-z0-9]+)/i },
    { key:'gdriveplayer', label:'GDrivePlayer', rx:/gdriveplayer.to\/embed-([a-z0-9]+)/i },
    { key:'dropload', label:'DropLoad', rx:/dropload.co\/embed\/([a-z0-9]+)/i },
    { key:'mega', label:'Mega.nz', rx:/mega.nz\/embed\/([a-z0-9#!]+)/i },
    { key:'pixeldrain', label:'Pixeldrain', rx:/pixeldrain.com\/embed\/([a-z0-9]+)/i },
    { key:'uptobox', label:'Uptobox', rx:/uptobox.com\/embed\/([a-z0-9]+)/i },
    { key:'sendcm', label:'Send.cm', rx:/send.cm\/embed\/([a-z0-9]+)/i },
    { key:'kwik', label:'Kwik.cx', rx:/kwik.cx\/embed-([a-z0-9]+)/i },
    { key:'filelions', label:'Filelions.to', rx:/filelions.to\/embed\/([a-z0-9]+)/i },
    { key:'vidoza', label:'Vidoza', rx:/vidoza.net\/embed-([a-z0-9]+)/i },
    { key:'streamhide', label:'StreamHide', rx:/streamhide.co\/embed\/([a-z0-9]+)/i },
    { key:'userload', label:'Userload.co', rx:/userload.co\/embed\/([a-z0-9]+)/i },
    { key:'streamtapex', label:'StreamtapeX', rx:/streamtapex.com\/e\/([a-z0-9]+)/i },
    { key:'streamzz', label:'StreamZZ', rx:/streamzz.to\/embed\/([a-z0-9]+)/i }
  ];
  const IMG_RX = /\.(jpg|jpeg|png|gif|webp)$/i;

  const Q = sel => document.querySelector(sel);
  const QA = sel => Array.from(document.querySelectorAll(sel));

  // Bootstrap: auth gate and injection
  document.addEventListener('DOMContentLoaded', init);

  async function init(){
    // Check if we're already in a container (called from dashboard)
    const existingCMS = document.querySelector('#adminCms');
    if (existingCMS) {
      // Already injected, just initialize
      setupCMS();
      return;
    }

    // Otherwise, try to inject (for standalone admin.html usage)
    const html = await fetch('assets/admin/admin-content.html').then(r=>r.text()).catch(()=>null);
    if(!html){ console.warn('Cannot load admin-content.html'); return; }
    // Create mount
    const mount = document.createElement('div');
    mount.innerHTML = html;
    document.body.appendChild(mount.firstElementChild);
    
    setupCMS();
  }

  function setupCMS() {
    // Load lucide icons
    loadLucide();

    // Theme
    applyTheme(STATE.theme);

    // Auth gate
    if(!isAdmin()){
      toast('Access denied. Admin only.', 'error');
      // Keep existing login page visible if present; hide CMS
      const cms = Q('#adminCms'); if(cms) cms.hidden = true;
      return;
    }

    // Show CMS and hide any login form if present
    const cms = Q('#adminCms'); if(cms) cms.hidden = false;
    const loginCard = document.querySelector('.login-card'); if(loginCard) loginCard.style.display = 'none';
    document.body.classList.remove('admin-login');

    // Wire UI
    bindTopbar();
    setupClock();
    setupNav();
    setupUploader();

    // Load entities and content (async calls)
    Promise.all([loadEntities(), loadContent()]).then(() => {
      // Render content grid and entity grid
      renderContentGrid();
      renderEntities();
      lucide && lucide.createIcons();
    });
  }

  function isAdmin(){
    try{
      const raw = localStorage.getItem(LS_KEYS.auth);
      if(!raw) return false;
      const o = JSON.parse(raw);
      return o && o.role === 'admin';
    }catch{ return false; }
  }

  function bindTopbar(){
    Q('#themeSwitch')?.addEventListener('click', ()=>{
      STATE.theme = STATE.theme==='dark' ? 'light' : (STATE.theme==='light' ? 'auto' : 'dark');
      applyTheme(STATE.theme);
      toast(`Theme: ${STATE.theme}`);
    });
    QA('[data-theme-select]')?.forEach(btn=>{
      btn.addEventListener('click', ()=>{
        STATE.theme = btn.getAttribute('data-theme-select');
        applyTheme(STATE.theme);
        toast(`Theme: ${STATE.theme}`);
      });
    });
    Q('#logoutBtn')?.addEventListener('click', ()=>{
      localStorage.removeItem(LS_KEYS.auth);
      location.reload();
    });
  }

  function applyTheme(mode){
    localStorage.setItem('theme', mode);
    const root = Q('.admin-cms');
    root?.classList.toggle('theme-light', mode==='light');
    root?.classList.toggle('theme-dark', mode==='dark');
    if(mode==='auto'){
      const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root?.classList.toggle('theme-light', !dark);
      root?.classList.toggle('theme-dark', dark);
    }
  }

  function setupClock(){
    const el = Q('#phClock');
    const fmt = new Intl.DateTimeFormat('en-PH', { timeZone: 'Asia/Manila', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'});
    const tick = ()=>{ el && (el.textContent = `${fmt.format(new Date())} PH`); };
    tick();
    setInterval(tick, 1000);
  }

  function setupNav(){
    QA('.nav-item').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        QA('.nav-item').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.getAttribute('data-tab');
        QA('.admin-cms__view').forEach(v=>v.hidden = v.getAttribute('data-view')!==tab);
      })
    })
    Q('#addEntityBtn')?.addEventListener('click', ()=> openEntityModal(STATE.currentEntityTab));
    QA('.entity-tab').forEach(t=>{
      t.addEventListener('click', ()=>{
        QA('.entity-tab').forEach(x=>x.classList.remove('active'));
        t.classList.add('active');
        STATE.currentEntityTab = t.getAttribute('data-entity');
        renderEntities();
      })
    })
  }

  function setupUploader(){
    const dz = Q('#dropZone');
    const capture = Q('#pasteCapture');
    Q('#pasteBtn')?.addEventListener('click', ()=>{ capture.focus(); document.execCommand('paste'); });

    ;['dragover','dragenter'].forEach(ev=> dz.addEventListener(ev, e=>{ e.preventDefault(); dz.classList.add('drag'); }));
    ;['dragleave','drop'].forEach(ev=> dz.addEventListener(ev, e=>{ e.preventDefault(); dz.classList.remove('drag'); }));

    dz.addEventListener('drop', async (e)=>{
      e.preventDefault();
      const text = await readDataTransferText(e.dataTransfer);
      handleBulkInput(text);
    });

    window.addEventListener('paste', (e)=>{
      const text = e.clipboardData?.getData('text');
      if(text && document.activeElement?.id !== 'videoForm'){ handleBulkInput(text); }
    });
  }

  async function readDataTransferText(dt){
    if(!dt) return '';
    const item = Array.from(dt.items).find(i=> i.kind==='string');
    return new Promise(res=> item ? item.getAsString(res) : res(''));
  }

  function handleBulkInput(text){
    if(!text) return;
    const lines = text.split(/\r?\n|\s+/).map(s=>s.trim()).filter(Boolean);
    const entries = parseLinks(lines);
    if(entries.length===0){ toast('No valid links detected', 'error'); return; }
    // queue modals
    STATE.queue.push(...entries);
    toast(`Queued ${entries.length} item(s).`,'success');
    openNextVideoModal();
  }

  function parseLinks(items){
    const res = [];
    let buf = { embeds:{}, images:[] };

    function flush(){
      if(Object.keys(buf.embeds).length>0 || buf.images.length>0){ res.push(buf); }
      buf = { embeds:{}, images:[] };
    }

    for(const raw of items){
      const s = raw.trim();
      if(!s) continue;
      let matched = false;
      for(const h of HOSTS){
        const m = s.match(h.rx);
        if(m){ matched = true; buf.embeds[h.key] = s; if(h.thumb && !buf.cover) buf.cover = h.thumb(m[1]); break; }
      }
      if(!matched && IMG_RX.test(s)){
        matched = true; buf.images.push(s); if(!buf.cover) buf.cover = s;
      }
      if(!matched){
        // Not matched; treat as separator to flush current bundle
        if(Object.keys(buf.embeds).length>0 || buf.images.length>0) flush();
      }
    }
    flush();
    return res;
  }

  function openNextVideoModal(){
    if(STATE.activeModal) return; // one at a time
    const item = STATE.queue.shift();
    if(!item) return;
    openVideoModal(item, ()=>{ // on close
      STATE.activeModal = null;
      openNextVideoModal();
    });
  }

  function openVideoModal(prefill, onClose){
    const root = Q('#modalRoot');
    const tmpl = Q('#videoModalTmpl');
    const node = tmpl.content.firstElementChild.cloneNode(true);
    const dialog = node.querySelector('.modal__dialog');
    const form = node.querySelector('#videoForm');

    // Dates
    const today = new Date();
    const yyyy = today.getFullYear(); const mm = String(today.getMonth()+1).padStart(2,'0'); const dd = String(today.getDate()).padStart(2,'0');
    form.elements['releaseDate'].value = `${yyyy}-${mm}-${dd}`;

    // Cover
    if(prefill.cover) form.elements['cover'].value = prefill.cover;

    // Render screenshot inputs
    const shotsWrap = form.querySelector('[data-field="screenshots"]');
    for(let i=0;i<9;i++){
      const v = prefill.images?.[i] || '';
      const row = document.createElement('div');
      row.innerHTML = `<input name="screenshot_${i}" value="${escapeAttr(v)}" placeholder="Screenshot URL #${i+1}">`;
      shotsWrap.appendChild(row.firstElementChild);
    }
    // XL images
    const xlWrap = form.querySelector('[data-field="xlImages"]');
    for(let i=0;i<2;i++){
      const v = prefill.images?.[9+i] || '';
      const row = document.createElement('div');
      row.innerHTML = `<input name="xl_${i}" value="${escapeAttr(v)}" placeholder="XL Image URL #${i+1}">`;
      xlWrap.appendChild(row.firstElementChild);
    }

    // Embeds per host
    const embedsWrap = form.querySelector('#embedsFields');
    for(const h of HOSTS){
      const val = prefill.embeds?.[h.key] || '';
      const row = document.createElement('label');
      row.innerHTML = `${h.label}<input name="embed_${h.key}" value="${escapeAttr(val)}" placeholder="${h.label} embed URL">`;
      embedsWrap.appendChild(row);
    }

    // Entity pickers
    const pickerFields = [
      {type:'studio', label:'Studio', multi:false},
      {type:'director', label:'Director', multi:false},
      {type:'actress', label:'Actress', multi:false},
      {type:'actors', label:'Actors', multi:true, models:true},
      {type:'series', label:'Series', multi:false},
      {type:'label', label:'Label', multi:false},
      {type:'genres', label:'Tags/Genres', multi:true, source:'genres'}
    ];
    const epTmpl = Q('#entityPickerTmpl');
    const epWrap = node.querySelector('.entity-fields');
    const chosen = { studio:null, director:null, actress:null, actors:[], series:null, label:null, genres:[] };

    for(const cfg of pickerFields){
      const el = epTmpl.content.firstElementChild.cloneNode(true);
      el.querySelector('.ep-label').textContent = cfg.label;
      const search = el.querySelector('.ep-search');
      const results = el.querySelector('.ep-results');
      const btnCreate = el.querySelector('.ep-create');
      const sourceKey = cfg.source || (cfg.models ? 'models' : cfg.type+'s');
      const pool = ()=> STATE.entities[sourceKey] || [];
      const selectItem = (item)=>{
        if(cfg.multi){
          if(cfg.type==='actors') chosen.actors.push(item);
          else if(cfg.type==='genres') chosen.genres.push(item);
        } else {
          chosen[cfg.type] = item;
        }
        renderSelected(); results.hidden = true; search.value = '';
      };
      const renderSelected = ()=>{
        let container = el.querySelector('.chips');
        if(!container){ container = document.createElement('div'); container.className='chips'; el.appendChild(container); }
        container.innerHTML = '';
        const items = cfg.multi ? (cfg.type==='actors'?chosen.actors:chosen.genres) : (chosen[cfg.type]?[chosen[cfg.type]]:[]);
        items.forEach((it,idx)=>{
          const chip = document.createElement('span'); chip.className='chip'; chip.style.borderColor = it.color||''; chip.innerHTML = `<span>${escapeHtml(it.name)}</span>`;
          const rm = document.createElement('button'); rm.className='remove'; rm.type='button'; rm.innerHTML='✕'; rm.addEventListener('click',()=>{ if(cfg.multi){ items.splice(idx,1) } else { chosen[cfg.type]=null } renderSelected(); });
          chip.appendChild(rm); container.appendChild(chip);
        });
      };
      const doFilter = ()=>{
        const q = search.value.trim().toLowerCase();
        const list = pool().filter(x=> x.name.toLowerCase().includes(q) || (x.alias||'').toLowerCase().includes(q)).slice(0,50);
        results.innerHTML = '';
        for(const it of list){
          const r = document.createElement('div'); r.className='ep-result'; r.textContent = it.name + (it.alias?` (${it.alias})`: '');
          r.addEventListener('click', ()=> selectItem(it)); results.appendChild(r);
        }
        results.hidden = list.length===0;
      }
      search.addEventListener('input', doFilter);
      btnCreate.addEventListener('click', ()=> openEntityModal(sourceKey, null, (created)=>{ selectItem(created); }));

      epWrap.appendChild(el);
    }

    // Rich toolbar
    const editor = form.querySelector('.rich-editor');
    node.querySelectorAll('[data-rich]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const cmd = btn.getAttribute('data-rich');
        if(cmd==='bold') document.execCommand('bold');
        else if(cmd==='italic') document.execCommand('italic');
        else if(cmd==='link'){
          const url = prompt('Enter URL'); if(url) document.execCommand('createLink', false, url);
        }
      })
    });

    // Save
    node.querySelector('#saveVideoBtn').addEventListener('click', ()=>{
      const data = collectVideoForm(form, editor, chosen);
      if(!data) return; // invalid
      STATE.content.unshift(data);
      persistDraft();
      toast('Saved entry','success');
      closeModal();
      renderContentGrid();
    })

    // Close
    node.querySelectorAll('[data-close]').forEach(b=> b.addEventListener('click', ()=>{ closeModal(); onClose&&onClose(); }));

    root.appendChild(node);
    root.classList.add('show');
    STATE.activeModal = node;
    lucide && lucide.createIcons();
  }

  function collectVideoForm(form, editor, chosen){
    const title = form.elements['title'].value.trim();
    const code = form.elements['code'].value.trim();
    const releaseDate = form.elements['releaseDate'].value;
    const cover = form.elements['cover'].value.trim();
    if(!title || !code || !releaseDate){ toast('Title, Code, Release Date are required','error'); return null; }

    const categories = Array.from(form.elements['categories'].selectedOptions).map(o=>o.value);
    const screenshots = [];
    for(let i=0;i<9;i++){ const v = form.elements[`screenshot_${i}`]?.value.trim(); if(v) screenshots.push(v); }
    const xlImages = [];
    for(let i=0;i<2;i++){ const v = form.elements[`xl_${i}`]?.value.trim(); if(v) xlImages.push(v); }

    const embeds = {};
    for(const h of HOSTS){ const v = form.elements[`embed_${h.key}`]?.value.trim(); if(v) embeds[h.key]=v; }

    // Build entity IDs and labels
    const studioId = chosen.studio?.id || null;
    const directorId = chosen.director?.id || null;
    const actressId = chosen.actress?.id || null;
    const actorsIds = chosen.actors?.map(a=>a.id) || [];
    const seriesId = chosen.series?.id || null;
    const labelId = chosen.label?.id || null;
    const genreIds = chosen.genres?.map(g=>g.id) || [];

    const entityNames = {
      studio: chosen.studio?.name || '',
      director: chosen.director?.name || '',
      actress: chosen.actress?.name || '',
      actors: chosen.actors?.map(a=>a.name) || [],
      series: chosen.series?.name || '',
      label: chosen.label?.name || '',
      tags: chosen.genres?.map(g=>g.name) || []
    };

    const safeDesc = sanitizeHtml(editor.innerHTML || '');

    const record = {
      id: crypto.randomUUID(),
      postDate: releaseDate,
      code, title,
      description: safeDesc,
      categories,
      cover,
      screenshots,
      xlImages,
      embeds,
      studioId, directorId, actressId, actorsIds, seriesId, labelId, genreIds,
      ...entityNames,
      views: 0
    };

    // thumbnail fallback
    if(!record.thumb){
      const first = Object.keys(embeds)[0];
      if(first){
        const host = HOSTS.find(h=>h.key===first);
        if(host){
          const m = embeds[first].match(host.rx);
          if(host.thumb && m) record.thumb = host.thumb(m[1]);
        }
      }
    }
    if(!record.thumb) record.thumb = cover || screenshots[0] || '';

    return record;
  }

  function closeModal(){
    const root = Q('#modalRoot');
    root.classList.remove('show');
    root.innerHTML = '';
    STATE.activeModal = null;
  }

  // Entity modal
  function openEntityModal(entityType, entityData=null, onSaved=null){
    const root = Q('#modalRoot');
    const tmpl = Q('#entityModalTmpl');
    const node = tmpl.content.firstElementChild.cloneNode(true);
    node.querySelector('#entityModalTitle').textContent = (entityData?'Edit ':'Create ') + labelForEntity(entityType);
    const form = node.querySelector('#entityForm');

    // Render fields
    const base = `
      <label>Name*<input required name="name" value="${escapeAttr(entityData?.name||'')}"></label>
      <label>Alias<input name="alias" value="${escapeAttr(entityData?.alias||'')}"></label>
      <label>Profile Image URL<input name="profileImg" value="${escapeAttr(entityData?.profileImg||'')}"></label>
    `;
    let extra = '';
    switch(entityType){
      case 'studios':
      case 'labels':
        extra = `<label>Official Website URL<input name="website" value="${escapeAttr(entityData?.website||'')}"></label>`; break;
      case 'directors':
        extra = `
          <label>Nationality<input name="nationality" value="${escapeAttr(entityData?.nationality||'')}"></label>
          <label>Notable Works<textarea name="notable" rows="3">${escapeHtml(entityData?.notable||'')}</textarea></label>`; break;
      case 'models':
        extra = `
          <label>Cup Size<input name="cup" value="${escapeAttr(entityData?.cup||'')}"></label>
          <label>Height (cm)<input name="height" type="number" value="${escapeAttr(entityData?.height||'')}"></label>
          <label>Birthday<input name="birthday" type="date" value="${escapeAttr(entityData?.birthday||'')}"></label>
          <label>Nationality<input name="nationality" value="${escapeAttr(entityData?.nationality||'')}"></label>
          <label>Twitter<input name="twitter" value="${escapeAttr(entityData?.twitter||'')}"></label>
          <label>Instagram<input name="instagram" value="${escapeAttr(entityData?.instagram||'')}"></label>
          <label>OnlyFans<input name="onlyfans" value="${escapeAttr(entityData?.onlyfans||'')}"></label>
          <div class="rich">
            <div class="rich-toolbar"><small>Bio</small></div>
            <div class="rich-editor" contenteditable="true" data-field="bio">${entityData?.bio||''}</div>
          </div>`; break;
      case 'series':
        extra = `
          <label>Studio ID<input name="studioId" value="${escapeAttr(entityData?.studioId||'')}"></label>
          <label>Total Episodes<input name="episodes" type="number" value="${escapeAttr(entityData?.episodes||'')}"></label>
          <label>Status<select name="status"><option${entityData?.status==='Ongoing'?' selected':''}>Ongoing</option><option${entityData?.status==='Completed'?' selected':''}>Completed</option></select></label>`; break;
      case 'genres':
        extra = `
          <label>Color Badge (hex)<input name="color" value="${escapeAttr(entityData?.color||'#06b6d4')}"></label>
          <label>Icon (Lucide name)<input name="icon" value="${escapeAttr(entityData?.icon||'tag')}"></label>`; break;
    }
    form.innerHTML = base + extra;

    node.querySelector('#saveEntityBtn').addEventListener('click', ()=>{
      const data = collectEntityForm(entityType, form);
      if(!data) return;
      if(entityData){ data.id = entityData.id; data.createdAt = entityData.createdAt; }
      saveEntity(entityType, data);
      renderEntities();
      toast('Entity saved','success');
      closeModal();
      if(onSaved) onSaved(data);
    })

    node.querySelectorAll('[data-close]').forEach(b=> b.addEventListener('click', closeModal));

    root.appendChild(node);
    root.classList.add('show');
    lucide && lucide.createIcons();
  }

  function labelForEntity(type){
    return ({studios:'Studio',directors:'Director',models:'Model',series:'Series',labels:'Label',genres:'Genre'})[type]||'Entity';
  }

  function collectEntityForm(type, form){
    const name = form.elements['name'].value.trim();
    if(!name){ toast('Name is required','error'); return null; }
    const obj = {
      id: crypto.randomUUID(),
      name,
      alias: form.elements['alias'].value.trim(),
      profileImg: form.elements['profileImg'].value.trim(),
      createdAt: new Date().toISOString()
    };
    if(type==='studios' || type==='labels') obj.website = form.elements['website'].value.trim();
    if(type==='directors') { obj.nationality = form.elements['nationality'].value.trim(); obj.notable = form.elements['notable'].value.trim(); }
    if(type==='models') {
      obj.cup = form.elements['cup'].value.trim(); obj.height = Number(form.elements['height'].value||0); obj.birthday = form.elements['birthday'].value; obj.nationality = form.elements['nationality'].value.trim();
      obj.twitter = form.elements['twitter'].value.trim(); obj.instagram = form.elements['instagram'].value.trim(); obj.onlyfans = form.elements['onlyfans'].value.trim();
      const bioEl = form.querySelector('[data-field="bio"]'); obj.bio = sanitizeHtml(bioEl?.innerHTML||'');
    }
    if(type==='series') { obj.studioId = form.elements['studioId'].value.trim(); obj.episodes = Number(form.elements['episodes'].value||0); obj.status = form.elements['status'].value; }
    if(type==='genres') { obj.color = form.elements['color'].value.trim(); obj.icon = form.elements['icon'].value.trim()||'tag'; }
    return obj;
  }

  function saveEntity(type, data){
    const list = STATE.entities[type] || [];
    const idx = list.findIndex(x=>x.id===data.id);
    if(idx>=0) list[idx] = data; else list.unshift(data);
    STATE.entities[type] = list;
    localStorage.setItem(LS_KEYS[type], JSON.stringify(list));
  }

  async function loadEntities(){
    for(const key of Object.keys(STATE.entities)){
      const raw = localStorage.getItem(LS_KEYS[key]);
      if(raw){ STATE.entities[key] = JSON.parse(raw); continue; }
      // try load sample files under text/data/*.json
      try{
        const data = await fetch(`data/${key}.json`).then(r=> r.ok? r.json(): []);
        STATE.entities[key] = Array.isArray(data)? data: [];
      }catch{ STATE.entities[key]=[]; }
    }
  }

  async function loadContent(){
    // draft first
    const draft = localStorage.getItem(LS_KEYS.content);
    if(draft){ try{ STATE.content = JSON.parse(draft)||[]; return; }catch{} }
    try{
      const data = await fetch('data/content.json').then(r=> r.ok? r.json(): []);
      STATE.content = Array.isArray(data)? data: [];
    }catch{ STATE.content = []; }
  }

  function persistDraft(){ localStorage.setItem(LS_KEYS.content, JSON.stringify(STATE.content)); }

  function renderContentGrid(){
    const wrap = Q('#contentGrid');
    const q = (Q('#searchContent')?.value||'').trim().toLowerCase();
    const arr = STATE.content.filter(it=>{
      if(!q) return true;
      return it.code.toLowerCase().includes(q) || it.title.toLowerCase().includes(q) || (it.tags||[]).join(',').toLowerCase().includes(q);
    });
    wrap.innerHTML='';
    arr.forEach(item=>{
      const card = document.createElement('div'); card.className='card';
      card.innerHTML = `
        <img class="thumb" src="${escapeAttr(item.thumb||item.cover||'')}" alt="${escapeAttr(item.title)}">
        <div class="card-body">
          <div class="meta"><span>${escapeHtml(item.code)}</span><span>${escapeHtml(item.postDate||'')}</span></div>
          <div class="title" title="${escapeAttr(item.title)}">${escapeHtml(item.title)}</div>
          <div class="meta"><span>Views: ${item.views||0}</span><span>${escapeHtml(item.actress||item.studio||'')}</span></div>
          <div class="actions">
            <button class="btn btn-icon" title="Edit"><i data-lucide="pencil"></i></button>
            <button class="btn btn-icon" title="Delete"><i data-lucide="trash-2"></i></button>
            <button class="btn btn-icon" title="Preview"><i data-lucide="external-link"></i></button>
            <button class="btn btn-icon" title="Download JSON"><i data-lucide="file-down"></i></button>
          </div>
        </div>`;
      const [btnEdit, btnDel, btnPrev, btnDown] = card.querySelectorAll('.actions .btn');
      btnEdit.addEventListener('click', ()=> editEntry(item));
      btnDel.addEventListener('click', ()=> delEntry(item));
      btnPrev.addEventListener('click', ()=> previewEntry(item));
      btnDown.addEventListener('click', ()=> downloadBlob(`${item.code}.json`, JSON.stringify(item, null, 2)));
      wrap.appendChild(card);
    });
    lucide && lucide.createIcons();

    // Toolbar events
    Q('#newEntryBtn')?.onclick = ()=> openVideoModal({embeds:{},images:[]});
    Q('#downloadJsonBtn')?.onclick = ()=> downloadBlob('content.json', JSON.stringify(STATE.content, null, 2));
    Q('#searchContent')?.addEventListener('input', ()=> renderContentGrid());
  }

  function editEntry(item){
    // Pre-fill modal
    const pre = { embeds: item.embeds||{}, images: [...(item.screenshots||[]),...(item.xlImages||[])], cover: item.cover||item.thumb };
    openVideoModal(pre, null);
    // After it opens, override save button to update
    setTimeout(()=>{
      const root = STATE.activeModal; if(!root) return;
      const form = root.querySelector('#videoForm');
      form.elements['title'].value = item.title; form.elements['code'].value = item.code; form.elements['releaseDate'].value = item.postDate || '';
      form.elements['cover'].value = item.cover || '';
      const ed = root.querySelector('.rich-editor'); ed.innerHTML = item.description || '';
      const saveBtn = root.querySelector('#saveVideoBtn');
      saveBtn.onclick = ()=>{
        const chosen = {}; // not tracking old chosen; keep existing IDs/names
        const rec = collectVideoForm(form, ed, chosen);
        if(!rec) return;
        // Merge IDs and names from old item if not reselected
        rec.studioId = item.studioId; rec.directorId=item.directorId; rec.actressId=item.actressId; rec.actorsIds=item.actorsIds; rec.seriesId=item.seriesId; rec.labelId=item.labelId; rec.genreIds=item.genreIds;
        rec.studio=item.studio; rec.director=item.director; rec.actress=item.actress; rec.actors=item.actors; rec.series=item.series; rec.label=item.label; rec.tags=item.tags;
        const idx = STATE.content.findIndex(x=>x.id===item.id);
        if(idx>=0) STATE.content[idx] = { ...item, ...rec, id: item.id };
        persistDraft(); renderContentGrid(); toast('Updated','success'); closeModal();
      };
    }, 50);
  }

  function delEntry(item){
    if(!confirm(`Delete ${item.code}?`)) return;
    STATE.content = STATE.content.filter(x=>x.id!==item.id);
    persistDraft(); renderContentGrid(); toast('Deleted','success');
  }

  function previewEntry(item){
    const embedUrl = Object.values(item.embeds||{})[0] || '';
    const win = window.open('', '_blank');
    const safeDesc = item.description || '';
    win.document.write(`<!DOCTYPE html><html><head><meta charset='utf-8'><title>${escapeHtml(item.code)} - Preview</title><meta name='viewport' content='width=device-width, initial-scale=1'>
      <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto; background:#0b0b17; color:#e6e6f0; padding:16px} .wrap{max-width:900px;margin:0 auto} .meta{color:#9aa3b2} iframe{width:100%; aspect-ratio:16/9; background:#000; border:0} img{max-width:100%;border-radius:8px}</style>
    </head><body><div class='wrap'>
      <h1>${escapeHtml(item.title)}</h1>
      <p class='meta'>${escapeHtml(item.code)} • ${escapeHtml(item.postDate||'')}</p>
      ${embedUrl?`<iframe src='${escapeAttr(embedUrl)}' allowfullscreen></iframe>`:''}
      <h3>Description</h3>
      <div>${safeDesc}</div>
      <h3>Images</h3>
      ${(item.screenshots||[]).map(u=>`<img src='${escapeAttr(u)}'>`).join('')}
    </div></body></html>`);
    win.document.close();
  }

  function renderEntities(){
    const wrap = Q('#entityGrid');
    const type = STATE.currentEntityTab;
    const list = STATE.entities[type] || [];
    wrap.innerHTML = '';
    list.forEach(it=>{
      const card = document.createElement('div'); card.className='entity-card';
      card.innerHTML = `
        <img src='${escapeAttr(it.profileImg||'')}' alt='${escapeAttr(it.name)}'>
        <div>
          <div><strong>${escapeHtml(it.name)}</strong></div>
          <div class='meta'>${escapeHtml(it.alias||'')}</div>
        </div>
        <div class='entity-actions'>
          <button class='btn btn-icon' title='Edit'><i data-lucide="pencil"></i></button>
          <button class='btn btn-icon' title='Delete'><i data-lucide="trash-2"></i></button>
          <button class='btn btn-icon' title='View Profile'><i data-lucide="external-link"></i></button>
        </div>`;
      const [bEdit,bDel,bView] = card.querySelectorAll('.entity-actions .btn');
      bEdit.addEventListener('click', ()=> openEntityModal(type, it));
      bDel.addEventListener('click', ()=>{ if(confirm('Delete entity?')){ STATE.entities[type] = list.filter(x=>x.id!==it.id); localStorage.setItem(LS_KEYS[type], JSON.stringify(STATE.entities[type])); renderEntities(); }});
      bView.addEventListener('click', ()=> downloadBlob(slugEntity(it, type)+'.html', renderProfileHtml(it, type)) );
      wrap.appendChild(card);
    });
    lucide && lucide.createIcons();
  }

  function slugEntity(it, type){
    const base = it.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    return `${type.slice(0,-1)}-${base}`;
  }

  function renderProfileHtml(entity, type){
    const related = STATE.content.filter(v=>{
      if(type==='studios') return v.studioId===entity.id;
      if(type==='directors') return v.directorId===entity.id;
      if(type==='models') return v.actressId===entity.id || (v.actorsIds||[]).includes(entity.id);
      if(type==='series') return v.seriesId===entity.id;
      if(type==='labels') return v.labelId===entity.id;
      if(type==='genres') return (v.genreIds||[]).includes(entity.id);
      return false;
    });
    const header = `<h1>${escapeHtml(entity.name)}</h1>`;
    const meta = `<p>${escapeHtml(entity.alias||'')}</p>`;
    const grid = related.map(v=>`<div><img src='${escapeAttr(v.thumb||v.cover||'')}' style='width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:8px'><div>${escapeHtml(v.code)} — ${escapeHtml(v.title)}</div></div>`).join('');
    return `<!DOCTYPE html><html><head><meta charset='utf-8'><title>${escapeHtml(entity.name)}</title><meta name='viewport' content='width=device-width, initial-scale=1'><style>body{font-family:system-ui,Segoe UI,Roboto;background:#0b0b17;color:#e6e6f0;padding:16px}.wrap{max-width:1000px;margin:0 auto}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}img{background:#000}</style></head><body><div class='wrap'>${header}${meta}<div class='grid'>${grid}</div></div></body></html>`;
  }

  // Utilities
  function sanitizeHtml(html){
    // Allow only <b> <i> <a href="..." target="_blank" rel="noopener noreferrer">
    const tmp = document.createElement('div'); tmp.innerHTML = html || '';
    const walker = document.createTreeWalker(tmp, NodeFilter.SHOW_ELEMENT, null);
    const nodes = [];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    for(const el of nodes){
      const name = el.nodeName.toLowerCase();
      if(name==='b' || name==='i'){
        // keep, strip attributes
        while(el.attributes.length) el.removeAttribute(el.attributes[0].name);
      } else if(name==='a'){
        const href = el.getAttribute('href')||''; const ok = /^(https?:)?\/\//i.test(href);
        while(el.attributes.length) el.removeAttribute(el.attributes[0].name);
        if(ok){ el.setAttribute('href', href); el.setAttribute('target','_blank'); el.setAttribute('rel','noopener noreferrer'); }
        else { el.replaceWith(...el.childNodes); }
      } else {
        el.replaceWith(...el.childNodes);
      }
    }
    return tmp.innerHTML;
  }

  function escapeHtml(s){ return (s||'').replace(/[&<>\"]/g, c=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
  function escapeAttr(s){ return escapeHtml(s).replace(/'/g,'&#39;'); }

  function toast(msg, type=''){ const root = Q('#toastRoot'); if(!root) return; const t = document.createElement('div'); t.className = `toast ${type}`; t.innerHTML = `<i data-lucide='${type==='error'?'alert-triangle':'check-circle'}'></i><span>${escapeHtml(msg)}</span>`; root.appendChild(t); setTimeout(()=>{ t.remove(); }, 3500); lucide && lucide.createIcons(); }

  function downloadBlob(filename, text){ const blob = new Blob([text], {type:'application/json'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); }

  function loadLucide(){
    if(window.lucide){ lucide.createIcons(); return; }
    const s = document.createElement('script'); s.src = 'https://unpkg.com/lucide@latest'; s.onload = ()=> lucide && lucide.createIcons(); document.head.appendChild(s);
  }
})();
