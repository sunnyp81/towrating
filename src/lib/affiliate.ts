const E = import.meta.env;

export function carGurusUrl(year: number, make: string, model: string): string {
  const aid = E.PUBLIC_CARGURUS_AFF_ID;
  const base = `https://www.cargurus.com/Cars/spt-listings?searchYear=${year}&searchMake=${encodeURIComponent(make)}&searchModel=${encodeURIComponent(model)}`;
  return aid ? `${base}&affiliate_id=${aid}` : base;
}

export function trueCarUrl(year: number, make: string, model: string): string {
  const aid = E.PUBLIC_TRUECAR_AFF_ID;
  const base = `https://www.truecar.com/used-cars-for-sale/listings/year-${year}/${encodeURIComponent(make.toLowerCase())}/${encodeURIComponent(model.toLowerCase())}/`;
  return aid ? `${base}?aff=${aid}` : base;
}

export function amazonHitchUrl(hitchClass: string | null): string {
  const tag = E.PUBLIC_AMAZON_TAG;
  const term = hitchClass ? `class+${hitchClass}+trailer+hitch` : 'trailer+hitch';
  const base = `https://www.amazon.com/s?k=${term}`;
  return tag ? `${base}&tag=${tag}` : base;
}

export function amazonBrakeControllerUrl(): string {
  const tag = E.PUBLIC_AMAZON_TAG;
  const base = `https://www.amazon.com/s?k=trailer+brake+controller`;
  return tag ? `${base}&tag=${tag}` : base;
}

export function eTrailerUrl(slug: string): string {
  const aid = E.PUBLIC_ETRAILER_AFF_ID;
  const base = `https://www.etrailer.com/${slug}`;
  return aid ? `${base}?aff=${aid}` : base;
}

export function carShieldUrl(): string {
  const aid = E.PUBLIC_CARSHIELD_AFF_ID;
  const base = `https://www.carshield.com/`;
  return aid ? `${base}?aff=${aid}` : base;
}

export function insuranceUrl(): string {
  const aid = E.PUBLIC_INSURANCE_AFF_ID;
  const base = `https://www.moneygeek.com/insurance/auto/`;
  return aid ? `${base}?aff=${aid}` : base;
}
