import Image from 'next/image';

export function MarketingOSLogo({ size = 32, showText = true }: { size?: number; showText?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <Image
        src="/logo.jpg"
        alt="MarketingOS Logo"
        width={size}
        height={size}
        className="object-contain"
        priority
      />
      {showText && (
        <span className="font-semibold text-white" style={{ fontSize: size * 0.6 }}>
          MarketingOS
        </span>
      )}
    </div>
  );
}