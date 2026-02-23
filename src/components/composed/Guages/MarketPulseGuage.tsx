import Image from "next/image";

export default function MarketPulseGuage() {
    return (
        <div className="bg-darkGrey rounded-xl h-64 max-w-[230px] flex-1 relative">
            <div className="flex justify-center items-center h-16 px-3 border-b border-solid border-stroke">
                <h6 className="text-base whitespace-nowrap mt-1">Technical Analysis</h6>
            </div>
            <div className="px-4 flex justify-center items-center h-[230px] relative -top-5">
                <Image
                    src="/images/charts/market-place-guage.svg"
                    alt="Market Place Guage"
                    fill
                />
            </div>
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-lg">
                8
            </div>
        </div>
    );
};