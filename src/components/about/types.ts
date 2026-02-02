export type ModalType = 'none' | 'wechat' | 'github' | 'email' | 'rss' | 'sitemap' | 'friend' | 'profile';

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
  color: string;
  bgColor: string;
  desc: string;
  modalType?: ModalType;
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
