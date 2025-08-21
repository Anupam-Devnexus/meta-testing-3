import React from "react";
import { FaFacebook, FaWhatsapp, FaGoogle, FaSlack } from "react-icons/fa";
import IntegrationCard from "../../../Components/Cards/IntigrationCard";

const IntegrationPage = () => {
  const integrationsData = [
    {
      id: 1,
      title: "Facebook Integration",
      description: "Connect your Facebook account to fetch leads and ads data.",
      icon: FaFacebook,
      bgColor: "bg-blue-50",
      textColor: "text-blue-800",
      borderColor: "border-blue-200",
      buttonText: "Connect Facebook",
      buttonColor: "bg-blue-600",
      status: "Not Connected",
    },
    {
      id: 2,
      title: "WhatsApp Integration",
      description: "Connect your WhatsApp account to send automated messages.",
      icon: FaWhatsapp,
      bgColor: "bg-green-50",
      textColor: "text-green-800",
      borderColor: "border-green-200",
      buttonText: "Connect WhatsApp",
      buttonColor: "bg-green-600",
      status: "Connected",
    },
    {
      id: 3,
      title: "Google Integration",
      description: "Sync your Google account to manage calendar and contacts.",
      icon: FaGoogle,
      bgColor: "bg-red-50",
      textColor: "text-red-800",
      borderColor: "border-red-200",
      buttonText: "Connect Google",
      buttonColor: "bg-red-600",
      status: "Not Connected",
    },
    {
      id: 4,
      title: "Slack Integration",
      description: "Integrate Slack to receive notifications and alerts.",
      icon: FaSlack,
      bgColor: "bg-purple-50",
      textColor: "text-purple-800",
      borderColor: "border-purple-200",
      buttonText: "Connect Slack",
      buttonColor: "bg-purple-600",
      status: "Connected",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Integrations</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {integrationsData.map((integration) => (
          <IntegrationCard key={integration.id} {...integration} />
        ))}
      </div>
    </div>
  );
};

export default IntegrationPage;
