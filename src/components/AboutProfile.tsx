import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { EMAIL_ENCODED } from '@/consts';
import { type GitHubStats, getGitHubStats } from '@/lib/github';
import { base64Decode } from '@/lib/helper';
import { useBodyScrollLock, useHaptic } from '@/lib/hooks';
import FriendLinkItem from './about/FriendLinkItem';
import EmailModal from './about/modals/EmailModal';
import FriendModal from './about/modals/FriendModal';
import GitHubModal from './about/modals/GitHubModal';
import ProfileModal from './about/modals/ProfileModal';
import RSSModal from './about/modals/RSSModal';
import SitemapModal from './about/modals/SitemapModal';
import WeChatModal from './about/modals/WeChatModal';
import ProfileCard from './about/ProfileCard';
import SocialLinkItem from './about/SocialLinkItem';
import type { Friend, ModalType, SocialLink } from './about/types';

const socialLinks: SocialLink[] = [
  {
    name: 'GitHub',
    url: 'https://github.com/coderfee',
    icon: 'tabler:brand-github',
    color: 'text-[#181717] dark:text-zinc-100',
    bgColor: 'bg-[#181717]/[0.03] dark:bg-white/[0.05] hover:bg-[#181717]/[0.06] dark:hover:bg-white/[0.08]',
    desc: '我的开源项目',
    modalType: 'github',
  },
  {
    name: 'X',
    url: 'https://x.com/coderfee',
    icon: 'tabler:brand-x',
    color: 'text-zinc-900 dark:text-zinc-100',
    bgColor: 'bg-zinc-900/[0.03] dark:bg-white/[0.05] hover:bg-zinc-900/[0.06] dark:hover:bg-white/[0.08]',
    desc: '碎碎念与日常',
  },
  {
    name: 'Email',
    url: `mailto:${base64Decode(EMAIL_ENCODED)}`,
    icon: 'tabler:mail',
    color: 'text-[#0078D4]',
    bgColor: 'bg-[#0078D4]/[0.05] dark:bg-[#0078D4]/[0.1] hover:bg-[#0078D4]/[0.08] dark:hover:bg-[#0078D4]/[0.15]',
    desc: '保持联系',
    modalType: 'email',
  },
  {
    name: '微信公众号',
    url: 'https://assets.coderfee.com/blog/wechat-qrcode.jpg',
    icon: 'tabler:brand-wechat',
    color: 'text-[#07C160]',
    bgColor: 'bg-[#07C160]/[0.05] dark:bg-[#07C160]/[0.1] hover:bg-[#07C160]/[0.08] dark:hover:bg-[#07C160]/[0.15]',
    desc: '深度思考与分享',
    modalType: 'wechat',
  },
  {
    name: 'RSS',
    url: '/rss.xml',
    icon: 'tabler:rss',
    color: 'text-[#EE802F]',
    bgColor: 'bg-[#EE802F]/[0.05] dark:bg-[#EE802F]/[0.1] hover:bg-[#EE802F]/[0.08] dark:hover:bg-[#EE802F]/[0.15]',
    desc: '第一时间获取更新',
    modalType: 'rss',
  },
  {
    name: '内容总览',
    url: '/sitemap-0.xml',
    icon: 'tabler:map-2',
    color: 'text-[#0D9488]',
    bgColor: 'bg-[#0D9488]/[0.05] dark:bg-[#0D9488]/[0.1] hover:bg-[#0D9488]/[0.08] dark:hover:bg-[#0D9488]/[0.15]',
    desc: '看看我都写了些什么',
    modalType: 'sitemap',
  },
];

const friends: Friend[] = [
  {
    name: '清溪奔快',
    url: 'https://blog.ixmoyren.dev/',
    desc: '不管青山碍',
    avatar: 'https://blog.ixmoyren.dev/icons/favicon.svg',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function AboutProfile() {
  const [activeModal, setActiveModal] = useState<ModalType>('none');
  const [ghStats, setGhStats] = useState<GitHubStats | null>(null);
  const [copiedType, setCopiedType] = useState<'none' | 'email' | 'rss' | 'friend'>('none');
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const { vibrate } = useHaptic();

  useEffect(() => {
    const img = new Image();
    img.src = 'https://assets.coderfee.com/blog/wechat-qrcode.jpg';
    getGitHubStats('coderfee').then(setGhStats);
  }, []);

  useBodyScrollLock(activeModal !== 'none');

  const handleCopy = (text: string, type: Exclude<typeof copiedType, 'none'>) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    vibrate('success');
    setTimeout(() => setCopiedType('none'), 2000);
  };

  const closeModal = () => {
    vibrate('light');
    setActiveModal('none');
  };

  return (
    <div className="space-y-12">
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-xs md:max-w-2xl mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ProfileCard onClick={() => setActiveModal('profile')} />

          {socialLinks.map((link) => (
            <SocialLinkItem key={link.name} link={link} onClick={() => setActiveModal(link.modalType || 'none')} />
          ))}
        </div>
      </motion.section>

      <AnimatePresence>
        <ProfileModal isOpen={activeModal === 'profile'} onClose={closeModal} />
        <WeChatModal isOpen={activeModal === 'wechat'} onClose={closeModal} />
        <GitHubModal isOpen={activeModal === 'github'} onClose={closeModal} stats={ghStats} />
        <EmailModal
          isOpen={activeModal === 'email'}
          onClose={closeModal}
          isCopied={copiedType === 'email'}
          onCopy={() => handleCopy(base64Decode(EMAIL_ENCODED), 'email')}
        />
        <RSSModal
          isOpen={activeModal === 'rss'}
          onClose={closeModal}
          isCopied={copiedType === 'rss'}
          onCopy={() => handleCopy('https://coderfee.com/rss.xml', 'rss')}
        />
        <SitemapModal isOpen={activeModal === 'sitemap'} onClose={closeModal} />
        <FriendModal
          isOpen={activeModal === 'friend'}
          onClose={closeModal}
          friend={selectedFriend}
          isCopied={copiedType === 'friend'}
          onCopy={() => selectedFriend && handleCopy(selectedFriend.url, 'friend')}
        />
      </AnimatePresence>

      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-xs md:max-w-2xl mx-auto"
      >
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 px-1">志同道合</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {friends.map((friend) => (
            <FriendLinkItem
              key={friend.name}
              friend={friend}
              onClick={() => {
                setSelectedFriend(friend);
                setActiveModal('friend');
              }}
            />
          ))}
        </div>
      </motion.section>
    </div>
  );
}
