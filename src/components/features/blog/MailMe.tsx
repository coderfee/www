'use client';

import { EMAIL_ENCODED } from '@/consts';
import { base64Decode } from '@/lib/helper';

type Prop = {
  label: string;
};

export default function MailMe({ label }: Prop) {
  const handleClick = () => {
    const decodedEmail = base64Decode(EMAIL_ENCODED);
    window.location.href = `mailto:${decodedEmail}`;
  };

  return (
    <button type="button" onClick={() => handleClick()} className="cursor-pointer">
      {label}
    </button>
  );
}
