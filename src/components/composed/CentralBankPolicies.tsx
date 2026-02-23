import Image from "next/image";

export default function CentralBankPoliciesSection() {
    return (
        <CentralBankPolicies>
            <CentralBankPolicy bank="ECB" currentRate="4.50%" policy="Higher rate to fight inflation" lastUpdated="unchanged Sep 14" />
            <CentralBankPolicy bank="Fed" currentRate="5.25%" policy="Lower rate to stimulate economy" lastUpdated="unchanged Sep 14" />
            <CentralBankPolicy bank="BoE" currentRate="4.75%" policy="Higher rate to fight inflation" lastUpdated="unchanged Sep 14" />
            <CentralBankPolicy bank="BoJ" currentRate="0.25%" policy="Unchanged" lastUpdated="Mar 21" />
            <CentralBankPolicy bank="SNB" currentRate="5.50%" policy="Higher rate to fight inflation" lastUpdated="unchanged Sep 14" />
            <CentralBankPolicy bank="ECB" currentRate="4.50%" policy="Higher rate to fight inflation" lastUpdated="unchanged Sep 14" />
            <CentralBankPolicy bank="ECB" currentRate="4.50%" policy="Higher rate to fight inflation" lastUpdated="unchanged Sep 14" />
            <CentralBankPolicy bank="ECB" currentRate="4.50%" policy="Higher rate to fight inflation" lastUpdated="unchanged Sep 14" />
        </CentralBankPolicies>
    );
};

function CentralBankPolicies({ children }: React.PropsWithChildren) {
    return (
        <div className="overflow-x-auto">
            <table className="mt-8 border-separate border-spacing-x-4 border-spacing-y-2 -ml-4">
                <thead>
                    <tr className="text-sm whitespace-nowrap">
                        <th>Bank</th>
                        <th>Current rate</th>
                        <th role="button" className="flex items-center gap-2">
                            <span>Policy</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 12 12" fill="none">
                                <path d="M3 4.5L6 7.5L9 4.5" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {children}
                </tbody>
            </table>
        </div>
    );
};

function CentralBankPolicy({ bank, currentRate, policy, lastUpdated }: { bank: string, currentRate: string, policy: string, lastUpdated: string }) {
    return (
        <tr className="border-t border-solid border-[#000] text-sm">
            <td className="font-semibold">{bank}</td>
            <td className="font-semibold">{currentRate}</td>
            <td>{policy}</td>
            <td>{lastUpdated}</td>
            <td className="min-w-[120px] lg:min-w-[160px] xl:min-w-[200px] align-top pt-2">
                <div className="relative w-full min-w-[100px] lg:min-w-[140px] xl:min-w-[180px] aspect-[2/1]">
                    <Image
                        src="/images/temporary/guage.svg"
                        alt="Guage"
                        fill
                        className="object-contain"
                    />
                </div>
            </td>
        </tr>
    );
};