import Image from "next/image";
import { CurrencyStrengthIndex, CurrencyStrengthIndexes } from "./CurrencyStrengthIndex";

export default function FundamentalCurrencyStrengthIndex({ currencyStrengthData }: { currencyStrengthData: { currency: string, strength: number, value: string }[] }) {
    return (
        <div className="flex flex-col gap-4 mt-8">
            <CurrencyStrengthIndexes>
                {currencyStrengthData.map((item, idx) => (
                    <CurrencyStrengthIndex
                        key={idx}
                        currency={item.currency}
                        strength={item.strength}
                        value={item.value}
                    />
                ))}
            </CurrencyStrengthIndexes>

            <div className="flex justify-between h-24">
                <h6 className="self-end">Risk Mode</h6>

                <Image
                    src="/images/temporary/guage.svg"
                    alt="Guage"
                    width={150}
                    height={100}
                    className="self-start"
                />
            </div>
        </div>
    );
};