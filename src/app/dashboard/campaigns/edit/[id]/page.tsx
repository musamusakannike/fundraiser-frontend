import CampaignEditClient from "./CampaignEditClient";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
    const { id } = await params;
    return <CampaignEditClient id={id} />;
}