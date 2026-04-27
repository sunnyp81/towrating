export function buildModelSlug(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function mergeTrim(hero, wiki) {
  if (hero) {
    return {
      specs: { ...hero.specs },
      source: 'hero-curated',
      sourceUrl: null,
    };
  }
  if (wiki && wiki.specs) {
    return {
      specs: { ...wiki.specs },
      source: 'wikipedia',
      sourceUrl: wiki.wikiUrl ?? null,
    };
  }
  return {
    specs: { maxTowLbs: null, payloadLbs: null, gcwrLbs: null, tongueWeightLbs: null, hitchClass: null },
    source: 'vpic-only',
    sourceUrl: null,
  };
}
