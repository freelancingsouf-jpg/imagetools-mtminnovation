import type { ComponentType } from 'react';
import { FileText, Image as ImageIcon, Receipt, Globe } from 'lucide-react';

export type MtmAppId = 'easypdf' | 'imagetools' | 'mtmproforma' | 'mtminnovation';

export interface MtmApp {
  id: MtmAppId;
  name: string;
  url: string;
  isCurrent: boolean;
  icon: ComponentType<{ className?: string }>;
  color: {
    text: string;
    bg: string;
    border: string;
    gradient: string;
    badge: string;
    hoverBg: string;
  };
  translationKey: string;
}

export const CURRENT_PROJECT_ID = 'imagetools';

export const isCurrentProject = (id: string): boolean => {
  if (id === CURRENT_PROJECT_ID) return true;
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    if (host.includes('imagetools') || host === 'localhost' || host === '127.0.0.1') {
      return id === 'imagetools';
    }
  }
  return false;
};

export const MTM_APPS_RAW: Omit<MtmApp, 'isCurrent'>[] = [
  {
    id: 'easypdf',
    name: 'EasyPDF',
    url: 'https://easypdf-mtminnovation.pages.dev',
    icon: FileText,
    color: {
      text: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      gradient: 'from-rose-500 to-red-600',
      badge: 'bg-rose-100 text-rose-700',
      hoverBg: 'hover:border-rose-300 hover:bg-rose-50/50',
    },
    translationKey: 'ecosystem.apps.easypdf',
  },
  {
    id: 'imagetools',
    name: 'ImageTools',
    url: 'https://imagetools-mtminnovation.pages.dev',
    icon: ImageIcon,
    color: {
      text: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/20',
      gradient: 'from-primary to-secondary',
      badge: 'bg-primary/10 text-primary',
      hoverBg: 'hover:border-primary/40 hover:bg-primary/5',
    },
    translationKey: 'ecosystem.apps.imagetools',
  },
  {
    id: 'mtmproforma',
    name: 'MTM Proforma',
    url: 'https://proforma-mtminnovation.pages.dev',
    icon: Receipt,
    color: {
      text: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      gradient: 'from-emerald-500 to-teal-600',
      badge: 'bg-emerald-100 text-emerald-700',
      hoverBg: 'hover:border-emerald-300 hover:bg-emerald-50/50',
    },
    translationKey: 'ecosystem.apps.mtmproforma',
  },
  {
    id: 'mtminnovation',
    name: 'MTM Innovation',
    url: 'https://mtm-innovation.pages.dev',
    icon: Globe,
    color: {
      text: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      gradient: 'from-indigo-600 to-purple-600',
      badge: 'bg-indigo-100 text-indigo-700',
      hoverBg: 'hover:border-indigo-300 hover:bg-indigo-50/50',
    },
    translationKey: 'ecosystem.apps.mtminnovation',
  },
];

export const getMtmApps = (): MtmApp[] => {
  return MTM_APPS_RAW.map((app) => ({
    ...app,
    isCurrent: isCurrentProject(app.id),
  }));
};

export const getOtherMtmApps = (): MtmApp[] => {
  return getMtmApps().filter((app) => !app.isCurrent);
};
