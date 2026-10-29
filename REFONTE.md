# Refonte Midi Pile - octobre 2026

## Tarifs de travail TTC
- 2 kWc : 4 950 €.
- 3 kWc : 6 990 € ; avec 8 kWh après remise de 500 € : 9 680 €.
- 6 kWc : 8 990 € ; avec 8 kWh après remise : 11 680 € (sélection initiale).
- 9 kWc : 10 990 € ; avec 14 kWh après remise : 14 680 € (sélection initiale).
- Borne 7 kW : dès 990 €, ou 890 € avec le solaire.
- Batterie 8 kWh seule : 3 190 €, sous réserve de compatibilité.

## Simulation
Hypothèses centrales : 0,21 €/kWh ; +5 % par an ; 20 ans sans remplacement de
batterie ; capacité initiale 8 kWh ou 14 kWh pour le 9 kWc. Prix de la batterie
simultanée : 2 690 € ou 3 690 €. Rendement aller-retour 90 %, dégradation batterie
2 %/an, solaire 0,5 %/an. Entretien et provision de conversion inclus. Les prix
constants peuvent être comparés dans les hypothèses. Aucun gain positif imposé.
Modèle mensuel pédagogique, sans valeur de dimensionnement horaire ni garantie.

## À connecter avant lancement
Dans config.js : bookingPhoneUrl et bookingHomeUrl pour les deux événements
Calendly. Prévoir téléphone obligatoire pour le premier, adresse complète pour
le second. Le lien général existant reste disponible, sans prétendre réserver
un événement dédié.

Dans contact.social : URL officielles Instagram, LinkedIn et Facebook.

Guide : fournir le PDF et activer guideEndpoint, endpoint POST JSON de même
origine acceptant {email,phone} et renvoyant {sent:true} uniquement après envoi
confirmé. Prévoir validation serveur, limitation de débit, anti-abus, notice de
confidentialité et expéditeur vérifié. Aucune donnée n'est actuellement envoyée.

Ajouter les vrais avis et réalisations après lancement. Les exemples du carrousel
ne sont pas revendiqués comme des chantiers Midi Pile. QualiPV et QualiPV module
Batterie restent des qualifications visées. Afficher les logos seulement après
obtention et autorisation. Décennale à souscrire ; références, rendement 25 % et
conditions de garantie à confirmer avant commercialisation.

## Sources des visuels
- Kit Midi Pile existant ; mot-symbole cadré séparément de la signature.
- Hoymiles HiOne : https://www.hoymiles.com/fr/hione.html ; image produit
  https://www.hoymiles.com/statics/1/hoymiles/images/ln_a1_img28.png
- Recharge : https://www.solarwatt.de/ratgeber/wallbox-foerderung ; photographie
  https://assets.solarwatt.de/Resources/Persistent/b61bba6ef584e920e6d7ad42179b48686bbeb84d/wallbox-1800x942-1200x628.jpg
- Visuels fabricant de référence : droits d'utilisation commerciale finale à
  valider. Aucun chantier ni partenariat Midi Pile revendiqué.
- Carte : https://github.com/gregoiredavid/france-geojson ; données IGN sous
  Licence Ouverte. Point au centre des Sables-d'Olonne (46,4967 ; -1,7833),
  pas à une adresse d'accueil.

## Publication
Sources de référence à la racine, copie midi-pile-site/ synchronisée.
La refonte a été autorisée pour publication sur le dépôt public par Brian.
