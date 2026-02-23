import Image from "next/image";

export default function Icon({
    name,
    width = 20,
    height = 20,
    className = ""
}: {
    name: string,
    width?: number,
    height?: number,
    className?: string
}) {
    return (
        <Image
            src={`/images/icons/${name}`}
            alt="Icon"
            width={width}
            height={height}
            className={`object-contain ${className}`}
        />
    );
};