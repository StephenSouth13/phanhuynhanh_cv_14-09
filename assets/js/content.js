(function(){
  async function loadJSON(path){
    try{ const res = await fetch(path, { cache:'no-store' }); if(!res.ok) return null; return await res.json(); }catch(e){ return null; }
  }

  async function applyHome(){
    const d = await loadJSON('data/home.json'); if(!d) return;
    const hero = document.querySelector('#hero'); if(!hero) return;
    const h2 = hero.querySelector('h2'); if(h2 && d.heading) h2.textContent = d.heading;
    const img = hero.querySelector('img'); if(img && d.bannerImage) img.src = d.bannerImage;
    const typed = hero.querySelector('.typed'); if(typed && d.subtitle){ typed.setAttribute('data-typed-items', d.subtitle); }
  }

  async function applyAbout(){
    const d = await loadJSON('data/about.json'); if(!d) return;
    const about = document.querySelector('#about'); if(!about) return;
    const portrait = about.querySelector('img.img-fluid'); if(portrait && d.portraitImage) portrait.src = d.portraitImage;
    const content = about.querySelector('.content'); if(content){
      const title = content.querySelector('h2'); if(title && d.headline) title.textContent = d.headline;
      const firstP = content.querySelector('.fst-italic'); if(firstP && d.bioHtml){ firstP.innerHTML = d.bioHtml; }
      const cols = about.querySelectorAll('.row ul');
      if(cols[0] && Array.isArray(d.bulletsLeft)){ cols[0].innerHTML = d.bulletsLeft.map(t=>`<li><i class="bi bi-chevron-right"></i> <span>${t}</span></li>`).join(''); }
      if(cols[1] && Array.isArray(d.bulletsRight)){ cols[1].innerHTML = d.bulletsRight.map(t=>`<li><i class="bi bi-chevron-right"></i> <span>${t}</span></li>`).join(''); }
    }
    const quote = about.querySelector('blockquote'); if(quote && d.quote){ quote.textContent = `“${d.quote}”`; }
    const socials = document.querySelector('.social-links'); if(socials && d.socials){
      const anchors = socials.querySelectorAll('a');
      if(anchors[0] && d.socials.x) anchors[0].href = d.socials.x;
      if(anchors[1] && d.socials.facebook) anchors[1].href = d.socials.facebook;
      if(anchors[2] && d.socials.linkedin) anchors[2].href = d.socials.linkedin;
    }
  }

  function resumeCol(html){ return `<div class="resume-item">${html}</div>`; }

  async function applyResume(){
    const d = await loadJSON('data/resume.json'); if(!d) return;
    const wrap = document.querySelector('#resume .container .row'); if(!wrap) return;
    const left = document.createElement('div'); left.className='col-lg-6'; left.setAttribute('data-aos','fade-up'); left.setAttribute('data-aos-delay','100');
    left.innerHTML = `
      <h3 class="resume-title"><i class="fas fa-user-circle"></i> Bằng cấp & Chuyên môn</h3>
      ${(d.degrees||[]).map(t=>resumeCol(`<h4>${t}</h4>`)).join('')}
      <h3 class="resume-title mt-4"><i class="fas fa-tasks"></i> Dự án cấp quốc gia</h3>
      ${resumeCol(`<ul>${(d.nationalProjects||[]).map(t=>`<li>${t}</li>`).join('')}</ul>`)}
      <h3 class="resume-title mt-4"><i class="fas fa-project-diagram"></i> Dự án & Đóng góp</h3>
      ${resumeCol(`<ul>${(d.contributions||[]).map(t=>`<li>${t}</li>`).join('')}</ul>`)}
    `;
    const right = document.createElement('div'); right.className='col-lg-6'; right.setAttribute('data-aos','fade-up'); right.setAttribute('data-aos-delay','200');
    right.innerHTML = `
      <h3 class="resume-title"><i class="fas fa-briefcase"></i> Kinh nghiệm chuyên môn</h3>
      ${(d.experiences||[]).map(x=>resumeCol(`<h4>${x.title||''}</h4><h5>${x.date||''}</h5><p><em>${x.location||''}</em></p>`)).join('')}
      <h3 class="resume-title mt-4"><i class="fas fa-chalkboard-teacher"></i> Giảng dạy</h3>
      ${resumeCol(`<ul>${(d.teaching||[]).map(t=>`<li>${t}</li>`).join('')}</ul>`)}
    `;
    wrap.innerHTML=''; wrap.appendChild(left); wrap.appendChild(right);
  }

  async function applyPortfolio(){
    const d = await loadJSON('data/portfolio.json'); if(!d) return;
    const container = document.querySelector('#portfolio .portfolio-container'); if(!container) return;
    const items = (d.items||[]).filter(x=>x.visible!==false);
    container.innerHTML = items.map(it=>`
      <div class="col-lg-4 col-md-6 portfolio-item">
        <div class="portfolio-content h-100">
          <img src="${it.image||'assets/img/portfolio/placeholder.png'}" class="img-fluid" alt="${it.name||''}">
          <div class="portfolio-info">
            <h4>${it.name||''}</h4>
            <p>${it.description||''}</p>
            <a href="${it.image||'#'}" class="glightbox preview-link" data-gallery="portfolio-gallery" title="${it.description||''}"><i class="bi bi-zoom-in"></i></a>
            ${it.url? `<a href="${it.url}" class="details-link" title="Xem chi tiết" target="_blank"><i class="bi bi-box-arrow-up-right"></i></a>`:''}
          </div>
        </div>
      </div>`).join('');
  }

  async function applyServices(){
    const d = await loadJSON('data/services.json'); if(!d) return;
    const rows = document.querySelector('#services .row.gy-4'); if(!rows) return;
    const icons = ['bi-gear','bi-graph-up','bi-people','bi-lightbulb','bi-briefcase','bi-chat-dots'];
    rows.innerHTML = (d.programs||[]).map((p,i)=>`
      <div class="col-lg-4 col-md-6 service-item d-flex" data-aos="fade-up" data-aos-delay="${(i+1)*100}">
        <div class="icon flex-shrink-0"><i class="bi ${icons[i%icons.length]}"></i></div>
        <div>
          <h4 class="title">${p.title||''}</h4>
          <p class="description">${p.description||''}</p>
        </div>
      </div>`).join('');
  }

  async function applyContact(){
    const d = await loadJSON('data/contact.json'); if(!d) return;
    const box = document.querySelector('#contact .info-item .bi-envelope')?.parentElement;
    if(box){ const p = box.querySelector('p'); if(p && d.email) p.textContent = d.email; }
  }

  window.addEventListener('load', ()=>{ applyHome(); applyAbout(); applyResume(); applyPortfolio(); applyServices(); applyContact(); });
})();
