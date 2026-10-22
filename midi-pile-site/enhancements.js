(() => {
  'use strict';
  const find = (s, root = document) => root.querySelector(s);
  const all = (s, root = document) => [...root.querySelectorAll(s)];
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let manuallyReduced = false;
  try { manuallyReduced = localStorage.getItem('midi-reduce-motion') === 'true'; } catch {}
  const reduced = () => media.matches || manuallyReduced;
  const motionButton = find('#motion-toggle');
  function applyMotion() {
    document.documentElement.classList.toggle('motion-reduced', reduced());
    if (motionButton) {
      motionButton.setAttribute('aria-pressed', String(reduced()));
      motionButton.textContent = media.matches ? 'Animations réduites · préférence système' : reduced() ? 'Activer les animations' : 'Réduire les animations';
      motionButton.disabled = media.matches;
    }
    all('[data-tilt],.offer').forEach(el => {el.style.removeProperty('--rx');el.style.removeProperty('--ry');});
  }
  applyMotion();
  motionButton?.addEventListener('click', () => {
    manuallyReduced = !manuallyReduced;
    try { localStorage.setItem('midi-reduce-motion', String(manuallyReduced)); } catch {}
    applyMotion();
  });
  media.addEventListener('change', applyMotion);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!reduced()) entry.target.classList.add('motion-reveal');
        observer.unobserve(entry.target);
      }
    }), {threshold: .12});
    all('.section-heading,.expertise,.offer,.founder,.local-map,.service-point,.service-price').forEach((el,i) => {
      el.style.setProperty('--stagger', `${(i % 3) * 65}ms`);
      observer.observe(el);
    });
  }
  all('[data-tilt],.offer').forEach(el => {
    let frame;
    el.addEventListener('pointermove', e => {
      if (reduced() || !finePointer.matches) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - .5) * 4}deg`);
        el.style.setProperty('--rx', `${((e.clientY - r.top) / r.height - .5) * -4}deg`);
      });
    });
    el.addEventListener('pointerleave', () => {cancelAnimationFrame(frame);el.style.removeProperty('--rx');el.style.removeProperty('--ry');});
  });
  const hero = find('[data-parallax]');
  let ticking = false;
  function scrollEffects() {
    find('.header')?.classList.toggle('scrolled', scrollY > 30);
    if (hero && !reduced() && finePointer.matches) {
      const r = hero.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) {
        hero.style.setProperty('--halo-y', `${Math.max(-20,Math.min(24,scrollY * .045))}px`);
        hero.style.setProperty('--note-y', `${Math.max(-12,Math.min(12,-scrollY * .025))}px`);
      }
    }
    ticking = false;
  }
  window.addEventListener('scroll', () => {if (!ticking) {ticking=true;requestAnimationFrame(scrollEffects);}}, {passive:true});
  scrollEffects();

  const methodCopies = [
    'À préparer : une facture récente, vos horaires de présence et les usages que vous envisagez pour demain.',
    'À examiner : le toit, les ombres, le tableau électrique et le bon équilibre entre production et consommation.',
    'À expliquer : le périmètre des travaux, les protections, les contrôles et la prise en main des équipements.',
    'À suivre : la production, les usages et les écarts saisonniers. Les modalités seront précisées dans l’offre.'
  ];
  all('.method-grid article').forEach((article, i) => {
    const b=document.createElement('button');
    b.type='button';b.innerHTML='Dans le détail <b aria-hidden="true">+</b>';
    b.setAttribute('aria-expanded','false');b.setAttribute('aria-controls',`method-detail-${i}`);
    const p=document.createElement('div');p.className='method-extra';p.id=`method-detail-${i}`;p.hidden=true;p.textContent=methodCopies[i];
    article.append(b,p);
    b.addEventListener('click',()=>{p.hidden=!p.hidden;b.setAttribute('aria-expanded',String(!p.hidden));find('b',b).textContent=p.hidden?'+':'−';article.classList.toggle('active',!p.hidden);});
  });

  const reviews=all('[data-review]');let reviewIndex=0;
  function showReview(delta){
    reviewIndex=(reviewIndex+delta+reviews.length)%reviews.length;
    reviews.forEach((el,i)=>el.hidden=i!==reviewIndex);
    find('#review-count').textContent=`0${reviewIndex+1} / 0${reviews.length}`;
  }
  find('#review-prev')?.addEventListener('click',()=>showReview(-1));
  find('#review-next')?.addEventListener('click',()=>showReview(1));
  // Pas de défilement automatique : chacun lit à son rythme.

  const contact=window.MIDI_CONFIG?.contact;
  const validUrl=value=>{try{const u=new URL(value);return u.protocol==='https:'?u.href:null;}catch{return null;}};
  if(contact){
    for(const [key,label,prefix] of [['phone','Téléphone','tel:'],['email','E-mail','mailto:']]){
      const element=find(`#public-${key}`),value=contact[key];
      if(element&&value){const a=document.createElement('a');a.href=prefix+(key==='phone'?value.replace(/[^\d+]/g,''):value);a.textContent=value;a.setAttribute('aria-label',`${label} : ${value}`);element.replaceChildren(a);}
    }
    if(contact.address&&find('#public-address'))find('#public-address').textContent=contact.address;
    all('[data-social]').forEach(el=>{const url=validUrl(contact.social?.[el.dataset.social]);if(!url)return;const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.innerHTML=el.innerHTML;a.querySelector('small')?.remove();el.replaceWith(a);});
    const reviewsUrl=validUrl(contact.googleReviewsUrl),reviewsLink=find('#google-reviews-link');if(reviewsUrl&&reviewsLink){reviewsLink.href=reviewsUrl;reviewsLink.hidden=false;}
  }
  // Une panne d’image ne doit jamais produire de portrait inventé.
  all('.portrait-frame img').forEach(img=>{
    const fallback=()=>{img.hidden=true;const monogram=img.nextElementSibling;monogram.hidden=false;monogram.setAttribute('aria-label','Portrait temporairement indisponible');};
    img.addEventListener('error',fallback);if(img.complete&&!img.naturalWidth)fallback();
  });
  all('[data-price]').forEach(el=>{
    const offer=window.MIDI_CONFIG?.offers.find(o=>o.power===Number(el.dataset.price));
    if(offer&&Number.isFinite(offer.priceTTC))el.textContent=new Intl.NumberFormat('fr-FR').format(offer.priceTTC);
  });
  // Navigation des pages activité, qui ne chargent pas le simulateur de l’accueil.
  if(document.body.classList.contains('service-page')){
    const menu=find('.menu'),nav=find('#navigation');
    menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Fermer le menu':'Ouvrir le menu');menu.textContent=open?'×':'☰';});
  }
})();
