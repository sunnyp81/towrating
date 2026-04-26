import type { Trim, Year, Model } from './types.ts';

const SITE = 'https://towrating.net';

export function vehicleSchema(model: Model, year: Year, trim: Trim) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Vehicle',
    name: `${year.year} ${model.makeLabel} ${model.modelLabel} ${trim.trimLabel}`,
    brand: { '@type': 'Brand', name: model.makeLabel },
    model: model.modelLabel,
    modelDate: String(year.year),
    vehicleConfiguration: trim.drivetrain ?? undefined,
    fuelType: undefined,
    trailerWeight: trim.specs.maxTowLbs ? { '@type': 'QuantitativeValue', value: trim.specs.maxTowLbs, unitCode: 'LBR' } : undefined,
    weightTotal: trim.specs.gcwrLbs ? { '@type': 'QuantitativeValue', value: trim.specs.gcwrLbs, unitCode: 'LBR' } : undefined,
    payload: trim.specs.payloadLbs ? { '@type': 'QuantitativeValue', value: trim.specs.payloadLbs, unitCode: 'LBR' } : undefined,
  };
}

export function productSchema(model: Model, year: Year, trim: Trim, dealerUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${year.year} ${model.makeLabel} ${model.modelLabel} ${trim.trimLabel}`,
    brand: { '@type': 'Brand', name: model.makeLabel },
    offers: { '@type': 'Offer', url: dealerUrl, availability: 'https://schema.org/InStock' },
  };
}

export function breadcrumbList(items: Array<{ name: string; href: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: SITE + it.href,
    })),
  };
}

export function faqPage(qas: Array<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: qas.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

export function articleSchema({ title, description, slug, datePublished }: { title: string; description: string; slug: string; datePublished: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url: `${SITE}/guide/${slug}/`,
    datePublished,
    author: { '@type': 'Organization', name: 'towrating.net' },
    publisher: { '@type': 'Organization', name: 'towrating.net', url: SITE },
  };
}

export function howToSchema({ name, steps }: { name: string; steps: Array<{ name: string; text: string }> }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    step: steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.name, text: s.text })),
  };
}

export function itemListFromTrims(trims: Trim[], year: number, makeSlug: string, modelSlug: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: trims.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE}/${makeSlug}/${modelSlug}/${year}/${t.trimSlug}/`,
      name: t.trimLabel,
    })),
  };
}

export function collectionPage({ name, description, url }: { name: string; description: string; url: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: SITE + url,
  };
}
