// admin.js - handles admin login, TOTP, content form and localStorage
(function(){
  const ADMIN_USER = 'admin';
  const ADMIN_PASS = 'xPandorax2025!';

  function qs(sel,ctx=document){return ctx.querySelector(sel)}

  document.addEventListener('DOMContentLoaded', async ()=>{
    const seedEl = qs('#totpSeed');
    if(seedEl && window.xpandoraxAuth) seedEl.textContent = window.xpandoraxAuth.seed || 'n/a';

    qs('#loginBtn')?.addEventListener('click', onLogin);
    qs('#contentForm')?.addEventListener('submit', onSaveContent);
    qs('#exportBtn')?.addEventListener('click', exportContentJson);

    renderStats();
    renderContentTable();
  });

  async function onLogin(){
    const user = qs('#adminUser').value;
    const pass = qs('#adminPass').value;
    const code = qs('#admin2fa').value;
    
    if(user !== ADMIN_USER || pass !== ADMIN_PASS){ 
      alert('Invalid username or password'); 
      return; 
    }
    
    if(window.xpandoraxAuth?.totpCode){
      const real = await window.xpandoraxAuth.totpCode(window.xpandoraxAuth.seed);
      if(code !== real){ 
        alert('Invalid 2FA code'); 
        return; 
      }
    }
    
    localStorage.setItem('adminAuthenticated', 'true');
    qs('#loginPanel').hidden = true;
    qs('#dashboard').hidden = false;
  }

  function renderStats(){
    const st = qs('#stats'); if(!st) return;
    st.innerHTML = '<div class="card">Visits<br><strong>12345</strong></div><div class="card">Views<br><strong>54321</strong></div>';
  }

  function getContent(){
    try{ 
      const v = localStorage.getItem('xpandorax_content'); 
      return v ? JSON.parse(v) : []; 
    } catch(e){ 
      return []; 
    }
  }

  function setContent(arr){ 
    localStorage.setItem('xpandorax_content', JSON.stringify(arr)); 
    window.dispatchEvent(new Event('storage')); 
  }

  function onSaveContent(e){
    e.preventDefault();
    const data = getContent();
    const item = {
      postDate: qs('#postDate').value || new Date().toISOString().slice(0,10),
      code: qs('#code').value,
      title: qs('#title').value,
      actress: qs('#actress').value,
      actor: qs('#actor').value,
      tags: qs('#tags').value.split(',').map(s=>s.trim()).filter(Boolean),
      maker: qs('#maker').value,
      embed: qs('#embed').value,
      thumb: qs('#thumb').value
    };
    data.unshift(item);
    
    // Auto-create models
    const models = JSON.parse(localStorage.getItem('xpandorax_models') || '[]');
    if(item.actress && !models.find(m=>m.name === item.actress)){ 
      models.push({name: item.actress, avatar: `https://i.pravatar.cc/150?u=${item.code}`}); 
      localStorage.setItem('xpandorax_models', JSON.stringify(models)); 
    }
    
    // Auto-create producers
    const producers = JSON.parse(localStorage.getItem('xpandorax_producers') || '[]');
    if(item.maker && !producers.find(p=>p.name === item.maker)){ 
      producers.push({name: item.maker, logo: ''}); 
      localStorage.setItem('xpandorax_producers', JSON.stringify(producers)); 
    }

    setContent(data);
    renderContentTable();
    alert('Saved to localStorage.xpandorax_content');
    qs('#contentForm').reset();
  }

  function renderContentTable(){
    const data = getContent();
    const el = qs('#contentTable'); 
    if(!el) return;
    
    const out = data.map((it, idx)=>
      `<div class="row">
        <strong>${it.code}</strong> ${it.title} 
        <button data-idx="${idx}" class="del">Delete</button>
      </div>`
    ).join('');
    
    el.innerHTML = out || '<em>No content</em>';
    el.querySelectorAll('.del').forEach(btn=>
      btn.addEventListener('click', (ev)=>{ 
        const i = Number(ev.target.dataset.idx); 
        const arr = getContent(); 
        arr.splice(i, 1); 
        setContent(arr); 
        renderContentTable(); 
      })
    );
  }

  function exportContentJson(){
    const data = getContent();
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'content.json'; a.click(); URL.revokeObjectURL(url);
  }

})();
