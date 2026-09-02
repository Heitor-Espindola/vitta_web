import { describe, expect, it } from 'vitest';
import {
  planVaccineSeed,
  vaccineSeedCatalog,
  vaccineSeedFields,
} from './vaccineSeedCatalog';

describe('seed controlado do catálogo de vacinas', () => {
  it('possui 19 IDs estáveis, únicos e fonte oficial identificada', () => {
    const ids = vaccineSeedCatalog.map((vaccine) => vaccine.id);
    expect(vaccineSeedCatalog).toHaveLength(19);
    expect(new Set(ids).size).toBe(19);
    expect(ids).toEqual(expect.arrayContaining([
      'bcg', 'hepatite_b', 'pentavalente', 'vip', 'rotavirus',
      'pneumo_10', 'meningo_c', 'meningo_acwy', 'febre_amarela',
      'triplice_viral', 'tetraviral', 'varicela', 'hepatite_a',
      'dtp', 'dt', 'dtpa', 'hpv', 'influenza', 'covid_19',
    ]));
    expect(vaccineSeedCatalog.every((vaccine) =>
      vaccine.sourceName.includes('PNI') && vaccine.active,
    )).toBe(true);
  });

  it('planeja criação em banco vazio e fica idempotente após a primeira carga', () => {
    expect(planVaccineSeed().every(({ action }) => action === 'create')).toBe(true);
    const existing = new Map(vaccineSeedCatalog.map((entry) => [
      entry.id,
      { ...entry, createdAt: new Date(), updatedAt: new Date() },
    ]));
    expect(planVaccineSeed(existing).every(({ action }) => action === 'unchanged')).toBe(true);
  });

  it('atualiza apenas campos seguros e preserva documentos com schema externo', () => {
    const changed = { ...vaccineSeedCatalog[0], description: 'valor antigo' };
    const external = { ...vaccineSeedCatalog[1], campoExterno: true };
    const plan = planVaccineSeed(new Map([
      ['bcg', changed],
      ['hepatite_b', external],
    ]));
    expect(plan.find(({ id }) => id === 'bcg')?.action).toBe('update');
    expect(plan.find(({ id }) => id === 'hepatite_b')?.action).toBe('skip');
    expect(vaccineSeedFields).not.toContain('createdAt');
  });
});
