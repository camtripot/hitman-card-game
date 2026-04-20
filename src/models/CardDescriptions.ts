import { CardType } from './Card';

export const CARD_DESCRIPTIONS: Record<CardType, string> = {
  [CardType.VOYANTE]:
    'Regarde les 3 cartes du dessus de la pioche.',
  [CardType.FUITE]:
    "Passe ton tour. Aucune action supplémentaire n'est requise.",
  [CardType.CHANGEMENT_DE_SENS]:
    'Inverse le sens du jeu et passe ton tour. Le joueur suivant change de côté.',
  [CardType.BOMBE]:
    "Choisis un joueur : c'est immédiatement son tour et il doit jouer 2 fois de suite. Si tu avais des tours restants, il les récupère en plus.",
  [CardType.VOLEUR]:
    "Choisis un joueur : il doit te donner une carte de sa main (son choix).",
  [CardType.DE_VRAI]:
    'Mélange aléatoirement la pioche. Ton tour continue ensuite.',
  [CardType.DE_FAUX]:
    "Fait semblant de mélanger la pioche sans la changer. Seul toi sais que c'est faux ! Ton tour continue ensuite.",
  [CardType.DERNIERE_PIOCHE]:
    "Pioche la dernière carte du bas de la pioche au lieu du dessus. Met fin à ton tour.",
  [CardType.MIROIR]:
    "Copie l'effet de la dernière carte jouée, mais avec toi comme source. Jouable en réaction ou pendant ton tour si une carte a déjà été posée.",
  [CardType.RENVOIE]:
    "Redirige une carte ciblante vers un autre joueur de ton choix. Tu deviens le choisisseur. Jouable uniquement en réaction.",
  [CardType.METEORITE]:
    "Retire toutes les copies de la dernière carte jouée des mains de tous les joueurs (remises dans la pioche mélangée). Jouable en réaction ou pendant ton tour si une carte a déjà été posée.",
  [CardType.CHAINE]:
    "Bloque la dernière carte jouée pendant 3 tours : plus personne ne peut la jouer. Jouable en réaction ou pendant ton tour si une carte a déjà été posée.",
  [CardType.STOP]:
    "Annule l'effet de la dernière carte jouée. Jouable uniquement en réaction.",
  [CardType.HITMAN]:
    "Si tu pioches cette carte, tu es éliminé ! À moins d'avoir un Ange pour te sauver.",
  [CardType.ANGE]:
    "Te protège automatiquement si tu pioches un Hitman. L'Ange est défaussé à la place de ta vie.",
};
