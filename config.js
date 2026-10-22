/* Données administrables : futures options WordPress / champs personnalisés. */
window.MIDI_CONFIG = {
  guideUrl: null,
  // URL HTTPS publique du rendez-vous Calendly (ou autre agenda). Null = maquette.
  bookingUrl: null,
  contact: {
    city: 'Les Sables-d’Olonne', region: 'Vendée',
    phone: null, email: null, address: null, googleReviewsUrl: null,
    social: {instagram: null, linkedin: null, facebook: null}
  },
  offers: [
    {power:3,name:'Midi Pile 3',priceTTC:6990,conditions:'Tarif de travail TTC · conditions à confirmer',description:'Un premier pas pour couvrir une partie des usages de votre maison.'},
    {power:6,name:'Midi Pile 6',priceTTC:8990,conditions:'Tarif de travail TTC · conditions à confirmer',description:'Plus de production, lorsque votre consommation peut en profiter.'},
    {power:9,name:'Midi Pile 9',priceTTC:10990,conditions:'Tarif de travail TTC · conditions à confirmer',description:'Pour des besoins électriques importants et une toiture adaptée.'}
  ],
  simulation: {yieldPerKwc:1150,defaultPrice:0.20,roofAreaPerKwc:6,
    // Hypothèses exploratoires TTC modifiables, sans devis fournisseur ni aide déduite.
    projection: {batteryCapacity:5,batteryCost:5000,batteryReplacement:3500,batteryLife:12,
      batteryEfficiency:.90,batteryCycles:220,batteryDegradation:.02,pvDegradation:.005,
      maintenance:80,batteryMaintenance:25,inverterYear:12,inverterCost:1200,
      priceGrowth:0,exportPrice:0}
  }
};
