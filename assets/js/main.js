// main.js - site scripts: age gate, theme toggle, content rendering, search
(function(){
  const STORAGE_KEYS = {content:'xpandorax_content',models:'xpandorax_models',producers:'xpandorax_producers',age:'ageVerified',theme:'theme'};

  function qs(s,ctx=document){return ctx.querySelector(s)}
  function qsa(s,ctx=document){return Array.from((ctx||document).querySelectorAll(s))}

  document.addEventListener('DOMContentLoaded', ()=>{
    enforceAgeGate();
    setupThemeToggle();
    setupLanguageModal();
    loadContent();
    setupSearch();
    setupMobileMenu();
    setupFooterPanels();
    qsa('.load-more').forEach(b=>b.addEventListener('click', onLoadMore));
    qs('#exitSite').addEventListener('click', ()=>location.href='https://www.who.int/');
    qs('#enterSite').addEventListener('click', ()=>{ localStorage.setItem('ageVerified','true'); hideAgeGate(); });
    window.addEventListener('storage', ()=>{ loadContent(); });
  });

  /* Mobile menu and footer panels */
  function setupMobileMenu(){
    const hamb = qs('#hamburger'); const menu = qs('#mobileMenu'); if(!hamb || !menu) return;
    function openMenu(){ menu.classList.add('open'); menu.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; }
    function closeMenu(){ menu.classList.remove('open'); menu.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
    hamb.addEventListener('click', ()=>{ menu.classList.contains('open') ? closeMenu() : openMenu(); });
    // close on outside click
    document.addEventListener('click', (e)=>{ if(menu.classList.contains('open') && !menu.contains(e.target) && e.target !== hamb){ closeMenu(); } });
    // close on Esc
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape'){ closeMenu(); } });
  }

  function setupFooterPanels(){
    const panels = qsa('.panel'); if(!panels.length) return;
    panels.forEach(p=>{
      const head = p.querySelector('.panel-head');
      head.setAttribute('tabindex', '0');
      head.addEventListener('click', ()=> togglePanel(p));
      head.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); togglePanel(p); } });
    });
    // click outside closes all
    document.addEventListener('click', (e)=>{ if(!e.target.closest('.panel')){ panels.forEach(p=>p.classList.remove('open')); } });
  }

  function togglePanel(panel){
    const panels = qsa('.panel');
    const isOpen = panel.classList.contains('open');
    panels.forEach(p=>p.classList.remove('open'));
    if(!isOpen) panel.classList.add('open');
  }

  function enforceAgeGate(){
    // Skip age gate on admin pages
    const isAdminPage = location.pathname.includes('admin');
    if(isAdminPage) return;
    
    // Auto-verify on localhost for development
    const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if(isLocalhost && !localStorage.getItem('ageVerified')) {
      localStorage.setItem('ageVerified', 'true');
    }
    
    const age = localStorage.getItem('ageVerified');
    const overlay = qs('#ageGateOverlay');
    if(!overlay) return;
    if(age==='true'){ 
      overlay.style.display='none'; 
      document.body.style.filter='none'; 
      document.body.style.pointerEvents='auto'; 
      overlay.setAttribute('aria-hidden','true'); 
      return; 
    }
    // Block interactions until verified
    document.body.style.filter='blur(12px)'; 
    document.body.style.pointerEvents='none';
    overlay.style.display='flex'; 
    overlay.setAttribute('aria-hidden','false');
  }

  function hideAgeGate(){ const overlay=qs('#ageGateOverlay'); if(!overlay) return; overlay.style.display='none'; document.body.style.filter='none'; document.body.style.pointerEvents='auto'; overlay.setAttribute('aria-hidden','true'); }

  function setupThemeToggle(){
    const btn = qs('#themeToggle'); 
    if(!btn) return;
    const cycle = ['dark','auto','light'];
    const icons = {dark:'🌑', auto:'🌓', light:'☀️'};
    btn.addEventListener('click', ()=>{
      const cur = localStorage.getItem('theme')||'dark';
      const idx = (cycle.indexOf(cur)+1) % cycle.length; 
      const next=cycle[idx];
      localStorage.setItem('theme', next);
      document.documentElement.setAttribute('data-theme', next);
      btn.textContent = icons[next];
    });
    const current = localStorage.getItem('theme')||'dark';
    document.documentElement.setAttribute('data-theme', current);
    btn.textContent = icons[current];
  }

  function setupLanguageModal(){
    const toggle = qs('#languageToggle');
    const modal = qs('#languageModal');
    const langOptions = qsa('.lang-option');
    
    if(!toggle || !modal) return;
    
    const langMap = {
      'en': '🌐 EN', 'zh-TW': '🌐 繁中', 'zh-CN': '🌐 简中',
      'ja': '🌐 JA', 'ko': '🌐 KO', 'ms': '🌐 MY',
      'th': '🌐 TH', 'de': '🌐 DE', 'fr': '🌐 FR',
      'vi': '🌐 VI', 'id': '🌐 ID', 'fil': '🌐 FIL', 'pt': '🌐 PT'
    };
    
    // Toggle modal
    toggle.addEventListener('click', (e)=>{
      e.stopPropagation();
      modal.classList.toggle('active');
    });
    
    // Close modal when clicking outside
    document.addEventListener('click', (e)=>{
      if(!modal.contains(e.target) && e.target !== toggle){
        modal.classList.remove('active');
      }
    });
    
    // Handle language selection
    langOptions.forEach(opt=>{
      opt.addEventListener('click', ()=>{
        const lang = opt.dataset.lang;
        localStorage.setItem('language', lang);
        toggle.textContent = langMap[lang] || '🌐 EN';
        qsa('.lang-option').forEach(o=>o.classList.remove('active'));
        opt.classList.add('active');
        modal.classList.remove('active');
        
        // Trigger i18n update if available
        if(window.i18n && window.i18n.setLanguage){
          window.i18n.setLanguage(lang);
        }
      });
    });
    
    // Set initial active language
    const currentLang = localStorage.getItem('language') || 'en';
    toggle.textContent = langMap[currentLang] || '🌐 EN';
    qsa('.lang-option').forEach(opt=>{
      if(opt.dataset.lang === currentLang){
        opt.classList.add('active');
      }
    });
  }

  async function loadContent(){
    let content = JSON.parse(localStorage.getItem(STORAGE_KEYS.content) || 'null');
    if(!content){
      try{ 
        const r = await fetch('/text/data/content.json'); 
        if(r.ok) content = await r.json(); 
      } catch(e){ content = []; }
    }
    renderSections(content || []);
  }

  function renderSections(content){
    const allContent = content || [];
    const images = allContent.filter(it => it.type === 'image');
    const videos = allContent.filter(it => it.type === 'video' || !it.type);
    
    renderGrid('bestViewed', allContent.slice(0, 6));
    renderGrid('bestWatched', allContent.slice(6, 12));
    renderGrid('newestImages', images.slice(0, 6));
    renderGrid('newestVideos', videos.slice(0, 6));
    renderGrid('hotModelPictures', images.sort(() => Math.random() - 0.5).slice(0, 6));
    renderGrid('hotModelVideos', videos.sort(() => Math.random() - 0.5).slice(0, 6));
  }

  function renderGrid(section, items){
    const container = qs(`[data-section-grid="${section}"]`);
    if(!container) return;
    container.innerHTML = items && items.length > 0 
      ? items.map(renderThumb).join('') 
      : Array(6).fill().map(() => `<div class="gallery-placeholder"><div class="thumb" aria-hidden="true"></div><div class="meta" aria-hidden="true"><div class="bar large"><span class="placeholder-shimmer"></span></div><div class="bar small"><span class="placeholder-shimmer"></span></div></div></div>`).join('');
  }

  function renderThumb(it){
    const unc = it.uncensored ? '<div class="uncensored">UNC</div>' : '';
    const quality = it.quality || (it.quality4k ? '4K' : 'HD');
    return `<article class="thumb" tabindex="0">
      <img loading="lazy" src="${it.thumb || ''}" alt="${it.title || ''} thumbnail">
      <div class="duration">${it.duration || ''}</div>
      <div class="quality">${quality}</div>
      ${unc}
      <div class="caption"><span class="code">${it.code || ''}</span><span class="title">${it.title || ''}</span></div>
    </article>`;
  }

  function onLoadMore(e){ appendMore(e.currentTarget.dataset.section, 12); }

  function appendMore(section, count){
    const content = JSON.parse(localStorage.getItem(STORAGE_KEYS.content) || '[]');
    const grid = qs(`[data-section-grid="${section}"]`);
    if(!grid) return;
    const start = grid.children.length;
    grid.insertAdjacentHTML('beforeend', content.slice(start, start+count).map(renderThumb).join(''));
  }

  function setupSearch(){
    const inputs = [qs('#search'), qs('#heroSearch')].filter(Boolean);
    const ac = qs('#autocomplete'); 
    if(!inputs.length || !ac) return;
    let timer = null;
    inputs.forEach(input=>{
      input.addEventListener('input', ()=>{ 
        clearTimeout(timer); 
        timer = setTimeout(()=>doSearch(input.value, ac), 200); 
      });
      input.addEventListener('keydown', (e)=>{ 
        if(e.key==='Enter'){ 
          e.preventDefault(); 
          doSearch(input.value, ac); 
        } 
      });
    });
  }

  function doSearch(q, ac){
    if(!q || q.length < 3) { 
      ac.style.display = 'none'; 
      return; 
    }
    const content = JSON.parse(localStorage.getItem(STORAGE_KEYS.content) || '[]');
    const lowerQ = q.toLowerCase();
    const res = content.filter(it=> 
      (it.code||'').toLowerCase().includes(lowerQ) || 
      (it.title||'').toLowerCase().includes(lowerQ)
    );
    ac.innerHTML = res.slice(0, 8).map(it=>
      `<div class="ac-item" role="option">
        <img src="${it.thumb}" alt="" width="56"> 
        <strong>${it.code}</strong> ${it.title}
      </div>`
    ).join(''); 
    ac.style.display = 'block';
  }

})();
