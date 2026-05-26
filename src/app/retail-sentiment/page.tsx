import RetailSentimentClientPage from "@/components/features/pages/RetailSentimentClientPage";
import { pageSeo } from "@/lib/seo";
import { serverFetchDynamicTableByIdentifier } from "@/lib/serverAdminApi";

export const metadata = pageSeo(
    "Retail Sentiment",
    "Retail positioning and crowd sentiment by currency pair — context for contrarian and flow-aware forex strategies.",
    "/retail-sentiment",
);

const TABLE_IDENTIFIER = "retail_sentiment_currency_pairs";

async function RetailSentimentWithData() {
    const initialTable = await serverFetchDynamicTableByIdentifier(TABLE_IDENTIFIER);
    return <RetailSentimentClientPage initialTable={initialTable} />;
}

export default function RetailSentimentPage() {
    return <RetailSentimentWithData />;
}
