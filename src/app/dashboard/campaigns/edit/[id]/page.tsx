import CampaignEditClient from "./CampaignEditClient";

export default function Page({ params }: { params: { id: string } }) {
    const { id } = params;
    return <CampaignEditClient id={id} />;
}