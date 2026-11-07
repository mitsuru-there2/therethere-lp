export const locales = ['en', 'ja'] as const;
export type Locale = (typeof locales)[number];

export const pagePaths = {
  home: '/',
  recorder: '/recorder',
  checklist: '/checklist',
  recorderPrivacy: '/recorder/privacy',
  checklistPrivacy: '/checklist/privacy',
  sitePrivacy: '/site-privacy',
} as const;

export type PagePath = (typeof pagePaths)[keyof typeof pagePaths];

export type BreakKind = 'mobile' | 'desktop' | 'always';

export type TextPart =
  | string
  | { readonly br: BreakKind }
  | { readonly href: string; readonly label: string; readonly external?: boolean; readonly newTab?: string };

export interface HomeWork {
  readonly id: 'kaiju' | 'recorder' | 'checklist';
  readonly name: string;
  readonly href: string;
  readonly external?: boolean;
  readonly mediaLabel: string;
  readonly newTab?: string;
  readonly category: string;
  readonly description: readonly TextPart[];
  readonly imageAlts: readonly [string] | readonly [string, string];
  readonly store?: {
    readonly href?: string;
    readonly label: string;
    readonly newTab?: string;
  };
}

export interface Frame {
  readonly src: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
}

export interface ProductCopy {
  readonly metaTitle: string;
  readonly metaDescription: string;
  readonly name: string;
  readonly tagline: readonly TextPart[];
  readonly lead: readonly TextPart[];
  readonly posterAlt: string;
  readonly poster: { readonly src: string; readonly width: number; readonly height: number };
  readonly storeHref?: string;
  readonly storeLabel: string;
  readonly compatibility: string;
  readonly storyTitle: string;
  readonly storyLabel: string;
  readonly prevLabel: string;
  readonly nextLabel: string;
  readonly frames: readonly Frame[];
  readonly featuresTitle: string;
  readonly features: readonly { readonly number: string; readonly title: string; readonly description: string }[];
  readonly featureNote: string;
  readonly privacyPath: PagePath;
  readonly privacyLabel: string;
  readonly faqLabel: string;
  readonly faqs: readonly { readonly q: string; readonly a: string }[];
  readonly closeTitle: string;
  readonly supportLabel: string;
}

export type LegalBlock =
  | { readonly p: readonly TextPart[] }
  | { readonly ul: readonly string[] };

export interface LegalCopy {
  readonly metaTitle: string;
  readonly metaDescription: string;
  readonly label: string;
  readonly title: string;
  readonly updated: string;
  readonly sections: readonly { readonly heading?: string; readonly blocks: readonly LegalBlock[] }[];
  readonly backHref: string;
  readonly backLabel: string;
  readonly backArrow?: boolean;
}

export interface SiteCopy {
  readonly chrome: {
    readonly skip: string;
    readonly homeLabel: string;
    readonly navLabel: string;
    readonly languageLabel: string;
    readonly footerRecorder: string;
    readonly footerChecklist: string;
    readonly footerSite: string;
    readonly notFoundTitle: string;
    readonly notFoundDescription: string;
    readonly notFoundLabel: string;
    readonly notFoundHeading: string;
    readonly notFoundBody: string;
    readonly notFoundHome: string;
  };
  readonly contact: {
    readonly intro: readonly TextPart[];
    readonly name: string;
    readonly email: string;
    readonly company: string;
    readonly inquiry: string;
    readonly message: string;
    readonly required: string;
    readonly optional: string;
    readonly placeholder: string;
    readonly honeypot: string;
    readonly consent: readonly TextPart[];
    readonly submit: string;
    readonly sending: string;
    readonly success: string;
    readonly error: string;
    readonly noscript: string;
  };
  readonly home: {
    readonly metaTitle: string;
    readonly metaDescription: string;
    readonly heroTagline: readonly TextPart[];
    readonly heroDescription: string;
    readonly worksAria: string;
    readonly about: readonly (readonly TextPart[])[];
    readonly works: readonly HomeWork[];
    readonly developerTitle: string;
    readonly developerAlt: string;
    readonly developerLead: readonly TextPart[];
    readonly developerBody: readonly TextPart[];
  };
  readonly recorder: ProductCopy;
  readonly checklist: ProductCopy;
  readonly recorderPrivacy: LegalCopy;
  readonly checklistPrivacy: LegalCopy;
  readonly sitePrivacy: LegalCopy;
}
