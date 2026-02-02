export type ModalType = 'none' | 'wechat' | 'github' | 'email' | 'rss' | 'sitemap' | 'friend' | 'profile';

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
  color: string;
  bgColor: string;
  desc: string;
  isGitHub?: boolean;
  isEmail?: boolean;
  isQR?: boolean;
  isRSS?: boolean;
  isSitemap?: boolean;
}

export interface Friend {
  name: string;
  url: string;
  desc: string;
  avatar: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TRANSITION = {
  type: 'spring',
  stiffness: 260,
  damping: 20,
} as const;
