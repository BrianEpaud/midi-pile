(() => {
  'use strict';
  let bookingUrl = null;
  try {
    const raw = window.MIDI_CONFIG?.bookingUrl;
    if (raw) {
      const parsed = new URL(raw);
      if (parsed.protocol === 'https:' && !parsed.username && !parsed.password) bookingUrl = parsed.href;
    }
  } catch {}
  const dialog = document.createElement('dialog');
  dialog.id = 'booking-dialog';
  dialog.setAttribute('aria-labelledby', 'booking-title');
  dialog.innerHTML = `<button type="button" class="dialog-close" aria-label="Fermer la prise de rendez-vous">×</button>
    <div class="booking-intro"><span class="booking-symbol" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="7" y="11" width="34" height="31" rx="5"/><path d="M15 6v10M33 6v10M7 21h34M17 31l5 5 10-11"/></svg></span><p class="eyebrow">Votre projet commence par un échange</p><h2 id="booking-title">Trouvons le bon<br>moment pour parler.</h2><p>Une question sur le solaire, une batterie ou une borne ? Prenons le temps de comprendre votre besoin.</p><div class="booking-people"><img src="/assets/brian.jpeg" alt="" width="44" height="44"><img src="/assets/alexandre.jpeg" alt="" width="44" height="44"><span>Brian & Alexandre<br><small>Vos interlocuteurs aux Sables-d’Olonne</small></span></div></div>
    <div class="booking-placeholder"><span class="booking-status">MAQUETTE · AGENDA NON CONNECTÉ</span><h3>Les créneaux arrivent bientôt.</h3><p>L’agenda de réservation n’est pas encore activé. Aucun créneau ne peut être réservé pour le moment.</p><div class="booking-steps"><span><b>01</b> Choisir un créneau</span><span><b>02</b> Présenter votre projet</span><span><b>03</b> Recevoir la confirmation</span></div><p class="caption">Aperçu du futur parcours. Aucun rendez-vous ni aucune donnée ne sont enregistrés ici.</p><button type="button" class="button booking-return">Continuer ma visite <span>↗</span></button></div>`;
  document.body.append(dialog);
  let opener;
  const close = () => dialog.close();
  dialog.querySelector('.dialog-close').addEventListener('click', close);
  dialog.querySelector('.booking-return').addEventListener('click', close);
  dialog.addEventListener('close', () => opener?.focus({preventScroll:true}));
  dialog.addEventListener('click', e => {if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}});
  function configureLinks() {
    document.querySelectorAll('[data-booking]').forEach(link => {
      link.href = bookingUrl || '/#rendez-vous';
      if (bookingUrl) {
        link.target = '_blank'; link.rel = 'noopener noreferrer';
        link.setAttribute('aria-label','Prendre rendez-vous — ouvrir l’agenda dans un nouvel onglet');
      } else { link.setAttribute('aria-haspopup','dialog'); link.setAttribute('aria-controls','booking-dialog'); }
    });
  }
  configureLinks();
  // Le résultat du simulateur est créé après le chargement de la page.
  const results = document.querySelector('#sim-result');
  if (results) new MutationObserver(configureLinks).observe(results,{childList:true,subtree:true});
  document.addEventListener('click', e => {
    const link = e.target.closest('[data-booking]');
    if(!link || bookingUrl) return;
    e.preventDefault(); opener=link; dialog.showModal();
  });
  if(location.hash==='#rendez-vous') {
    if(bookingUrl) location.replace(bookingUrl);
    else dialog.showModal();
  }
})();
