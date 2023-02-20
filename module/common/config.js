export const OMEGA = {
  ARME: {
    TECHNOLOGIE: {
      antimatiere: "Antimatière",
      cac: "Corps-à-corps",
      electromagnetique: "Electromagnétique",
      energétique: "Energétique",
      gravitationnelles: "Gravitationnelles",
      iem: "IEM",
      indirect: "Tir indirect",
      moleculaire: "Moléculaire",
      neutrons: "Neutrons",
      percussion: "Percussion",
      percussionsynt: "Percussion Synthétique",
      plasma: "Plasma",
      sales: "Sales",
      sonique: "Sonique"
    },
    TYPEPROGRAMME: {
      armesaenergie: "AAE",
      exterminateur: "Exterminateur",
      tir: "Tir",
      corpsacorps: "Corps à corps"
    },
  },
  REGROUPEMENT_ARMES: {
    TECHNOLOGIE: {
      energetique: "Energétique",
      particules: "Particules",
      plasma: "Plasma",
      gravitationnelles: "Gravitationnelles",
      missiles: "Missiles",
      torpille: "Torpille",
      moleculaire: "Moléculaire",
      railguns: "RailGuns"
    },
    EFFET_CRITIQUE: {
      echec_ra: {label:"Inutilisable pour le prochain tour de combat"},
      energetique: {label:"Perturbations électriques (Défense -1 pendant 1 tour)"},
      particules: {label:"Dégâts persistants bleus supplémentaires pour les 2 prochains segments de combat"},
      plasma: {label:"Surchauffe (-2 en Évolution jusqu'à la fin du tour de combat)"},
      gravitationnelles: {label:"Immobilisation (perte des actions restantes)"},
      missiles: {label:"Annule les activités OPSAR"},
      torpille: {label:"Explosion (Tirage d'une diode supplémentaire de dégâts)"},
      railguns: {label:"Dégâts appliqués 2 fois"}
    },
    TYPERA: {
      leger: "Léger",
      moyen: "Moyen",
      lourd: "Lourd"
    },
  },
  EQUIPAGE: {
    cannonier: {
      reference: "consuitedetir"
    },
    tacticien: {
      reference: "tactique"
    },
    opsar: {
      reference: "opsar"
    },
    mecanicien: {
      reference: "mecanique"
    },
    pilote: {
      reference: "pilotage"
    },
  },
  EFFET_CRITIQUE: {
    aucun: {
      label: "Aucun"
    },
    accelerateur: {
      label: "Accelérateur de dégâts"
    },
    arrachement: {
      label: "Arrachement"
    },
    assomme1: {
      label: "Assommé pour 1mn"
    },
    assomme10: {
      label: "Assommé pour 10mn"
    },
    degradation: {
      label: "Dégradation polymérique"
    },
    deregulation: {
      label: "Dérégulation"
    },
    dereglement: {
      label: "Dérèglement"
    },
    disrupteur1: {
      label: "Disrupteur 1"
    },
    disrupteur2: {
      label: "Disrupteur 2"
    },
    entrave: {
      label: "Entrave"
    },
    etourdi: {
      label: "Etourdi pour 1 tour"
    },
    explosion: {
      label: "Explosion"
    },
    iem1: {
      label: "IEM 1"
    },
    iem2: {
      label: "IEM 2"
    },
    mort: {
      label: "Mort subite"
    },
    renversement: {
      label: "Renversement"
    },
    resonnance: {
      label: "Résonnance"
    },
    surchauffe: {
      label: "Surchauffe"
    },
    trouble: {
      label: "Trouble sensoriel"
    },
  },
  EFFET_NEGATIF: {
    aucun: {
      label: "Aucun"
    },
    breche: {
      label: "Brèche"
    },
    chargeur: {
      label: "Chargeur vide"
    },
    contamination: {
      label: "Contamination"
    },
    destruction: {
      label: "Destruction"
    },
    enraye: {
      label: "Arme enrayée"
    },
    erreur: {
      label: "Erreur système"
    },
    explosion_munition: {
      label: "Explosion de l'arme"
    },
    perte: {
      label: "Perte de l'arme"
    },
    rate: {
      label: "Raté"
    },
    reprogrammation: {
      label: "Reprogrammation"
    },
    surchauffe_echec: {
      label: "Surchauffe"
    },
  },
  EXTENSION: {
    TYPE: {
      app: "Application immédiate",
      action: "Action",
      declenchement: "Déclenchement",
      reaction: "Réaction"
    },
  },
  FIRME: {
    futuretechnologies: {
      name: "Future Technologies",
      logoclass: "logo_futuretechnologies",
      logoimg: "./assets/image/logo/logo_futuretechnologies.webp"
    },
    earthshield: {
      name: "Earthshield",
      logoclass: "logo_earthshield",
      logoimg: "./assets/image/logo/logo_earthshield.webp"
    },
    hegemon: {
      name: "Hegemon",
      logoclass: "logo_hegemon",
      logoimg: "./assets/image/logo/logo_hegemon.webp"
    },
    cyberlife: {
      name: "Cyberlife",
      logoclass: "logo_cyberlife",
      logoimg: "./assets/image/logo/logo_cyberlife.webp"
    },
    prophetiaincorporated: {
      name: "Prophetia, inc.",
      logoclass: "logo_prophetiaincorporated",
      logoimg: "./assets/image/logo/logo_prophetiaincorporated.webp"
    },
  },
  ORGANIQUE: {
    EQUIVALENCE: {
      armesaenergie: "tir",
      exterminateur: "corpsacorps"
    },
  },
  TYPESYNTH: {
    omega: "Omega",
    psi: "Psi",
    alpha: "Alpha",
    sigma: "Sigma",
  },
};

export const SYSTEM_NAME = "omega";
export const SYSTEM_DESCRIPTION = "Oméga";
export const LOG_HEAD = "Omega | ";
export const ROLL_TYPE = {
  ATTACK: "attack",
  CHANCE: "chance",
  INITIATIVE: "initiative",
  PROGRAM: "program",
  SIMPLE: "simple",
};
