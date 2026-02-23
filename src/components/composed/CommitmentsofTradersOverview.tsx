import { cn } from "@/lib/utils";
import Icon from "./Icon";

export default function CommitmentsofTradersOverview() {
    return (
        <CommitmentsofTraders>
            <CommitmentsofTrader bank="ECB" currentPositioning="+129k" positionChange="+11" cotNetIndex="-16" score="+5" />
            <CommitmentsofTrader bank="Fed" currentPositioning="+129k" positionChange="+11" cotNetIndex="12" score="+3.2" />
            <CommitmentsofTrader bank="BoE" currentPositioning="+129k" positionChange="-9" cotNetIndex="-15" score="-1.5" />
            <CommitmentsofTrader bank="BoJ" currentPositioning="+129k" positionChange="+11" cotNetIndex="-20" score="-1.5" />
            <CommitmentsofTrader bank="SNB" currentPositioning="+129k" positionChange="+11" cotNetIndex="10" score="-4" />
            <CommitmentsofTrader bank="ECB" currentPositioning="+129k" positionChange="-2" cotNetIndex="-11" score="-5" />
            <CommitmentsofTrader bank="ECB" currentPositioning="+129k" positionChange="+11" cotNetIndex="6" score="5" />
            <CommitmentsofTrader bank="ECB" currentPositioning="+129k" positionChange="-4" cotNetIndex="11" score="-5" />
            <CommitmentsofTrader bank="ECB" currentPositioning="+129k" positionChange="+11" cotNetIndex="6" score="5" />
        </CommitmentsofTraders>
    );
};

function CommitmentsofTraders({ children }: React.PropsWithChildren) {
    return (
        <div className="overflow-x-auto">
            <table className="mt-8 border-separate border-spacing-x-2 border-spacing-y-7 -ml-2">
                <thead>
                    <tr className="text-sm">
                        <th>Symbol</th>
                        <th>Current positioning</th>
                        <th>Position change (4s)</th>
                        <th>COT Net index (0-100)</th>
                        <th>Score</th>
                    </tr>
                </thead>

                <tbody>
                    {children}
                </tbody>
            </table>
        </div>
    );
};

function CommitmentsofTrader({ bank, currentPositioning, positionChange, cotNetIndex, score }: { bank: string, currentPositioning: string, positionChange: string, cotNetIndex: string, score: string }) {
    return (
        <tr className="border-t border-solid border-[#000] text-sm">
            <td className="font-semibold">{bank}</td>
            <td className="font-semibold">{currentPositioning}</td>
            <td className={cn(Number(positionChange) > 0 ? "text-green" : "text-sell", "font-semibold flex items-center gap-3")}>
                <button>
                    <svg width="10" height="10" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.01953 3.51563L1.13333e-07 7.01953L2.96259e-08 1.43099e-07L7.01953 3.51563Z" fill="#99A1AF" />
                    </svg>
                </button>
                <div className="flex items-center gap-2">
                    {positionChange}
                    <Icon name={Number(positionChange) > 0 ? "profit-icon.svg" : "loss-icon.svg"} width={10} height={10} />
                </div>
            </td>
            <td>
                <div className="flex items-center gap-[3px] ml-5">
                    <CotNetIndexBar cotNetIndex={cotNetIndex} />
                    <CotNetIndexBar cotNetIndex={cotNetIndex} />
                    <CotNetIndexBar cotNetIndex={cotNetIndex} />
                    <CotNetIndexBar cotNetIndex={cotNetIndex} />
                    <CotNetIndexBar cotNetIndex={cotNetIndex} />
                    <CotNetIndexBar cotNetIndex={cotNetIndex} />
                    <CotNetIndexBar cotNetIndex={cotNetIndex} />
                    <CotNetIndexBar cotNetIndex={cotNetIndex} />
                    <CotNetIndexBar cotNetIndex={cotNetIndex} />
                    <CotNetIndexBar cotNetIndex={cotNetIndex} />
                    <CotNetIndexBar cotNetIndex={cotNetIndex} />
                    <CotNetIndexBar cotNetIndex={cotNetIndex} />
                    <CotNetIndexBar cotNetIndex={cotNetIndex} />
                    <CotNetIndexBar cotNetIndex={cotNetIndex} />
                    <CotNetIndexBar cotNetIndex={cotNetIndex} />
                    <CotNetIndexBar cotNetIndex={cotNetIndex} noBg={true} />
                    <CotNetIndexBar cotNetIndex={cotNetIndex} noBg={true} />
                    <CotNetIndexBar cotNetIndex={cotNetIndex} noBg={true} />
                    <CotNetIndexBar cotNetIndex={cotNetIndex} noBg={true} />
                    <CotNetIndexBar cotNetIndex={cotNetIndex} noBg={true} />
                </div>
            </td>
            <td>
                <div className={cn(Number(score) > 0 ? "bg-[#00A63E]" : "bg-sell", "px-3 h-7 font-semibold rounded-[3px] flex items-center justify-center")}>
                    {score}
                </div>
            </td>
        </tr>
    );
};

function CotNetIndexBar({ cotNetIndex, noBg = false }: { cotNetIndex: string, noBg?: boolean }) {
    return (
        <div className="h-[19px] rounded-2xl w-[9.5px]">
            <div className={cn(noBg ? "bg-[#364153]" : Number(cotNetIndex) > 0 ? "bg-[#00A63E]" : "bg-sell", "h-full rounded-2xl")}>

            </div>
        </div>
    );
}