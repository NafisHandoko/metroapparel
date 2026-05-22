import Image, { ImageProps } from "next/image";

type OptimizedImageProps = Omit<ImageProps, "src"> & {
  src: string;
};

/**
 * Wrapper untuk Next.js Image component.
 *
 * URL rewriting untuk development Docker environment di-handle oleh middleware.ts
 * yang mengubah `localhost:9000` → `medusa:9000` pada request `/_next/image`.
 *
 * Component ini ada untuk konsistensi dan memudahkan future enhancements.
 */
export function OptimizedImage({ src, alt, ...props }: OptimizedImageProps) {
  return <Image src={src} alt={alt} {...props} />;
}
