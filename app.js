/* orientation-pro — app.js (vanilla JS)
   - 3 questions max / écran
   - chaque question peut être "passée"
   - questions conditionnelles
   - sidebar stats
   - résultats + analyse profil
   - clic proposition => modal détails
*/

(function () {
  "use strict";

  // ---------- Helpers ----------
  const $ = (sel) => document.querySelector(sel);
  const escapeHtml = (str) =>
    String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const numOrNull = (v) => {
    if (v === undefined || v === null || v === "" || v === "skip") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const clamp01 = (x) => Math.max(0, Math.min(1, x));

  // ---------- Data: Catalogue activités / métiers ----------
  const CATALOG = [
    {
      id: "salarie-product",
      titre: "Chef de produit (Product Manager) — salarié",
      type: "salarie",
      tags: ["virtuel", "service", "interieur", "equipe", "b2b", "recurrence-indirecte"],
      profil: { relationnel: 2, tech: 2, creatif: 1, operations: 2 },
      modele: { flex: 2, deplacements: 0, maintenance: 1, investissement: 1, risque: 1, revenu: 4, demarrage: 2 },
      details: {
        resume: "Rôle central entre business, design et technique pour piloter un produit (souvent digital).",
        missions: [
          "Définir la vision et prioriser la roadmap",
          "Travailler avec designers & développeurs",
          "Analyser données utilisateurs et feedback",
          "Coordonner les parties prenantes",
        ],
        environnement: "Souvent hybride/remote possible selon entreprise. Travail en équipe et réunions fréquentes.",
        competences: ["Communication", "Analyse", "Gestion de projet", "Culture produit", "Notions UX & data"],
        formation: "Accès via expérience (support/ops/marketing/dev) + projets. Certaines entreprises demandent Bac+3/5.",
        plus: ["Bon potentiel de salaire", "Variété", "Compétences transférables"],
        moins: ["Beaucoup d’arbitrages", "Pression délais", "Réunions"],
        demarrageTxt: "3 à 6 mois si reconversion structurée, plus rapide si déjà en environnement produit.",
      },
    },
    {
      id: "freelance-dev",
      titre: "Freelance développement web / automatisation — indépendant",
      type: "independant",
      tags: ["virtuel", "service", "interieur", "flexible", "b2b", "recurrence-possible"],
      profil: { relationnel: 1, tech: 3, creatif: 1, operations: 1 },
      modele: { flex: 3, deplacements: 0, maintenance: 1, investissement: 1, risque: 2, revenu: 5, demarrage: 2 },
      details: {
        resume: "Créer des sites, automatisations et intégrations (Make/Zapier/CRM) pour des clients.",
        missions: [
          "Cadrer les besoins et proposer une solution",
          "Implémenter / tester / livrer",
          "Documenter et maintenir",
          "Optimiser (tracking, performance, SEO technique)",
        ],
        environnement: "Remote fréquent. Travail concentré, parfois en binôme (design/marketing).",
        competences: ["Résolution de problèmes", "Rigueur", "Communication client", "Bases web / no-code"],
        formation: "Démarrage possible en no-code + spécialisation progressive.",
        plus: ["Très flexible", "Revenu scalable via offres packagées/retainers"],
        moins: ["Prospection", "Gestion client", "Maintenance"],
        demarrageTxt: "1 à 3 mois si offre simple (automations / no-code) + niche claire.",
      },
    },
    {
      id: "sdr-closer",
      titre: "SDR / Closer (vente B2B à distance) — salarié ou indép.",
      type: "mixte",
      tags: ["virtuel", "service", "interieur", "b2b", "relationnel", "recurrence-indirecte"],
      profil: { relationnel: 3, tech: 0, creatif: 0, operations: 1 },
      modele: { flex: 2, deplacements: 0, maintenance: 0, investissement: 1, risque: 2, revenu: 4, demarrage: 3 },
      details: {
        resume: "Prospection, qualification et conversion de prospects (fixe + variable / commissions).",
        missions: ["Prospection (email, LinkedIn, appels)", "Qualification", "Négociation", "Suivi CRM"],
        environnement: "Remote possible, rythme soutenu, objectifs chiffrés.",
        competences: ["Communication", "Résilience", "Écoute", "Organisation CRM"],
        formation: "Apprentissage rapide via scripts + coaching. Les résultats priment.",
        plus: ["Démarrage rapide", "Variable intéressant", "Très demandé"],
        moins: ["Pression du chiffre", "Refus fréquents", "Répétition"],
        demarrageTxt: "Quelques semaines pour être opérationnel si tu acceptes un ramp-up commercial.",
      },
    },
    {
      id: "assistant-virtuel",
      titre: "Assistant·e virtuel·le / support administratif — indépendant",
      type: "independant",
      tags: ["virtuel", "service", "interieur", "flexible", "recurrence-forte"],
      profil: { relationnel: 1, tech: 1, creatif: 0, operations: 3 },
      modele: { flex: 3, deplacements: 0, maintenance: 0, investissement: 1, risque: 1, revenu: 2, demarrage: 3 },
      details: {
        resume: "Aider des dirigeants/équipes sur l’admin, l’organisation, support client, outils.",
        missions: ["Gestion emails/agenda", "Factures", "Support client", "Mise à jour CRM", "Procédures"],
        environnement: "Remote. Souvent récurrent (forfaits heures/mois).",
        competences: ["Rigueur", "Autonomie", "Communication", "Outils (Google/Notion/CRM)"],
        formation: "Très accessible si tu sais structurer et communiquer.",
        plus: ["Récurrence facile", "Faible risque", "Démarrage rapide"],
        moins: ["Revenu plafonné sans spécialisation", "Routinier"],
        demarrageTxt: "0 à 1 mois pour 1er client si offre claire + ciblage.",
      },
    },
    {
      id: "video-edit",
      titre: "Monteur·se vidéo (shorts) — freelance ou salarié",
      type: "mixte",
      tags: ["virtuel", "service", "interieur", "flexible", "creatif", "recurrence-possible"],
      profil: { relationnel: 0, tech: 1, creatif: 3, operations: 1 },
      modele: { flex: 3, deplacements: 0, maintenance: 1, investissement: 2, risque: 2, revenu: 3, demarrage: 2 },
      details: {
        resume: "Créer des contenus courts (Reels/TikTok/Shorts) pour créateurs ou marques.",
        missions: ["Dérusher et monter vite", "Sous-titres, rythme, hooks", "Templates", "Optimisation plateforme"],
        environnement: "Remote. Demande forte si style efficace + régularité.",
        competences: ["Montage", "Storytelling", "Organisation", "Sens du rythme"],
        formation: "Progression rapide avec pratique quotidienne.",
        plus: ["Créatif", "Demande forte", "Récurrence via forfait mensuel"],
        moins: ["Deadlines serrées", "Volume", "Retours"],
        demarrageTxt: "1 à 3 mois pour constituer un portfolio solide.",
      },
    },
    {
      id: "jardinage",
      titre: "Entretien jardin / espaces verts — indépendant (local)",
      type: "independant",
      tags: ["reel", "service", "exterieur", "local", "recurrence-forte"],
      profil: { relationnel: 1, tech: 0, creatif: 0, operations: 2 },
      modele: { flex: 2, deplacements: 1, maintenance: 2, investissement: 2, risque: 1, revenu: 2, demarrage: 3 },
      details: {
        resume: "Prestations locales récurrentes (tonte, taille, entretien).",
        missions: ["Planifier tournées", "Réaliser prestations", "Devis/facturation", "Gestion matériel"],
        environnement: "Extérieur, physique, déplacements locaux.",
        competences: ["Fiabilité", "Organisation", "Relation client", "Sécurité / matériel"],
        formation: "Accessible; spécialisation possible (élagage, aménagement).",
        plus: ["Demande locale", "Récurrence forte", "Démarrage rapide"],
        moins: ["Saisonnalité", "Physique", "Matériel"],
        demarrageTxt: "Possible rapidement si offre + zone bien définies.",
      },
    },
    {
      id: "conciergerie",
      titre: "Conciergerie / gestion locative courte durée — indépendant",
      type: "independant",
      tags: ["reel", "service", "mixte", "local", "recurrence-forte", "maintenance-elevee"],
      profil: { relationnel: 2, tech: 0, creatif: 0, operations: 3 },
      modele: { flex: 1, deplacements: 1, maintenance: 3, investissement: 2, risque: 2, revenu: 3, demarrage: 2 },
      details: {
        resume: "Gérer Airbnb/booking : check-in/out, ménage, coordination, optimisation.",
        missions: ["Gestion voyageurs", "Coordination ménage/maintenance", "Optimisation annonces/prix", "Suivi incidents"],
        environnement: "Mixte, imprévus, week-ends parfois.",
        competences: ["Organisation", "Réactivité", "Process", "Relationnel"],
        formation: "Apprentissage terrain + procédures. Vérifier règles locales.",
        plus: ["Récurrence forte", "Croissance par portefeuille"],
        moins: ["Urgences", "Contraintes horaires", "Qualité prestataires"],
        demarrageTxt: "1 à 3 mois selon réseau local et prospection.",
      },
    },
    {
      id: "ecommerce",
      titre: "E-commerce niche (produit physique) — indépendant",
      type: "independant",
      tags: ["reel", "produit", "mixte", "logistique", "risque-moyen"],
      profil: { relationnel: 0, tech: 1, creatif: 2, operations: 2 },
      modele: { flex: 3, deplacements: 0, maintenance: 2, investissement: 3, risque: 3, revenu: 4, demarrage: 1 },
      details: {
        resume: "Vendre un produit physique (marque niche, revente, POD). Marketing + logistique.",
        missions: ["Positionnement", "Boutique + acquisition", "Logistique/retours", "Optimisation conversion"],
        environnement: "Plutôt intérieur; logistique parfois.",
        competences: ["Marketing", "Analyse", "Créa", "Organisation"],
        formation: "Autoformation possible; budget tests utile.",
        plus: ["Scalable", "Création d’actif (marque)"],
        moins: ["Risque", "Cashflow", "SAV/retours"],
        demarrageTxt: "3–6 mois pour valider une niche sérieusement.",
      },
    },
  ];

  // ---------- Data: Questions (avec conditions) ----------
  const FLOW = [
    { key: "statut", label: "Tu te vois plutôt…", hint: "Tu peux passer. Le système sortira un mix de pistes.", type: "select",
      options: [
        ["skip", "Je passe"],
        ["mixte", "Mix salarié + indépendant"],
        ["salarie", "Plutôt salarié"],
        ["independant", "Plutôt indépendant"],
      ],
    },
    { key: "revenu", label: "Revenu net mensuel visé", hint: "Choisis une fourchette (ou passe).", type: "select",
      options: [["skip","Je passe"],["1","< 1 500€"],["2","1 500–2 500€"],["3","2 500–4 000€"],["4","4 000–7 000€"],["5","7 000€+"]],
    },
    { key: "flex", label: "Flexibilité souhaitée", hint: "De 1 (faible) à 3 (forte).", type: "select",
      options: [["skip","Je passe"],["1","Faible"],["2","Moyenne"],["3","Forte"]],
    },

    { key: "env", label: "Environnement de travail", hint: "Intérieur, extérieur ou mixte.", type: "select",
      options: [["skip","Je passe"],["interieur","Intérieur"],["exterieur","Extérieur"],["mixte","Mixte"]],
    },
    { key: "depl", label: "Déplacements", hint: "Déplacements liés au travail.", type: "select",
      options: [["skip","Je passe"],["0","Jamais"],["1","Occasionnels"],["2","Fréquents"]],
    },
    { key: "region", label: "Zone préférée", hint: "Utile pour les activités locales.", type: "select",
      options: [["skip","Je passe"],["indifferent","Indifférent"],["rural","Rural"],["ville","Petite ville"],["grande-ville","Grande ville"]],
    },

    { key: "offre", label: "Tu préfères vendre…", hint: "Service, produit ou mixte.", type: "select",
      options: [["skip","Je passe"],["service","Un service"],["produit","Un produit"],["mixte","Mixte"]],
    },
    { key: "reelvirtuel", label: "Plutôt réel ou virtuel ?", hint: "Physique vs digital.", type: "select",
      options: [["skip","Je passe"],["virtuel","Virtuel (digital)"],["reel","Réel (physique)"],["mixte","Mixte"]],
    },
    { key: "recurrence", label: "Récurrence des ventes", hint: "Ponctuel vs abonnements/retainers.", type: "select",
      options: [["skip","Je passe"],["ponctuel","Plutôt ponctuel"],["recurrence","Plutôt récurrent"],["indifferent","Peu importe"]],
    },

    { key: "maintenance", label: "Maintenance / SAV", hint: "Ton confort avec la maintenance.", type: "select",
      options: [["skip","Je passe"],["0","Je veux éviter"],["1","OK modéré"],["2","J’accepte élevé"]],
    },
    { key: "invest", label: "Investissement initial", hint: "Budget de départ (approximatif).", type: "select",
      options: [["skip","Je passe"],["1","0–200€"],["2","200–2 000€"],["3","2 000–10 000€"],["4","10 000€+"]],
    },
    { key: "risque", label: "Tolérance au risque", hint: "1 (faible) → 3 (élevée).", type: "select",
      options: [["skip","Je passe"],["1","Faible"],["2","Moyenne"],["3","Élevée"]],
    },

    { key: "relationnel", label: "Relationnel / vente / négociation", hint: "0 (pas trop) → 3 (j’adore).", type: "select",
      options: [["skip","Je passe"],["0","Pas trop"],["1","Neutre"],["2","Oui"],["3","J’adore"]],
    },
    { key: "tech", label: "Technique / résolution de problèmes", hint: "0 → 3", type: "select",
      options: [["skip","Je passe"],["0","Pas trop"],["1","Neutre"],["2","Oui"],["3","J’adore"]],
    },
    { key: "creatif", label: "Créatif (design / écriture / contenu)", hint: "0 → 3", type: "select",
      options: [["skip","Je passe"],["0","Pas trop"],["1","Neutre"],["2","Oui"],["3","J’adore"]],
    },

    { key: "operations", label: "Organisation / process / logistique", hint: "0 → 3", type: "select",
      options: [["skip","Je passe"],["0","Pas trop"],["1","Neutre"],["2","Oui"],["3","J’adore"]],
    },
    { key: "demarrage", label: "Délai de démarrage souhaité", hint: "Plus c’est rapide, plus on favorise des pistes “démarrage rapide”.", type: "select",
      options: [["skip","Je passe"],["3","Vite (0–1 mois)"],["2","En 3–6 mois"],["1","En 6–12 mois"]],
    },

    { key: "depl_detail", label: "Si déplacements : tu acceptes lesquels ?", hint: "Apparaît si tu as indiqué des déplacements.", type: "select",
      condition: (s) => s.depl && s.depl !== "skip" && s.depl !== "0",
      options: [["skip","Je passe"],["local","Local (≤ 30 km)"],["region","Région"],["national","National"]],
    },

    { key: "indep_detail", label: "Si indépendant : tu préfères…", hint: "Apparaît si tu t’orientes vers l’indépendance.", type: "select",
      condition: (s) => s.statut === "independant" || s.statut === "mixte",
      options: [["skip","Je passe"],["client-b2b","Clients entreprises (B2B)"],["client-b2c","Clients particuliers (B2C)"],["mixte","Un mix B2B/B2C"]],
    },

    { key: "salarie_detail", label: "Si salarié : tu veux un cadre…", hint: "Apparaît si tu t’orientes vers le salariat.", type: "select",
      condition: (s) => s.statut === "salarie" || s.statut === "mixte",
      options: [["skip","Je passe"],["stable","Plutôt stable (rôle défini)"],["evolutif","Évolutif (missions variées)"],["challenge","Challenge (objectifs forts)"]],
    },

    { key: "notes", label: "Contrainte particulière (optionnel)", hint: "Ex : horaires, santé, permis, obligations…", type: "text" },
  ];

  // ---------- UI State ----------
  const UI = {
    pageSize: 3,
    cursor: 0,
    state: {},
    order: [],
  };

  const buildVisibleOrder = () => FLOW.filter((q) => !q.condition || q.condition(UI.state));
  const getPageQuestions = () => {
    UI.order = buildVisibleOrder();
    return UI.order.slice(UI.cursor, UI.cursor + UI.pageSize);
  };
  const totalPages = () => Math.max(1, Math.ceil(buildVisibleOrder().length / UI.pageSize));
  const pageIndex = () => Math.floor(UI.cursor / UI.pageSize) + 1;

  // ---------- Render: Stats sidebar ----------
  function deriveStats(s) {
    const flex = numOrNull(s.flex);        // 1..3
    const rel = numOrNull(s.relationnel);  // 0..3
    const tech = numOrNull(s.tech);        // 0..3
    const cre = numOrNull(s.creatif);      // 0..3
    const ops = numOrNull(s.operations);   // 0..3
    const risque = numOrNull(s.risque);    // 1..3
    const invest = numOrNull(s.invest);    // 1..4

    const autonomy = flex === null ? null : Math.round((flex / 3) * 100);
    const social = rel === null ? null : Math.round((rel / 3) * 100);
    const technical = tech === null ? null : Math.round((tech / 3) * 100);
    const creativity = cre === null ? null : Math.round((cre / 3) * 100);
    const structure = ops === null ? null : Math.round((ops / 3) * 100);

    // heuristique entrepreneuriat
    let entrepr = 50;
    if (s.statut === "independant") entrepr += 22;
    if (s.statut === "mixte") entrepr += 10;
    if (risque !== null) entrepr += (risque - 2) * 10;
    if (flex !== null) entrepr += (flex - 2) * 8;
    if (invest !== null) entrepr += (invest - 2) * 5;
    entrepr = Math.round(clamp01(entrepr / 100) * 100);

    return { autonomy, social, technical, creativity, structure, entrepr };
  }

  function barHTML(label, value) {
    const shown = value === null ? "—" : `${value}%`;
    const w = value === null ? 0 : value;
    return `
      <div class="kpi">
        <div>
          <div class="label">${escapeHtml(label)}</div>
          <div class="bar"><div style="width:${w}%;"></div></div>
        </div>
        <div class="value">${shown}</div>
      </div>
    `;
  }

  function computeAnsweredSkipped() {
    const visible = buildVisibleOrder();
    let answered = 0, skipped = 0;

    for (const q of visible) {
      const v = UI.state[q.key];
      if (q.type === "text") {
        if (v && String(v).trim().length > 0) answered++;
        else skipped++;
      } else {
        if (v && v !== "skip") answered++;
        else skipped++;
      }
    }
    return { answered, skipped };
  }

  function renderStats() {
    const st = deriveStats(UI.state);
    const { answered, skipped } = computeAnsweredSkipped();
    const p = pageIndex();
    const pages = totalPages();
    const progress = Math.round(((p - 1) / pages) * 100);

    $("#stepPill").textContent = `Écran ${p}/${pages}`;
    $("#answeredPill").textContent = `${answered} réponses`;
    $("#skippedPill").textContent = `${skipped} passées`;
    $("#progressPill").textContent = `${progress}%`;

    $("#statsBody").innerHTML = `
      ${barHTML("Autonomie / flexibilité", st.autonomy)}
      ${barHTML("Relationnel", st.social)}
      ${barHTML("Technique", st.technical)}
      ${barHTML("Créativité", st.creativity)}
      ${barHTML("Organisation / opérations", st.structure)}
      ${barHTML("Appétence entrepreneuriat (heuristique)", st.entrepr)}
    `;
  }

  // ---------- Render: Questionnaire ----------
  function questionHTML(q) {
    const val = UI.state[q.key] ?? "";
    if (q.type === "text") {
      return `
        <div class="q">
          <label for="${q.key}">${escapeHtml(q.label)}</label>
          <div class="hint">${escapeHtml(q.hint || "")}</div>
          <input id="${q.key}" type="text" placeholder="(optionnel) ..." value="${escapeHtml(val)}" />
        </div>
      `;
    }

    const effective = val === "" ? "skip" : val;
    return `
      <div class="q">
        <label for="${q.key}">${escapeHtml(q.label)}</label>
        <div class="hint">${escapeHtml(q.hint || "")}</div>
        <select id="${q.key}">
          ${(q.options || [["skip","Je passe"]]).map(([k, txt]) =>
            `<option value="${escapeHtml(k)}" ${k === effective ? "selected" : ""}>${escapeHtml(txt)}</option>`
          ).join("")}
        </select>
      </div>
    `;
  }

  function collectPage() {
    const qs = getPageQuestions();
    qs.forEach((q) => {
      const el = document.getElementById(q.key);
      if (!el) return;

      if (q.type === "text") {
        UI.state[q.key] = (el.value || "").trim();
      } else {
        UI.state[q.key] = el.value || "skip";
      }
    });
  }

  function renderPage() {
    const qs = getPageQuestions();
    const p = pageIndex();
    const pages = totalPages();

    $("#mainContent").innerHTML = `
      <div class="qgrid">
        ${qs.map(questionHTML).join("")}
      </div>

      <div class="actions">
        <div class="btnRow">
          <button class="secondary" id="prevBtn" ${UI.cursor === 0 ? "disabled" : ""}>Retour</button>
          <button class="ghost" id="skipBtn">Passer cet écran</button>
        </div>
        <div class="btnRow">
          ${(UI.cursor + UI.pageSize) < buildVisibleOrder().length
            ? `<button id="nextBtn">Continuer</button>`
            : `<button id="finishBtn">Voir mes résultats</button>`}
        </div>
      </div>

      <div class="divider"></div>
      <div style="color:var(--muted); font-size:12px;">
        Écran <b>${p}</b> sur <b>${pages}</b> · 3 questions max
      </div>
    `;

    $("#prevBtn")?.addEventListener("click", prevPage);
    $("#skipBtn")?.addEventListener("click", skipPage);
    $("#nextBtn")?.addEventListener("click", nextPage);
    $("#finishBtn")?.addEventListener("click", finish);

    renderStats();
  }

  function nextPage() {
    collectPage();
    UI.order = buildVisibleOrder();
    UI.cursor = Math.min(UI.cursor + UI.pageSize, Math.max(0, UI.order.length - UI.pageSize));
    renderPage();
  }

  function prevPage() {
    collectPage();
    UI.cursor = Math.max(0, UI.cursor - UI.pageSize);
    renderPage();
  }

  function skipPage() {
    const qs = getPageQuestions();
    qs.forEach((q) => {
      UI.state[q.key] = (q.type === "text") ? "" : "skip";
    });
    nextPage();
  }

  // ---------- Recommendation Engine ----------
  function scoreActivity(a, s) {
    const W = {
      statut: 3, revenu: 2, flex: 2, env: 2, depl: 2, offre: 2,
      reelvirtuel: 2, recurrence: 2, maintenance: 2, invest: 1.5,
      risque: 1.5, profil: 3, demarrage: 2,
    };

    let score = 0;
    const why = [];

    // statut
    if (s.statut && s.statut !== "skip") {
      if (s.statut === "mixte") {
        score += 1;
      } else {
        const ok = (a.type === s.statut) || (a.type === "mixte");
        score += ok ? W.statut : -W.statut;
        if (ok) why.push("Compatible avec ton orientation (salarié/indépendant)");
      }
    } else {
      score += 0.5;
    }

    // flex
    const flex = numOrNull(s.flex);
    if (flex !== null) {
      const dist = Math.abs(flex - a.modele.flex);
      score += (2 - dist) * W.flex;
      why.push("Flexibilité cohérente");
    }

    // env
    if (s.env && s.env !== "skip") {
      if (s.env === "mixte") score += 0.5;
      else {
        const ok = a.tags.includes(s.env);
        score += ok ? W.env : -1;
        if (ok) why.push("Environnement aligné");
      }
    }

    // déplacements
    if (s.depl && s.depl !== "skip") {
      const d = Number(s.depl);
      score += (d >= a.modele.deplacements) ? W.depl : -W.depl;
      why.push((d >= a.modele.deplacements) ? "Déplacements OK" : "Déplacements trop élevés");
    }

    // type offre
    if (s.offre && s.offre !== "skip") {
      if (s.offre === "mixte") score += 0.5;
      else {
        const ok = a.tags.includes(s.offre);
        score += ok ? W.offre : -0.5;
        if (ok) why.push("Type d’offre cohérent (produit/service)");
      }
    }

    // réel/virtuel
    if (s.reelvirtuel && s.reelvirtuel !== "skip") {
      if (s.reelvirtuel === "mixte") score += 0.5;
      else {
        const ok = a.tags.includes(s.reelvirtuel);
        score += ok ? W.reelvirtuel : -0.5;
        if (ok) why.push("Réel/virtuel aligné");
      }
    }

    // récurrence
    if (s.recurrence && s.recurrence !== "skip") {
      if (s.recurrence === "indifferent") score += 0.5;
      else if (s.recurrence === "recurrence") {
        const ok = a.tags.includes("recurrence-forte") || a.tags.includes("recurrence-possible") || a.tags.includes("recurrence-indirecte");
        score += ok ? W.recurrence : -0.5;
        if (ok) why.push("Récurrence possible");
      } else {
        score += 0.2;
      }
    }

    // maintenance
    const maint = numOrNull(s.maintenance);
    if (maint !== null) {
      score += (2 - Math.abs(maint - a.modele.maintenance)) * W.maintenance;
      why.push("Maintenance/SAV cohérent");
    }

    // invest
    const inv = numOrNull(s.invest);
    if (inv !== null) {
      score += (inv >= a.modele.investissement) ? W.invest : -0.5;
      why.push("Investissement compatible");
    }

    // risque
    const r = numOrNull(s.risque);
    if (r !== null) score += (r >= a.modele.risque) ? W.risque : -0.5;

    // revenu
    const rev = numOrNull(s.revenu);
    if (rev !== null) {
      score += (rev <= a.modele.revenu) ? W.revenu : -0.3;
      why.push("Potentiel de revenu compatible");
    }

    // démarrage
    const dem = numOrNull(s.demarrage);
    if (dem !== null) {
      score += (dem >= a.modele.demarrage) ? W.demarrage : -0.5;
      why.push("Délai de démarrage réaliste");
    }

    // profil
    const rel = numOrNull(s.relationnel);
    const tech = numOrNull(s.tech);
    const cre = numOrNull(s.creatif);
    const ops = numOrNull(s.operations);

    let dims = 0, dist = 0;
    if (rel !== null) { dims++; dist += Math.abs(rel - a.profil.relationnel); }
    if (tech !== null) { dims++; dist += Math.abs(tech - a.profil.tech); }
    if (cre !== null) { dims++; dist += Math.abs(cre - a.profil.creatif); }
    if (ops !== null) { dims++; dist += Math.abs(ops - a.profil.operations); }

    if (dims > 0) {
      const fit = 1 - (dist / (dims * 3));
      score += fit * W.profil * 6;
      why.push("Alignement des tâches");
    } else {
      score += 0.2;
    }

    return { score, why };
  }

  function analyzeProfile(s) {
    const st = deriveStats(s);
    const bits = [];

    if (s.statut && s.statut !== "skip") {
      if (s.statut === "mixte") bits.push("Tu es ouvert·e à un mix salarié + indépendant (stabilité + potentiel).");
      if (s.statut === "salarie") bits.push("Tu sembles privilégier un cadre salarié (stabilité, équipe, progression).");
      if (s.statut === "independant") bits.push("Tu sembles attiré·e par l’indépendance (autonomie, choix des missions).");
    } else {
      bits.push("Tu n’as pas fixé de statut : je propose donc un mix de pistes salarié + indépendant.");
    }

    if (s.env && s.env !== "skip") {
      if (s.env === "interieur") bits.push("Tu préfères un environnement plutôt intérieur (digital/bureau).");
      if (s.env === "exterieur") bits.push("Tu préfères l’extérieur (pistes terrain/locales favorisées).");
      if (s.env === "mixte") bits.push("Tu es à l’aise avec un mix intérieur/extérieur.");
    }

    const flex = numOrNull(s.flex);
    if (flex !== null) {
      if (flex === 3) bits.push("La flexibilité est importante pour toi : on favorise des métiers avec autonomie horaire.");
      if (flex === 1) bits.push("Tu acceptes un cadre plus fixe : les postes structurés deviennent très pertinents.");
    }

    if (s.recurrence && s.recurrence !== "skip") {
      if (s.recurrence === "recurrence") bits.push("Tu privilégies des revenus récurrents : abonnements/retainers favorisés.");
      if (s.recurrence === "ponctuel") bits.push("Tu préfères des projets ponctuels : on favorise des missions à livraison.");
    }

    const dom = [];
    if (st.social !== null) dom.push(["Relationnel", st.social]);
    if (st.technical !== null) dom.push(["Technique", st.technical]);
    if (st.creativity !== null) dom.push(["Créativité", st.creativity]);
    if (st.structure !== null) dom.push(["Organisation", st.structure]);
    dom.sort((a, b) => b[1] - a[1]);
    if (dom.length) bits.push(`Tes affinités ressortent surtout sur : <b>${dom.slice(0,2).map(x=>x[0]).join(" & ")}</b>.`);

    if (st.entrepr !== null) {
      if (st.entrepr >= 70) bits.push("Appétence entrepreneuriale élevée (autonomie/risque).");
      else if (st.entrepr <= 35) bits.push("Appétence entrepreneuriale prudente (sécurité/risque faible).");
    }

    if (s.notes && s.notes.trim().length) bits.push(`Contrainte notée : “${escapeHtml(s.notes.trim())}”.`);

    return bits.join(" ");
  }

  // ---------- Results render ----------
  function finish() {
    collectPage();

    const ranked = CATALOG
      .map((a) => {
        const r = scoreActivity(a, UI.state);
        return { ...a, score: r.score, why: r.why };
      })
      .sort((x, y) => y.score - x.score);

    const top = ranked.slice(0, 7);
    const profileText = analyzeProfile(UI.state);

    $("#mainContent").innerHTML = `
      <div class="analysisBox">
        <b>Analyse de ton profil :</b><br/>
        ${profileText}
      </div>

      <div class="divider"></div>

      <div style="color:var(--muted); font-size:12px;">Clique sur une proposition pour ouvrir la fiche détaillée.</div>

      <div class="resultsGrid">
        ${top.map((item) => `
          <div class="result" data-open="${escapeHtml(item.id)}">
            <div>
              <div class="name">${escapeHtml(item.titre)}</div>
              <div class="meta"><b>Pourquoi :</b> ${escapeHtml(item.why.slice(0,5).join(" • "))}</div>
              <div>${item.tags.slice(0,8).map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>
            </div>
            <div class="score">${Math.round(item.score)} pts</div>
          </div>
        `).join("")}
      </div>

      <div class="divider"></div>

      <div class="actions">
        <div class="btnRow">
          <button class="secondary" id="restartBtn">Modifier mes réponses</button>
        </div>
      </div>
    `;

    document.querySelectorAll("[data-open]").forEach((el) => {
      el.addEventListener("click", () => openModal(el.getAttribute("data-open")));
    });
    $("#restartBtn").addEventListener("click", restart);

    renderStats();
  }

  function restart() {
    UI.cursor = 0;
    UI.state = {};
    renderPage();
  }

  // ---------- Modal ----------
  function openModal(id) {
    const item = CATALOG.find((x) => x.id === id);
    if (!item) return;

    $("#modalTitle").textContent = item.titre;
    $("#modalSub").textContent =
      item.type === "mixte" ? "Salarié ou indépendant (selon contexte)" :
      item.type === "salarie" ? "Piste salariée" : "Piste indépendante";

    const d = item.details || {};
    $("#modalBody").innerHTML = `
      <div class="section">
        <h3>Résumé</h3>
        <p>${escapeHtml(d.resume || "—")}</p>
      </div>

      <div class="section">
        <h3>Missions typiques</h3>
        <ul>${(d.missions || []).map((x) => `<li>${escapeHtml(x)}</li>`).join("") || "<li>—</li>"}</ul>
      </div>

      <div class="section">
        <h3>Environnement</h3>
        <p>${escapeHtml(d.environnement || "—")}</p>
      </div>

      <div class="section">
        <h3>Compétences</h3>
        <ul>${(d.competences || []).map((x) => `<li>${escapeHtml(x)}</li>`).join("") || "<li>—</li>"}</ul>
      </div>

      <div class="section">
        <h3>Formation / accès</h3>
        <p>${escapeHtml(d.formation || "—")}</p>
        <p><b>Démarrage :</b> ${escapeHtml(d.demarrageTxt || "—")}</p>
      </div>

      <div class="section">
        <h3>Points forts / points de vigilance</h3>
        <p><b style="color:var(--ok)">+ </b>${escapeHtml((d.plus || []).join(" • ") || "—")}</p>
        <p><b style="color:var(--warn)">! </b>${escapeHtml((d.moins || []).join(" • ") || "—")}</p>
      </div>

      <div class="section">
        <h3>Tags</h3>
        <p>${item.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</p>
      </div>
    `;

    $("#modalOverlay").style.display = "flex";
  }

  function closeModal() {
    $("#modalOverlay").style.display = "none";
  }

  // ---------- Init ----------
  function init() {
    // modal events
    $("#closeModalBtn").addEventListener("click", closeModal);
    $("#modalOverlay").addEventListener("click", (e) => {
      if (e.target && e.target.id === "modalOverlay") closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });

    renderPage();
  }

  // Robust start
  window.addEventListener("DOMContentLoaded", () => {
    try { init(); }
    catch (err) {
      console.error(err);
      $("#mainContent").innerHTML = `
        <div class="analysisBox" style="border-color: rgba(251,113,133,.35); background: rgba(251,113,133,.10); color:#FFD7DE;">
          <b>Erreur JavaScript</b><br/>
          <span style="opacity:.9">Ouvre la console (F12) et copie l’erreur ici.</span><br/><br/>
          <code>${escapeHtml(String(err))}</code>
        </div>
      `;
    }
  });

  // expose for debugging (optional)
  window.__ORIENT = { openModal, closeModal };
})();
