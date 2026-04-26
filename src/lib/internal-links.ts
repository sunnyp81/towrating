export interface SpokeLinkContext {
  makeSlug: string;
  modelSlug: string;
  year: number;
  trimSlug?: string;
  maxTowLbs: number;
  vehicleClass: string;
  siblings: {
    sameYearTrims: string[];
    prevYear: number | null;
    nextYear: number | null;
    sameMakeClass: string[];
  };
  bracketLbs: number;
  contextualGuide: string;
}

export interface InternalLink {
  href: string;
  label: string;
  rel?: string;
}

export function buildSpokeLinks(ctx: SpokeLinkContext): InternalLink[] {
  const links: InternalLink[] = [];
  const base = `/${ctx.makeSlug}/${ctx.modelSlug}/${ctx.year}`;

  for (const t of ctx.siblings.sameYearTrims.slice(0, 2)) {
    links.push({ href: `${base}/${t}/`, label: `${ctx.year} sibling trim ${t.replace(/-/g, ' ')}` });
  }
  if (ctx.siblings.prevYear) links.push({ href: `/${ctx.makeSlug}/${ctx.modelSlug}/${ctx.siblings.prevYear}/`, label: `${ctx.siblings.prevYear} model` });
  if (ctx.siblings.nextYear) links.push({ href: `/${ctx.makeSlug}/${ctx.modelSlug}/${ctx.siblings.nextYear}/`, label: `${ctx.siblings.nextYear} model` });

  for (const m of ctx.siblings.sameMakeClass.slice(0, 3)) {
    links.push({ href: `/${ctx.makeSlug}/${m}/`, label: `${ctx.makeSlug} ${m.replace(/-/g, ' ')}` });
  }
  links.push({ href: `/tow-by-capacity/${ctx.bracketLbs}/`, label: `${ctx.bracketLbs.toLocaleString()} lbs towing` });
  links.push({ href: `/guide/${ctx.contextualGuide}/`, label: 'Towing guide' });
  links.push({ href: `/guide/weight-distribution-hitches/`, label: 'Weight-distribution hitches' });
  links.push({ href: `/guide/brake-controllers-explained/`, label: 'Brake controllers explained' });

  return links;
}
