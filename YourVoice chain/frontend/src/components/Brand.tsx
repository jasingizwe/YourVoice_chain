import { Link } from 'react-router-dom';

type BrandProps = {
  size?: 'sm' | 'md' | 'lg';
  linkTo?: string;
  className?: string;
  showText?: boolean;
};

const sizeMap = {
  sm: {
    image: 'h-7 w-7',
    text: 'text-base',
  },
  md: {
    image: 'h-9 w-9',
    text: 'text-2xl',
  },
  lg: {
    image: 'h-10 w-10',
    text: 'text-2xl',
  },
} as const;

function BrandContent({
  size = 'md',
  showText = true,
}: {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <img
        src="/logo.png"
        alt="YourVoice logo"
        className={`${sizeMap[size].image} object-contain`}
      />
      {showText && (
        <span className={`${sizeMap[size].text} font-heading font-bold text-foreground`}>
          YourVoice
        </span>
      )}
    </span>
  );
}

export default function Brand({ size = 'md', linkTo = '/', className = '', showText = true }: BrandProps) {
  return (
    <Link to={linkTo} className={`hover:text-primary transition-colors ${className}`}>
      <BrandContent size={size} showText={showText} />
    </Link>
  );
}
