import type { UPSCSyllabus, SyllabusTopic } from "@/types/Syllabus";

const topic = (
  id: string,
  name: string,
  children: SyllabusTopic[] = []
): SyllabusTopic => ({
  id,
  name,
  children,
});

export const upscSyllabus: UPSCSyllabus = {
  id: "upsc-cse-2028",
  exam: "UPSC CSE",
  targetYear: 2028,

  sections: [
    // ============================================================
    // PRELIMS
    // ============================================================
    {
      id: "prelims",
      name: "Prelims",
      stage: "prelims",

      subjects: [
        {
          id: "prelims-gs",
          name: "General Studies Paper I",
          paper: "prelims-gs",

          topics: [
            // ---------------- HISTORY ----------------
            topic("prelims-history", "History", [
              topic("prelims-history-ancient", "Ancient India", [
                topic("prelims-history-ancient-prehistory", "Prehistoric India"),
                topic("prelims-history-ancient-indus", "Indus Valley Civilization"),
                topic("prelims-history-ancient-vedic", "Vedic Age"),
                topic("prelims-history-ancient-mahajanapadas", "Mahajanapadas"),
                topic("prelims-history-ancient-buddhism", "Buddhism"),
                topic("prelims-history-ancient-jainism", "Jainism"),
                topic("prelims-history-ancient-mauryas", "Mauryan Empire"),
                topic("prelims-history-ancient-postmaurya", "Post-Mauryan Period"),
                topic("prelims-history-ancient-gupta", "Gupta Empire"),
                topic("prelims-history-ancient-south", "South Indian Kingdoms"),
                topic("prelims-history-ancient-culture", "Ancient Indian Culture"),
              ]),

              topic("prelims-history-medieval", "Medieval India", [
                topic("prelims-history-medieval-early", "Early Medieval India"),
                topic("prelims-history-medieval-delhi", "Delhi Sultanate"),
                topic("prelims-history-medieval-vijayanagara", "Vijayanagara Empire"),
                topic("prelims-history-medieval-bahmani", "Bahmani Kingdom"),
                topic("prelims-history-medieval-mughal", "Mughal Empire"),
                topic("prelims-history-medieval-marathas", "Marathas"),
                topic("prelims-history-medieval-bhakti", "Bhakti Movement"),
                topic("prelims-history-medieval-sufi", "Sufi Movement"),
                topic("prelims-history-medieval-culture", "Medieval Indian Culture"),
              ]),

              topic("prelims-history-modern", "Modern India", [
                topic("prelims-history-modern-europeans", "Advent of Europeans"),
                topic("prelims-history-modern-british", "British Expansion"),
                topic("prelims-history-modern-economic", "Economic Impact of British Rule"),
                topic("prelims-history-modern-revolt", "Revolt of 1857"),
                topic("prelims-history-modern-reform", "Social and Religious Reform Movements"),
                topic("prelims-history-modern-nationalism", "Rise of Indian Nationalism"),
                topic("prelims-history-modern-congress", "Indian National Congress"),
                topic("prelims-history-modern-swadeshi", "Swadeshi Movement"),
                topic("prelims-history-modern-gandhian", "Gandhian Era"),
                topic("prelims-history-modern-revolutionary", "Revolutionary Movement"),
                topic("prelims-history-modern-constitutional", "Constitutional Developments"),
                topic("prelims-history-modern-quitindia", "Quit India Movement"),
                topic("prelims-history-modern-independence", "Independence and Partition"),
              ]),

              topic("prelims-history-culture", "Art & Culture", [
                topic("prelims-history-culture-architecture", "Architecture"),
                topic("prelims-history-culture-sculpture", "Sculpture"),
                topic("prelims-history-culture-painting", "Painting"),
                topic("prelims-history-culture-music", "Indian Music"),
                topic("prelims-history-culture-dance", "Indian Dance Forms"),
                topic("prelims-history-culture-theatre", "Theatre and Puppetry"),
                topic("prelims-history-culture-literature", "Indian Literature"),
                topic("prelims-history-culture-religion", "Religion and Philosophy"),
                topic("prelims-history-culture-unesco", "UNESCO Heritage"),
              ]),
            ]),

            // ---------------- GEOGRAPHY ----------------
            topic("prelims-geography", "Geography", [
              topic("prelims-geography-physical", "Physical Geography", [
                topic("prelims-geography-physical-earth", "Earth and Its Interior"),
                topic("prelims-geography-physical-geomorphology", "Geomorphology"),
                topic("prelims-geography-physical-plate", "Plate Tectonics"),
                topic("prelims-geography-physical-rocks", "Rocks and Minerals"),
                topic("prelims-geography-physical-landforms", "Landforms"),
                topic("prelims-geography-physical-oceanography", "Oceanography"),
                topic("prelims-geography-physical-atmosphere", "Atmosphere"),
                topic("prelims-geography-physical-climatology", "Climatology"),
                topic("prelims-geography-physical-weather", "Weather Systems"),
              ]),

              topic("prelims-geography-india", "Indian Geography", [
                topic("prelims-geography-india-physiography", "Physiographic Divisions"),
                topic("prelims-geography-india-himalayas", "Himalayas"),
                topic("prelims-geography-india-rivers", "Rivers and Drainage"),
                topic("prelims-geography-india-climate", "Indian Climate"),
                topic("prelims-geography-india-soils", "Soils"),
                topic("prelims-geography-india-naturalvegetation", "Natural Vegetation"),
                topic("prelims-geography-india-agriculture", "Agriculture"),
                topic("prelims-geography-india-minerals", "Mineral Resources"),
                topic("prelims-geography-india-industries", "Industries"),
                topic("prelims-geography-india-transport", "Transport"),
                topic("prelims-geography-india-population", "Population"),
                topic("prelims-geography-india-urbanization", "Urbanization"),
              ]),

              topic("prelims-geography-world", "World Geography", [
                topic("prelims-geography-world-continents", "Continents"),
                topic("prelims-geography-world-oceans", "Oceans and Seas"),
                topic("prelims-geography-world-climate", "World Climate"),
                topic("prelims-geography-world-resources", "World Resources"),
                topic("prelims-geography-world-industries", "World Industries"),
                topic("prelims-geography-world-mapping", "World Mapping"),
              ]),
            ]),

            // ---------------- POLITY ----------------
            topic("prelims-polity", "Indian Polity & Governance", [
              topic("prelims-polity-constitution", "Constitution", [
                topic("prelims-polity-constitution-making", "Making of the Constitution"),
                topic("prelims-polity-constitution-features", "Salient Features"),
                topic("prelims-polity-constitution-preamble", "Preamble"),
                topic("prelims-polity-constitution-amendment", "Constitutional Amendments"),
                topic("prelims-polity-constitution-basicstructure", "Basic Structure"),
              ]),

              topic("prelims-polity-rights", "Fundamental Rights & Duties", [
                topic("prelims-polity-rights-fundamental", "Fundamental Rights"),
                topic("prelims-polity-rights-dpsp", "Directive Principles of State Policy"),
                topic("prelims-polity-rights-duties", "Fundamental Duties"),
                topic("prelims-polity-rights-writs", "Writs"),
              ]),

              topic("prelims-polity-union", "Union Government", [
                topic("prelims-polity-union-president", "President"),
                topic("prelims-polity-union-vicepresident", "Vice-President"),
                topic("prelims-polity-union-prime-minister", "Prime Minister"),
                topic("prelims-polity-union-council", "Council of Ministers"),
                topic("prelims-polity-union-parliament", "Parliament"),
                topic("prelims-polity-union-committees", "Parliamentary Committees"),
                topic("prelims-polity-union-supremecourt", "Supreme Court"),
                topic("prelims-polity-union-cag", "Comptroller and Auditor General"),
                topic("prelims-polity-union-election", "Election Commission"),
              ]),

              topic("prelims-polity-state", "State Government", [
                topic("prelims-polity-state-governor", "Governor"),
                topic("prelims-polity-state-cm", "Chief Minister"),
                topic("prelims-polity-state-legislature", "State Legislature"),
                topic("prelims-polity-state-highcourt", "High Courts"),
              ]),

              topic("prelims-polity-local", "Local Government", [
                topic("prelims-polity-local-panchayat", "Panchayati Raj"),
                topic("prelims-polity-local-municipality", "Municipalities"),
                topic("prelims-polity-local-scheduled", "Scheduled and Tribal Areas"),
              ]),

              topic("prelims-polity-bodies", "Constitutional & Statutory Bodies", [
                topic("prelims-polity-bodies-upsc", "UPSC"),
                topic("prelims-polity-bodies-finance", "Finance Commission"),
                topic("prelims-polity-bodies-niti", "NITI Aayog"),
                topic("prelims-polity-bodies-humanrights", "Human Rights Institutions"),
                topic("prelims-polity-bodies-information", "Information Commissions"),
              ]),

              topic("prelims-polity-governance", "Governance", [
                topic("prelims-polity-governance-transparency", "Transparency and Accountability"),
                topic("prelims-polity-governance-e-governance", "E-Governance"),
                topic("prelims-polity-governance-citizen", "Citizen Charters"),
                topic("prelims-polity-governance-publicpolicy", "Public Policy"),
              ]),
            ]),

            // ---------------- ECONOMY ----------------
            topic("prelims-economy", "Indian Economy", [
              topic("prelims-economy-basics", "Basic Economic Concepts", [
                topic("prelims-economy-basics-gdp", "GDP and National Income"),
                topic("prelims-economy-basics-inflation", "Inflation"),
                topic("prelims-economy-basics-unemployment", "Unemployment"),
                topic("prelims-economy-basics-growth", "Economic Growth and Development"),
              ]),

              topic("prelims-economy-banking", "Banking & Monetary Policy", [
                topic("prelims-economy-banking-rbi", "Reserve Bank of India"),
                topic("prelims-economy-banking-monetary", "Monetary Policy"),
                topic("prelims-economy-banking-interest", "Interest Rates"),
                topic("prelims-economy-banking-npa", "NPAs"),
                topic("prelims-economy-banking-financial", "Financial Inclusion"),
              ]),

              topic("prelims-economy-fiscal", "Fiscal Policy", [
                topic("prelims-economy-fiscal-budget", "Union Budget"),
                topic("prelims-economy-fiscal-taxation", "Taxation"),
                topic("prelims-economy-fiscal-deficit", "Fiscal Deficit"),
                topic("prelims-economy-fiscal-debt", "Public Debt"),
                topic("prelims-economy-fiscal-subsidies", "Subsidies"),
              ]),

              topic("prelims-economy-external", "External Sector", [
                topic("prelims-economy-external-bop", "Balance of Payments"),
                topic("prelims-economy-external-forex", "Foreign Exchange"),
                topic("prelims-economy-external-trade", "International Trade"),
                topic("prelims-economy-external-wto", "WTO"),
                topic("prelims-economy-external-fdi", "FDI and FPI"),
              ]),

              topic("prelims-economy-development", "Economic & Social Development", [
                topic("prelims-economy-development-poverty", "Poverty"),
                topic("prelims-economy-development-inclusion", "Social Inclusion"),
                topic("prelims-economy-development-demography", "Demographics"),
                topic("prelims-economy-development-health", "Health"),
                topic("prelims-economy-development-education", "Education"),
                topic("prelims-economy-development-employment", "Employment"),
              ]),
            ]),

            // ---------------- ENVIRONMENT ----------------
            topic("prelims-environment", "Environment & Ecology", [
              topic("prelims-environment-ecology", "Ecology", [
                topic("prelims-environment-ecology-ecosystem", "Ecosystems"),
                topic("prelims-environment-ecology-foodchain", "Food Chains and Food Webs"),
                topic("prelims-environment-ecology-energy", "Energy Flow"),
                topic("prelims-environment-ecology-cycles", "Biogeochemical Cycles"),
                topic("prelims-environment-ecology-succession", "Ecological Succession"),
              ]),

              topic("prelims-environment-biodiversity", "Biodiversity", [
                topic("prelims-environment-biodiversity-levels", "Levels of Biodiversity"),
                topic("prelims-environment-biodiversity-hotspots", "Biodiversity Hotspots"),
                topic("prelims-environment-biodiversity-species", "Threatened Species"),
                topic("prelims-environment-biodiversity-conservation", "Conservation"),
                topic("prelims-environment-biodiversity-protected", "Protected Areas"),
              ]),

              topic("prelims-environment-climate", "Climate Change", [
                topic("prelims-environment-climate-greenhouse", "Greenhouse Effect"),
                topic("prelims-environment-climate-globalwarming", "Global Warming"),
                topic("prelims-environment-climate-adaptation", "Adaptation"),
                topic("prelims-environment-climate-mitigation", "Mitigation"),
                topic("prelims-environment-climate-agreements", "International Climate Agreements"),
              ]),

              topic("prelims-environment-pollution", "Environmental Pollution", [
                topic("prelims-environment-pollution-air", "Air Pollution"),
                topic("prelims-environment-pollution-water", "Water Pollution"),
                topic("prelims-environment-pollution-soil", "Soil Pollution"),
                topic("prelims-environment-pollution-noise", "Noise Pollution"),
                topic("prelims-environment-pollution-waste", "Waste Management"),
              ]),

              topic("prelims-environment-laws", "Environmental Governance", [
                topic("prelims-environment-laws-acts", "Environmental Laws"),
                topic("prelims-environment-laws-institutions", "Environmental Institutions"),
                topic("prelims-environment-laws-conventions", "International Conventions"),
              ]),
            ]),

            // ---------------- SCIENCE & TECHNOLOGY ----------------
            topic("prelims-science-tech", "Science & Technology", [
              topic("prelims-science-tech-physics", "Physics in Everyday Life"),
              topic("prelims-science-tech-chemistry", "Chemistry in Everyday Life"),

              topic("prelims-science-tech-biology", "Biology & Biotechnology", [
                topic("prelims-science-tech-biology-cell", "Cell Biology"),
                topic("prelims-science-tech-biology-genetics", "Genetics"),
                topic("prelims-science-tech-biology-biotech", "Biotechnology"),
                topic("prelims-science-tech-biology-disease", "Diseases and Immunity"),
                topic("prelims-science-tech-biology-vaccines", "Vaccines"),
              ]),

              topic("prelims-science-tech-space", "Space Technology", [
                topic("prelims-science-tech-space-isro", "ISRO"),
                topic("prelims-science-tech-space-satellites", "Satellites"),
                topic("prelims-science-tech-space-launch", "Launch Vehicles"),
                topic("prelims-science-tech-space-exploration", "Space Exploration"),
              ]),

              topic("prelims-science-tech-digital", "Digital Technology", [
                topic("prelims-science-tech-digital-ai", "Artificial Intelligence"),
                topic("prelims-science-tech-digital-quantum", "Quantum Technology"),
                topic("prelims-science-tech-digital-cyber", "Cyber Technology"),
                topic("prelims-science-tech-digital-blockchain", "Blockchain"),
              ]),

              topic("prelims-science-tech-emerging", "Emerging Technologies", [
                topic("prelims-science-tech-emerging-nanotech", "Nanotechnology"),
                topic("prelims-science-tech-emerging-robotics", "Robotics"),
                topic("prelims-science-tech-emerging-semiconductors", "Semiconductors"),
                topic("prelims-science-tech-emerging-3d", "3D Printing"),
              ]),
            ]),

            // ---------------- CURRENT AFFAIRS ----------------
            topic("prelims-current-affairs", "Current Affairs", [
              topic("prelims-current-affairs-national", "National Events"),
              topic("prelims-current-affairs-international", "International Events"),
              topic("prelims-current-affairs-economy", "Economy & Business"),
              topic("prelims-current-affairs-science", "Science & Technology"),
              topic("prelims-current-affairs-environment", "Environment"),
              topic("prelims-current-affairs-polity", "Polity & Governance"),
              topic("prelims-current-affairs-awards", "Awards & Honours"),
              topic("prelims-current-affairs-reports", "Reports & Indices"),
              topic("prelims-current-affairs-organisations", "International Organisations"),
            ]),
          ],
        },

        // ========================================================
        // CSAT
        // ========================================================
        {
          id: "csat",
          name: "CSAT",
          paper: "csat",

          topics: [
            topic("csat-comprehension", "Comprehension", [
              topic("csat-comprehension-reading", "Reading Comprehension"),
              topic("csat-comprehension-inference", "Inference"),
              topic("csat-comprehension-mainidea", "Main Idea"),
            ]),

            topic("csat-quant", "Basic Numeracy & Quantitative Aptitude", [
              topic("csat-quant-number", "Number Systems"),
              topic("csat-quant-percentage", "Percentages"),
              topic("csat-quant-ratio", "Ratio and Proportion"),
              topic("csat-quant-average", "Averages"),
              topic("csat-quant-profitloss", "Profit and Loss"),
              topic("csat-quant-interest", "Simple and Compound Interest"),
              topic("csat-quant-timework", "Time and Work"),
              topic("csat-quant-time", "Time, Speed and Distance"),
              topic("csat-quant-mensuration", "Mensuration"),
              topic("csat-quant-algebra", "Basic Algebra"),
              topic("csat-quant-data", "Data Interpretation"),
            ]),

            topic("csat-reasoning", "Logical & Analytical Reasoning", [
              topic("csat-reasoning-series", "Series"),
              topic("csat-reasoning-coding", "Coding and Decoding"),
              topic("csat-reasoning-blood", "Blood Relations"),
              topic("csat-reasoning-direction", "Direction Sense"),
              topic("csat-reasoning-ranking", "Ranking and Ordering"),
              topic("csat-reasoning-statement", "Statement and Conclusion"),
              topic("csat-reasoning-logic", "Logical Reasoning"),
              topic("csat-reasoning-data", "Data Sufficiency"),
            ]),

            topic("csat-decision", "Decision Making & Problem Solving", [
              topic("csat-decision-scenarios", "Decision-Making Scenarios"),
              topic("csat-decision-problem", "Problem Solving"),
            ]),
          ],
        },
      ],
    },

    // ============================================================
    // MAINS
    // ============================================================
    {
      id: "mains",
      name: "Mains",
      stage: "mains",

      subjects: [
        // ---------------- ESSAY ----------------
        {
          id: "essay",
          name: "Essay",
          paper: "essay",

          topics: [
            topic("essay-philosophical", "Philosophical & Abstract Themes"),
            topic("essay-social", "Social Issues"),
            topic("essay-political", "Political & Governance Issues"),
            topic("essay-economic", "Economic Issues"),
            topic("essay-environment", "Environment & Climate"),
            topic("essay-science", "Science & Technology"),
            topic("essay-international", "International Relations"),
            topic("essay-education", "Education & Human Development"),
            topic("essay-ethics", "Ethics & Values"),
            topic("essay-structure", "Essay Structure & Coherence"),
            topic("essay-introduction", "Introduction Writing"),
            topic("essay-conclusion", "Conclusion Writing"),
          ],
        },

        // ---------------- GS1 ----------------
        {
          id: "gs1",
          name: "General Studies I",
          paper: "gs1",

          topics: [
            topic("gs1-indian-heritage", "Indian Heritage & Culture", [
              topic("gs1-indian-heritage-art", "Indian Art Forms"),
              topic("gs1-indian-heritage-literature", "Indian Literature"),
              topic("gs1-indian-heritage-architecture", "Architecture"),
              topic("gs1-indian-heritage-modern", "Modern Indian Culture"),
            ]),

            topic("gs1-history", "Modern Indian History", [
              topic("gs1-history-eighteenth", "Events from the 18th Century"),
              topic("gs1-history-nationalism", "Indian National Movement"),
              topic("gs1-history-leaders", "Important Leaders and Personalities"),
              topic("gs1-history-postindependence", "Post-Independence Consolidation"),
            ]),

            topic("gs1-world-history", "World History", [
              topic("gs1-world-history-industrial", "Industrial Revolution"),
              topic("gs1-world-history-worldwars", "World Wars"),
              topic("gs1-world-history-boundaries", "National Boundaries and Political Systems"),
              topic("gs1-world-history-colonialism", "Colonialism and Decolonization"),
              topic("gs1-world-history-ideologies", "Political Ideologies"),
            ]),

            topic("gs1-society", "Indian Society", [
              topic("gs1-society-diversity", "Salient Features of Indian Society"),
              topic("gs1-society-diversity", "Diversity of India"),
              topic("gs1-society-women", "Women and Women's Organisations"),
              topic("gs1-society-population", "Population and Associated Issues"),
              topic("gs1-society-poverty", "Poverty and Development"),
              topic("gs1-society-urbanization", "Urbanization"),
              topic("gs1-society-globalization", "Effects of Globalization"),
              topic("gs1-society-communalism", "Communalism"),
              topic("gs1-society-regionalism", "Regionalism"),
              topic("gs1-society-secularism", "Secularism"),
            ]),

            topic("gs1-geography", "Geography", [
              topic("gs1-geography-physical", "Physical Geography"),
              topic("gs1-geography-resources", "Distribution of Resources"),
              topic("gs1-geography-industries", "Location of Industries"),
              topic("gs1-geography-earth", "Important Geophysical Phenomena"),
              topic("gs1-geography-landforms", "Earthquakes and Tsunamis"),
              topic("gs1-geography-cyclones", "Cyclones"),
              topic("gs1-geography-volcanoes", "Volcanic Activity"),
            ]),
          ],
        },

        // ---------------- GS2 ----------------
        {
          id: "gs2",
          name: "General Studies II",
          paper: "gs2",

          topics: [
            topic("gs2-constitution", "Indian Constitution", [
              topic("gs2-constitution-evolution", "Historical Underpinnings"),
              topic("gs2-constitution-features", "Evolution and Features"),
              topic("gs2-constitution-amendments", "Significant Provisions"),
              topic("gs2-constitution-basic", "Basic Structure"),
            ]),

            topic("gs2-federalism", "Federalism", [
              topic("gs2-federalism-centrestate", "Centre-State Relations"),
              topic("gs2-federalism-devolution", "Devolution of Powers"),
              topic("gs2-federalism-local", "Local Government"),
              topic("gs2-federalism-challenges", "Federal Challenges"),
            ]),

            topic("gs2-parliament", "Parliament & Legislatures", [
              topic("gs2-parliament-function", "Parliamentary Functioning"),
              topic("gs2-parliament-privileges", "Privileges"),
              topic("gs2-parliament-committees", "Committees"),
              topic("gs2-parliament-representation", "Representation"),
            ]),

            topic("gs2-executive", "Executive & Judiciary", [
              topic("gs2-executive-president", "President and Governor"),
              topic("gs2-executive-council", "Council of Ministers"),
              topic("gs2-executive-judiciary", "Judiciary"),
              topic("gs2-executive-tribunals", "Tribunals"),
            ]),

            topic("gs2-constitutional-bodies", "Constitutional & Statutory Bodies", [
              topic("gs2-bodies-election", "Election Commission"),
              topic("gs2-bodies-upsc", "UPSC"),
              topic("gs2-bodies-finance", "Finance Commission"),
              topic("gs2-bodies-cag", "CAG"),
              topic("gs2-bodies-commissions", "Other Commissions"),
            ]),

            topic("gs2-governance", "Governance", [
              topic("gs2-governance-transparency", "Transparency"),
              topic("gs2-governance-accountability", "Accountability"),
              topic("gs2-governance-egovernance", "E-Governance"),
              topic("gs2-governance-citizen", "Citizen Charters"),
              topic("gs2-governance-civilservices", "Role of Civil Services"),
            ]),

            topic("gs2-socialjustice", "Social Justice", [
              topic("gs2-socialjustice-health", "Health"),
              topic("gs2-socialjustice-education", "Education"),
              topic("gs2-socialjustice-vulnerable", "Vulnerable Sections"),
              topic("gs2-socialjustice-welfare", "Welfare Schemes"),
              topic("gs2-socialjustice-ngos", "NGOs and Civil Society"),
            ]),

            topic("gs2-international", "International Relations", [
              topic("gs2-international-neighbours", "India and Its Neighbours"),
              topic("gs2-international-bilateral", "Bilateral Relations"),
              topic("gs2-international-regional", "Regional Groupings"),
              topic("gs2-international-global", "Global Groupings"),
              topic("gs2-international-diaspora", "Indian Diaspora"),
              topic("gs2-international-institutions", "International Institutions"),
            ]),
          ],
        },

        // ---------------- GS3 ----------------
        {
          id: "gs3",
          name: "General Studies III",
          paper: "gs3",

          topics: [
            topic("gs3-economy", "Indian Economy", [
              topic("gs3-economy-growth", "Growth and Development"),
              topic("gs3-economy-employment", "Employment"),
              topic("gs3-economy-inclusive", "Inclusive Growth"),
              topic("gs3-economy-budget", "Government Budgeting"),
              topic("gs3-economy-infrastructure", "Infrastructure"),
            ]),

            topic("gs3-agriculture", "Agriculture", [
              topic("gs3-agriculture-cropping", "Cropping Patterns"),
              topic("gs3-agriculture-irrigation", "Irrigation"),
              topic("gs3-agriculture-storage", "Storage and Transport"),
              topic("gs3-agriculture-marketing", "Agricultural Marketing"),
              topic("gs3-agriculture-technology", "Agricultural Technology"),
              topic("gs3-agriculture-subsidies", "Farm Subsidies"),
              topic("gs3-agriculture-pds", "Public Distribution System"),
              topic("gs3-agriculture-foodsecurity", "Food Security"),
              topic("gs3-agriculture-animal", "Animal Rearing"),
            ]),

            topic("gs3-science", "Science & Technology", [
              topic("gs3-science-achievements", "Developments and Applications"),
              topic("gs3-science-indigenization", "Indigenization of Technology"),
              topic("gs3-science-ict", "Information Technology"),
              topic("gs3-science-space", "Space Technology"),
              topic("gs3-science-biotech", "Biotechnology"),
              topic("gs3-science-nanotech", "Nanotechnology"),
              topic("gs3-science-ipr", "Intellectual Property Rights"),
            ]),

            topic("gs3-environment", "Environment", [
              topic("gs3-environment-conservation", "Environmental Conservation"),
              topic("gs3-environment-pollution", "Pollution"),
              topic("gs3-environment-impact", "Environmental Impact Assessment"),
              topic("gs3-environment-climate", "Climate Change"),
            ]),

            topic("gs3-disaster", "Disaster Management", [
              topic("gs3-disaster-management", "Disaster Management"),
              topic("gs3-disaster-risk", "Disaster Risk Reduction"),
              topic("gs3-disaster-institution", "Institutional Framework"),
              topic("gs3-disaster-resilience", "Resilience"),
            ]),

            topic("gs3-security", "Internal Security", [
              topic("gs3-security-extremism", "Extremism"),
              topic("gs3-security-border", "Border Management"),
              topic("gs3-security-cyber", "Cyber Security"),
              topic("gs3-security-money", "Money Laundering"),
              topic("gs3-security-organized", "Organized Crime"),
              topic("gs3-security-agency", "Security Agencies"),
            ]),
          ],
        },

        // ---------------- GS4 ----------------
        {
          id: "gs4",
          name: "General Studies IV",
          paper: "gs4",

          topics: [
            topic("gs4-ethics", "Ethics & Human Interface", [
              topic("gs4-ethics-meaning", "Essence of Ethics"),
              topic("gs4-ethics-determinants", "Determinants of Ethical Behaviour"),
              topic("gs4-ethics-consequences", "Consequences of Ethical Actions"),
            ]),

            topic("gs4-values", "Human Values", [
              topic("gs4-values-lessons", "Lessons from Lives and Teachings"),
              topic("gs4-values-family", "Role of Family and Society"),
              topic("gs4-values-education", "Value Education"),
            ]),

            topic("gs4-attitude", "Attitude", [
              topic("gs4-attitude-content", "Content and Structure of Attitude"),
              topic("gs4-attitude-function", "Functions of Attitude"),
              topic("gs4-attitude-influence", "Influence and Persuasion"),
            ]),

            topic("gs4-emotional", "Emotional Intelligence", [
              topic("gs4-emotional-concept", "Concept of Emotional Intelligence"),
              topic("gs4-emotional-administration", "Application in Administration"),
            ]),

            topic("gs4-thinkers", "Moral Thinkers & Philosophers", [
              topic("gs4-thinkers-indian", "Indian Thinkers"),
              topic("gs4-thinkers-western", "Western Thinkers"),
            ]),

            topic("gs4-publicservice", "Public Administration Ethics", [
              topic("gs4-publicservice-integrity", "Integrity"),
              topic("gs4-publicservice-impartiality", "Impartiality"),
              topic("gs4-publicservice-objectivity", "Objectivity"),
              topic("gs4-publicservice-empathy", "Empathy"),
              topic("gs4-publicservice-accountability", "Accountability"),
              topic("gs4-publicservice-transparency", "Transparency"),
            ]),

            topic("gs4-governance", "Probity in Governance", [
              topic("gs4-governance-transparency", "Transparency"),
              topic("gs4-governance-information", "Right to Information"),
              topic("gs4-governance-codes", "Codes of Ethics and Conduct"),
              topic("gs4-governance-corruption", "Corruption"),
              topic("gs4-governance-whistleblower", "Whistleblowing"),
            ]),

            topic("gs4-case-studies", "Case Studies", [
              topic("gs4-case-studies-administration", "Administrative Ethics"),
              topic("gs4-case-studies-conflict", "Conflict of Interest"),
              topic("gs4-case-studies-decision", "Ethical Decision Making"),
              topic("gs4-case-studies-governance", "Governance Dilemmas"),
            ]),
          ],
        },

        // ---------------- OPTIONAL ----------------
        {
          id: "optional",
          name: "Optional",
          paper: "optional",

          topics: [
            topic("optional-selection", "Optional Subject Selection"),
            topic("optional-paper1", "Optional Paper I"),
            topic("optional-paper2", "Optional Paper II"),
          ],
        },
      ],
    },
  ],
};