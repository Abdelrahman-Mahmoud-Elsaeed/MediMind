/**
 * Drug Interactions Database — وفاء (Wafa)
 *
 * Curated database of common drug-drug interactions for chronic disease medications.
 * Covers: diabetes, hypertension, heart disease, cholesterol, thyroid.
 *
 * Each interaction has:
 *  - drugA, drugB: medication names (case-insensitive, partial match)
 *  - severity: 'mild' | 'moderate' | 'severe' | 'contraindicated'
 *  - description: Arabic description of the interaction
 *  - recommendation: What the patient/doctor should do
 *  - mechanism: How the interaction works (optional)
 *
 * In production, replace with a proper API like:
 *  - RxNorm (https://www.nlm.nih.gov/research/umls/rxnorm/)
 *  - OpenFDA (https://open.fda.gov/)
 *  - DrugBank (https://go.drugbank.com/)
 */

const interactions = [
  // ===== Diabetes medications =====
  {
    drugA: 'metformin',
    drugB: 'alcohol',
    severity: 'contraindicated',
    description: 'الكحول مع الميتفورمين بيزود خطر lactic acidosis (حمض اللاكتيك)',
    recommendation: 'تجنب الكحول تماماً أثناء أخذ الميتفورمين',
    mechanism: 'الكحول بيقلل clearance اللاكتيك وبيزود خطر التراكم'
  },
  {
    drugA: 'metformin',
    drugB: 'contrast dye',
    severity: 'contraindicated',
    description: 'الصبغة الإشعاعية (contrast) مع الميتفورمين ممكن تسبب فشل كلوي',
    recommendation: 'وقف الميتفورمين 48 ساعة قبل وبعد الفحص بالصبغة',
    mechanism: 'الصبغة ممكن تسبب nephrotoxicity مما يراكم الميتفورمين'
  },
  {
    drugA: 'glipizide',
    drugB: 'fluconazole',
    severity: 'severe',
    description: 'الفلوكونازول بيزيد تأثير الجليبيزيد ممكن يسبب نقص سكر حاد',
    recommendation: 'راقب سكر الدم عن قرب، ممكن تحتاج تقلل جرعة الجليبيزيد',
    mechanism: 'CYP2C9 inhibition يقلل metabolism الجليبيزيد'
  },
  {
    drugA: 'insulin',
    drugB: 'beta-blocker',
    severity: 'moderate',
    description: 'البيتا بلوكرز ممكن تخفي أعراض نقص السكر (hypoglycemia)',
    recommendation: 'راقب سكر الدم بانتظام، انتبه إن أعراض نقص السكر ممكن تكون مخفية',
    mechanism: 'البيتا بلوكرز بتمنع الـ epinephrine release اللي بيcause الأعراض'
  },
  {
    drugA: 'metformin',
    drugB: 'cimetidine',
    severity: 'moderate',
    description: 'السيميتيدين ممكن يزيد مستوى الميتفورمين في الدم',
    recommendation: 'استخدم famotidine بدلاً من cimetidine لو محتاج',
    mechanism: 'Competition for renal tubular secretion'
  },

  // ===== Hypertension medications =====
  {
    drugA: 'lisinopril',
    drugB: 'potassium supplement',
    severity: 'severe',
    description: 'الليسينوبريل مع مكملات البوتاسيوم ممكن يسبب hyperkalemia (ارتفاع البوتاسيوم)',
    recommendation: 'راقب مستوى البوتاسيوم بانتظام، تجنب مكملات البوتاسيوم بدون وصفة',
    mechanism: 'ACE inhibitors بيقلل إفراز البوتاسيوم'
  },
  {
    drugA: 'lisinopril',
    drugB: 'spironolactone',
    severity: 'severe',
    description: 'الليسينوبريل مع السبيرونولاكتون بيزيد خطر hyperkalemia بشكل كبير',
    recommendation: 'راقب البوتاسيوم كل أسبوع، فكر في بدائل',
    mechanism: 'الاتنين بيقللوا إفراز البوتاسيوم'
  },
  {
    drugA: 'amlodipine',
    drugB: 'grapefruit',
    severity: 'moderate',
    description: 'الجريب فروت بيزيد مستوى الأملوديبين ممكن يسبب انخفاض ضغط حاد',
    recommendation: 'تجنب الجريب فروت وعصيره أثناء أخذ الأملوديبين',
    mechanism: 'CYP3A4 inhibition in gut'
  },
  {
    drugA: 'atenolol',
    drugB: 'insulin',
    severity: 'moderate',
    description: 'الأتينولول ممكن يخفي أعراض نقص السكر',
    recommendation: 'راقب سكر الدم بانتظام',
    mechanism: 'Beta-blockade يخفي الأعراض'
  },
  {
    drugA: 'hydrochlorothiazide',
    drugB: 'lisinopril',
    severity: 'mild',
    description: 'التزامن شائع وآمن، لكن ممكن يسبب انخفاض ضغط عند الوقوف',
    recommendation: 'انتبه عند الوقوف فجأة، اشرب مية كفاية',
    mechanism: 'Additive hypotensive effect'
  },

  // ===== Statins (cholesterol) =====
  {
    drugA: 'simvastatin',
    drugB: 'grapefruit',
    severity: 'severe',
    description: 'الجريب فروت بيزيد مستوى السيمفاستاتين بشكل كبير ممكن يسبب muscle damage',
    recommendation: 'تجنب الجريب فروت تماماً مع السيمفاستاتين',
    mechanism: 'CYP3A4 inhibition'
  },
  {
    drugA: 'simvastatin',
    drugB: 'clarithromycin',
    severity: 'contraindicated',
    description: 'الكلاريثرومايسين بيزيد مستوى السيمفاستاتين ممكن يسبب rhabdomyolysis',
    recommendation: 'وقف السيمفاستاتين أثناء العلاج بالكلاريثرومايسين',
    mechanism: 'Strong CYP3A4 inhibition'
  },
  {
    drugA: 'atorvastatin',
    drugB: 'clarithromycin',
    severity: 'severe',
    description: 'الكلاريثرومايسين بيزيد مستوى الأتورفاستاتين',
    recommendation: 'فكر في وقف مؤقت للأتورفاستاتين أو استبدال المضاد الحيوي',
    mechanism: 'CYP3A4 inhibition'
  },
  {
    drugA: 'rosuvastatin',
    drugB: 'cyclosporine',
    severity: 'contraindicated',
    description: 'السيكلوسبورين بيزيد مستوى الكرونفاستاتين بشكل كبير',
    recommendation: 'تجنب الجمع بينهم',
    mechanism: 'OATP1B1 inhibition'
  },
  {
    drugA: 'statin',
    drugB: 'fibrate',
    severity: 'severe',
    description: 'الستاتين مع الفايبرات بيزيد خطر muscle damage (rhabdomyolysis)',
    recommendation: 'استخدم بحذر شديد، راقب CPK levels',
    mechanism: 'Additive myopathy risk'
  },

  // ===== Warfarin (blood thinner) =====
  {
    drugA: 'warfarin',
    drugB: 'aspirin',
    severity: 'severe',
    description: 'الوارفارين مع الأسبرين بيزيد خطر النزيف بشكل كبير',
    recommendation: 'تجنب الجمع إلا تحت إشراف طبي مباشر، راقب INR',
    mechanism: 'Additive anticoagulant effect'
  },
  {
    drugA: 'warfarin',
    drugB: 'ibuprofen',
    severity: 'severe',
    description: 'الإيبوبروفين مع الوارفارين بيزيد خطر النزيف المعوي',
    recommendation: 'تجنب NSAIDs، استخدم paracetamol بدلاً منها',
    mechanism: 'NSAIDs تؤثر على platelets وتسبب GI irritation'
  },
  {
    drugA: 'warfarin',
    drugB: 'amiodarone',
    severity: 'severe',
    description: 'الأميودارون بيزيد تأثير الوارفارين بشكل كبير',
    recommendation: 'قلل جرعة الوارفارين 30-50% عند بدء الأميودارون',
    mechanism: 'CYP2C9 inhibition'
  },
  {
    drugA: 'warfarin',
    drugB: 'cranberry',
    severity: 'moderate',
    description: 'التوت البري ممكن يزيد تأثير الوارفارين',
    recommendation: 'تجنب كميات كبيرة من التوت البري وعصيره',
    mechanism: 'Possible CYP inhibition'
  },

  // ===== Thyroid medications =====
  {
    drugA: 'levothyroxine',
    drugB: 'calcium supplement',
    severity: 'moderate',
    description: 'الكالسيوم بيقلل امتصاص الل-equippedيروكسين',
    recommendation: 'خذ الكالسيوم 4 ساعات على الأقل بعد الل-equippedيروكسين',
    mechanism: 'Decreased absorption'
  },
  {
    drugA: 'levothyroxine',
    drugB: 'iron supplement',
    severity: 'moderate',
    description: 'الحديد بيقلل امتصاص الل-equippedيروكسين',
    recommendation: 'خذ الحديد 4 ساعات على الأقل بعد الل-equippedيروكسين',
    mechanism: 'Decreased absorption'
  },
  {
    drugA: 'levothyroxine',
    drugB: 'esomeprazole',
    severity: 'mild',
    description: 'مثبطات الحموضة ممكن تقلل امتصاص الل-equippedيروكسين',
    recommendation: 'راقب وظيفة الغدة الدرقية، ممكن تحتاج جرعة أعلى',
    mechanism: 'Increased gastric pH'
  },

  // ===== Common OTC interactions =====
  {
    drugA: 'ssri',
    drugB: 'tramadol',
    severity: 'severe',
    description: 'SSRI مع الترامادول ممكن يسبب serotonin syndrome',
    recommendation: 'تجنب الجمع، استشار الطبيب فوراً لو ظهرت أعراض',
    mechanism: 'Additive serotonin effect'
  },
  {
    drugA: 'maoi',
    drugB: 'ssri',
    severity: 'contraindicated',
    description: 'MAOI مع SSRI ممكن يسبب serotonin syndrome قاتل',
    recommendation: 'ممنوع الجمع — لازم 14 يوم فاصل بينهم',
    mechanism: 'Dangerous serotonin accumulation'
  },
  {
    drugA: 'metformin',
    drugB: 'nsaid',
    severity: 'moderate',
    description: 'الـ NSAIDs ممكن تزيد خطر فشل الكلى مع الميتفورمين',
    recommendation: 'استخدم بحذر، اشرب مية كفاية، راقب وظائف الكلى',
    mechanism: 'Additive nephrotoxicity risk'
  }
];

/**
 * Find interactions for a given medication
 * @param {String} drugName - Drug name to check
 * @returns {Array} All interactions involving this drug
 */
function findInteractionsForDrug(drugName) {
  const name = drugName.toLowerCase().trim();
  return interactions.filter(i =>
    i.drugA.includes(name) || name.includes(i.drugA) ||
    i.drugB.includes(name) || name.includes(i.drugB)
  );
}

/**
 * Find interactions between two specific drugs
 * @param {String} drugA - First drug name
 * @param {String} drugB - Second drug name
 * @returns {Array} Matching interactions
 */
function findInteractionsBetween(drugA, drugB) {
  const a = drugA.toLowerCase().trim();
  const b = drugB.toLowerCase().trim();

  return interactions.filter(i => {
    const matchesA = i.drugA.includes(a) || a.includes(i.drugA) ||
                     i.drugB.includes(a) || a.includes(i.drugB);
    const matchesB = i.drugA.includes(b) || b.includes(i.drugA) ||
                     i.drugB.includes(b) || b.includes(i.drugB);
    return matchesA && matchesB;
  });
}

/**
 * Check all interactions for a list of medications
 * @param {Array<String>} drugNames - Array of drug names
 * @returns {Array} All interactions found
 */
function checkAllInteractions(drugNames) {
  const found = [];
  const seen = new Set();

  for (let i = 0; i < drugNames.length; i++) {
    for (let j = i + 1; j < drugNames.length; j++) {
      const interactions = findInteractionsBetween(drugNames[i], drugNames[j]);
      interactions.forEach(interaction => {
        const key = `${interaction.drugA}-${interaction.drugB}-${interaction.severity}`;
        if (!seen.has(key)) {
          seen.add(key);
          found.push({
            ...interaction,
            drugAName: drugNames[i],
            drugBName: drugNames[j]
          });
        }
      });
    }
  }

  return found;
}

/**
 * Get severity score (higher = more severe)
 */
function getSeverityScore(severity) {
  const scores = {
    'mild': 1,
    'moderate': 2,
    'severe': 3,
    'contraindicated': 4
  };
  return scores[severity] || 0;
}

module.exports = {
  interactions,
  findInteractionsForDrug,
  findInteractionsBetween,
  checkAllInteractions,
  getSeverityScore
};
