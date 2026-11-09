import Image from "next/image";

export default function BrandLogo({ light = false, className = "" }: {light?:boolean; className?:string}) {
  return (
    <Image
      src={light ? "/exist-logo-light.png" : "/exist-logo-original.png"}
      alt="EXIST"
      width={167}
      height={35}
      priority
      className={`brand-logo ${className}`}
    />
  );
}
