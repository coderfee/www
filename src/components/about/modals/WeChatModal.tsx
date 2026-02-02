import { Icon } from '@iconify/react';
import ModalWrapper from './ModalWrapper';

export default function WeChatModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <ModalWrapper layoutId="wechat-modal" onClose={onClose}>
      <div className="text-center">
        <div className="size-14 rounded-2xl bg-[#07C160]/10 flex items-center justify-center mb-4 mx-auto">
          <Icon icon="tabler:brand-wechat" className="text-3xl text-[#07C160]" />
        </div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">微信公众号</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 px-4">扫一扫，在微信里看我的最新分享</p>
        <img
          src="https://assets.coderfee.com/blog/wechat-qrcode.jpg"
          alt="WeChat QR Code"
          className="w-43 h-43 rounded-2xl shadow-lg border border-zinc-100 dark:border-zinc-800 mx-auto"
        />
      </div>
    </ModalWrapper>
  );
}
