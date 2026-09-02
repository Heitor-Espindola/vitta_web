export const vaccineCatalogCapabilities = Object.freeze({
  canCreate: false,
  canUpdate: false,
  canDelete: false,
});

export function searchVaccines(vaccines = [], search = "", filter = "all") {
  const term = search.trim().toLocaleLowerCase("pt-BR");
  return vaccines.filter((vaccine) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && vaccine.active === true) ||
      (filter === "inactive" && vaccine.active === false);
    const matchesSearch =
      !term ||
      [vaccine.name, vaccine.shortName, vaccine.description]
        .filter(Boolean)
        .some((value) =>
          String(value).toLocaleLowerCase("pt-BR").includes(term),
        );
    return matchesFilter && matchesSearch;
  });
}

export function vaccineCatalogViewState({
  loading = false,
  error = "",
  vaccines = [],
  filtered = [],
}) {
  if (loading) return "loading";
  if (error) return "error";
  if (vaccines.length === 0) return "empty";
  if (filtered.length === 0) return "no-results";
  return "ready";
}

export function nextCatalogRetryVersion(currentVersion = 0) {
  return currentVersion + 1;
}
