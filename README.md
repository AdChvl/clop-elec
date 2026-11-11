# Sites vitrines

Maquettes de sites vitrines une page pour commerces et artisans locaux (Somme, Hauts-de-France),
en **HTML, CSS et JavaScript vanilla** : aucun framework, aucune dépendance, aucun build.

> ℹ️ Ce sont des **maquettes de démonstration** réalisées dans le cadre de propositions commerciales.
> Ce ne sont pas les sites officiels des établissements. Les photos sont des illustrations provisoires.

## Les sites

| Site | Dossier |
|---|---|
| AS Couvreur Zingueur | [`AS Couvreur Zingueur/`](AS%20Couvreur%20Zingueur/) |
| CLOP'ELEC | [`Clop Elec/`](Clop%20Elec/) |
| Djo Coiffure | [`Djo Coiffure/`](Djo%20Coiffure/) |
| Elisa le Resto | [`Elisa Le Resto/`](Elisa%20Le%20Resto/) |
| Établissements Storme | [`Etablissements Storme/`](Etablissements%20Storme/) |
| Garage Mille | [`Garage Mille/`](Garage%20Mille/) |
| Garage Proesler-Bourgois | [`Garage Proesler Bourgois/`](Garage%20Proesler%20Bourgois/) |
| Gracieux Cottage | [`Gracieux Cottage/`](Gracieux%20Cottage/) |
| MP Terrassement | [`MP Terrassement Pocholle/`](MP%20Terrassement%20Pocholle/) |
| Maud Coiffure | [`Maud Coiffure/`](Maud%20Coiffure/) |
| O' Naturel | [`O Naturel/`](O%20Naturel/) |
| Sam's Barbershop | [`Sams Barbershop/`](Sams%20Barbershop/) |
| Vénus Coiffure | [`Venus Coiffure/`](Venus%20Coiffure/) |

## Points communs

- Mobile-first, responsive de 360 px à 1440 px, menu burger, barre d'actions fixe sur mobile
- SEO : meta, Open Graph, données structurées JSON-LD (schema.org), un seul `h1`
- Accessibilité : contrastes AA, textes alternatifs, cibles tactiles ≥ 44 px, navigation clavier
- Couleurs, polices et espacements réglables dans `:root` en tête de chaque `style.css`
- Formulaire de contact via Web3Forms, horaires « ouvert / fermé » calculés à l'heure de Paris

## Aperçu

Ouvrir le `index.html` d'un dossier dans un navigateur, ou servir le dépôt :

```bash
npx serve .
```

Chaque dossier se déploie tel quel sur Cloudflare Pages (répertoire de sortie = le dossier du site).
