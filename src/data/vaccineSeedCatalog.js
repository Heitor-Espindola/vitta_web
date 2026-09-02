const sourceName = 'Calendário Nacional de Vacinação / PNI';
const sourceUrl = 'https://www.gov.br/saude/pt-br/vacinacao/calendario';
const sourceUpdatedAt = '2026-07-29T00:00:00.000Z';
const calendarVersion = 'Catálogo Vitta — referência PNI consultada em 2026';

function vaccine({
  id,
  name,
  shortName,
  description,
  recommendedAge,
  doseCount,
  intervalDays = 0,
  prevents,
  targetGroups,
  doseSchedule,
}) {
  return Object.freeze({
    id,
    name,
    shortName,
    description,
    recommendedAge,
    doseCount,
    intervalDays,
    prevents,
    targetGroups,
    doseSchedule,
    expectedReactions: [],
    warningSigns: [],
    contraindications: [],
    sourceName,
    sourceUrl,
    sourceUpdatedAt,
    calendarVersion,
    active: true,
  });
}

export const vaccineSeedCatalog = Object.freeze([
  vaccine({ id: 'bcg', name: 'BCG', shortName: 'BCG', description: 'Proteção contra formas graves e disseminadas da tuberculose.', recommendedAge: 'Ao nascer', doseCount: 1, prevents: ['Formas graves da tuberculose'], targetGroups: ['Crianças'], doseSchedule: ['Dose única ao nascer'] }),
  vaccine({ id: 'hepatite_b', name: 'Hepatite B', shortName: 'HB', description: 'Vacina para prevenção das hepatites B e D.', recommendedAge: 'Ao nascer e conforme histórico vacinal', doseCount: 3, prevents: ['Hepatite B', 'Hepatite D'], targetGroups: ['Todas as fases da vida'], doseSchedule: ['Dose ao nascer', 'Completar esquema conforme histórico'] }),
  vaccine({ id: 'pentavalente', name: 'Pentavalente', shortName: 'Penta', description: 'Combina proteção contra difteria, tétano, coqueluche, Haemophilus influenzae b e hepatite B.', recommendedAge: 'Primeiro ano de vida', doseCount: 3, intervalDays: 60, prevents: ['Difteria', 'Tétano', 'Coqueluche', 'Haemophilus influenzae b', 'Hepatite B'], targetGroups: ['Crianças'], doseSchedule: ['Série primária conforme calendário infantil'] }),
  vaccine({ id: 'vip', name: 'Poliomielite inativada (VIP)', shortName: 'VIP', description: 'Proteção contra poliomielite com vacina inativada.', recommendedAge: 'Infância', doseCount: 4, intervalDays: 60, prevents: ['Poliomielite'], targetGroups: ['Crianças'], doseSchedule: ['Série primária e reforço conforme calendário infantil'] }),
  vaccine({ id: 'rotavirus', name: 'Rotavírus humano', shortName: 'Rotavírus', description: 'Proteção contra gastroenterite causada por rotavírus.', recommendedAge: 'Lactentes, respeitando limites de idade', doseCount: 2, intervalDays: 60, prevents: ['Gastroenterite por rotavírus'], targetGroups: ['Crianças'], doseSchedule: ['Duas doses conforme calendário infantil'] }),
  vaccine({ id: 'pneumo_10', name: 'Pneumocócica 10-valente', shortName: 'VPC10', description: 'Vacina conjugada contra doenças causadas por sorotipos do pneumococo.', recommendedAge: 'Infância e situações indicadas', doseCount: 3, intervalDays: 60, prevents: ['Doenças pneumocócicas invasivas'], targetGroups: ['Crianças', 'Grupos especiais'], doseSchedule: ['Esquema conforme idade e recomendação vigente'] }),
  vaccine({ id: 'meningo_c', name: 'Meningocócica C', shortName: 'MenC', description: 'Proteção contra doença meningocócica do sorogrupo C.', recommendedAge: 'Infância, conforme calendário vigente', doseCount: 3, intervalDays: 60, prevents: ['Doença meningocócica C'], targetGroups: ['Crianças'], doseSchedule: ['Esquema conforme idade e histórico'] }),
  vaccine({ id: 'meningo_acwy', name: 'Meningocócica ACWY', shortName: 'MenACWY', description: 'Proteção contra doença meningocócica dos sorogrupos A, C, W e Y.', recommendedAge: 'Adolescentes e grupos indicados', doseCount: 1, prevents: ['Doença meningocócica A, C, W e Y'], targetGroups: ['Adolescentes', 'Grupos especiais'], doseSchedule: ['Dose conforme faixa etária e histórico'] }),
  vaccine({ id: 'febre_amarela', name: 'Febre Amarela', shortName: 'FA', description: 'Proteção contra febre amarela.', recommendedAge: 'A partir da infância, conforme indicação e histórico', doseCount: 1, prevents: ['Febre amarela'], targetGroups: ['Crianças', 'Adolescentes', 'Adultos', 'Idosos conforme avaliação'], doseSchedule: ['Esquema conforme idade e histórico vacinal'] }),
  vaccine({ id: 'triplice_viral', name: 'Tríplice Viral', shortName: 'SCR', description: 'Proteção contra sarampo, caxumba e rubéola.', recommendedAge: 'A partir da infância, conforme histórico', doseCount: 2, intervalDays: 30, prevents: ['Sarampo', 'Caxumba', 'Rubéola'], targetGroups: ['Crianças', 'Adolescentes', 'Adultos'], doseSchedule: ['Uma ou duas doses conforme idade e histórico'] }),
  vaccine({ id: 'tetraviral', name: 'Tetraviral', shortName: 'SCRV', description: 'Combina proteção contra sarampo, caxumba, rubéola e varicela.', recommendedAge: 'Infância', doseCount: 1, prevents: ['Sarampo', 'Caxumba', 'Rubéola', 'Varicela'], targetGroups: ['Crianças'], doseSchedule: ['Dose conforme calendário infantil'] }),
  vaccine({ id: 'varicela', name: 'Varicela', shortName: 'Varicela', description: 'Proteção contra varicela.', recommendedAge: 'Infância e grupos indicados', doseCount: 2, intervalDays: 30, prevents: ['Varicela'], targetGroups: ['Crianças', 'Grupos especiais'], doseSchedule: ['Esquema conforme idade e histórico'] }),
  vaccine({ id: 'hepatite_a', name: 'Hepatite A', shortName: 'HA', description: 'Proteção contra hepatite A.', recommendedAge: 'Infância e situações indicadas', doseCount: 1, prevents: ['Hepatite A'], targetGroups: ['Crianças', 'Grupos especiais'], doseSchedule: ['Dose conforme calendário infantil'] }),
  vaccine({ id: 'dtp', name: 'Tríplice bacteriana (DTP)', shortName: 'DTP', description: 'Proteção contra difteria, tétano e coqueluche.', recommendedAge: 'Infância', doseCount: 2, prevents: ['Difteria', 'Tétano', 'Coqueluche'], targetGroups: ['Crianças'], doseSchedule: ['Reforços conforme calendário infantil'] }),
  vaccine({ id: 'dt', name: 'Dupla adulto (dT)', shortName: 'dT', description: 'Proteção contra difteria e tétano.', recommendedAge: 'Adolescentes e adultos, conforme histórico', doseCount: 3, intervalDays: 60, prevents: ['Difteria', 'Tétano'], targetGroups: ['Adolescentes', 'Adultos', 'Idosos'], doseSchedule: ['Completar esquema e reforços conforme histórico'] }),
  vaccine({ id: 'dtpa', name: 'Tríplice bacteriana acelular do adulto (dTpa)', shortName: 'dTpa', description: 'Proteção contra difteria, tétano e coqueluche em grupos indicados.', recommendedAge: 'Gestantes e grupos indicados', doseCount: 1, prevents: ['Difteria', 'Tétano', 'Coqueluche'], targetGroups: ['Gestantes', 'Profissionais e grupos indicados'], doseSchedule: ['Dose conforme condição e histórico'] }),
  vaccine({ id: 'hpv', name: 'HPV', shortName: 'HPV', description: 'Proteção contra tipos de papilomavírus humano associados a doenças e cânceres.', recommendedAge: 'Crianças, adolescentes e grupos indicados', doseCount: 1, prevents: ['Infecções e doenças associadas ao HPV'], targetGroups: ['Crianças', 'Adolescentes', 'Grupos especiais'], doseSchedule: ['Esquema conforme faixa etária e condição clínica'] }),
  vaccine({ id: 'influenza', name: 'Influenza', shortName: 'Gripe', description: 'Proteção sazonal contra influenza.', recommendedAge: 'Conforme estratégia anual e grupos indicados', doseCount: 1, prevents: ['Influenza'], targetGroups: ['Crianças', 'Gestantes', 'Adultos', 'Idosos', 'Grupos prioritários'], doseSchedule: ['Dose conforme campanha e calendário vigente'] }),
  vaccine({ id: 'covid_19', name: 'COVID-19', shortName: 'COVID-19', description: 'Proteção contra formas graves de COVID-19, conforme produto e grupo recomendado.', recommendedAge: 'Conforme idade, condição e histórico', doseCount: 1, prevents: ['Formas graves de COVID-19'], targetGroups: ['Crianças', 'Gestantes', 'Idosos', 'Grupos especiais'], doseSchedule: ['Esquema conforme produto, grupo e histórico'] }),
]);

export const vaccineSeedFields = Object.freeze(
  Object.keys(vaccineSeedCatalog[0]),
);

function comparableValue(value) {
  if (value?.toDate) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return value;
}

export function hasOnlySeedFields(data = {}) {
  const allowed = new Set([...vaccineSeedFields, 'createdAt', 'updatedAt']);
  return Object.keys(data).every((key) => allowed.has(key));
}

export function vaccineNeedsUpdate(existing, desired) {
  if (!hasOnlySeedFields(existing)) return false;
  return vaccineSeedFields.some(
    (key) => JSON.stringify(comparableValue(existing[key])) !==
      JSON.stringify(comparableValue(desired[key])),
  );
}

export function planVaccineSeed(existingById = new Map()) {
  return vaccineSeedCatalog.map((entry) => {
    const existing = existingById.get(entry.id);
    if (!existing) return { id: entry.id, action: 'create' };
    if (!hasOnlySeedFields(existing)) return { id: entry.id, action: 'skip' };
    return {
      id: entry.id,
      action: vaccineNeedsUpdate(existing, entry) ? 'update' : 'unchanged',
    };
  });
}
