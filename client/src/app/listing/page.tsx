import Head from 'next/head';
import Image from 'next/image';

import { FaLink, FaTwitter } from 'react-icons/fa';

const campaigns = [
    {
        name: "Invisible Garden #0",
        theme: "BLOCKCHAIN",
        participants: 250,
        startDate: "30/09/24",
        image: "/web3.jpg",
    },
    {
        name: "Hack-a-Sol 2024",
        theme: "NO RESTRICTIONS",
        participants: 250,
        startDate: "13/09/24",
        image: "/web3.jpg",
    },
    {
        name: "CryptoShield campaign",
        theme: "NO RESTRICTIONS",
        participants: 250,
        startDate: "05/09/24",
        image: "/web3.jpg",
    },
    {
        name: "MBMC IdeaX",
        theme: "BLOCKCHAIN, FINTECH, AI/ML",
        participants: 100,
        startDate: "27/09/24",
        image: "/web3.jpg",
    },
    // Add more campaigns as needed
];

export default function campaignList() {
    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <Head>
                <title>Open campaigns</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Open</h1>
                    <button className="text-blue-600 hover:underline">All open campaigns</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaigns.map((campaign, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                            <div className="p-6 flex-grow">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-xl font-semibold mb-2">{campaign.name}</h2>
                                        <p className="text-sm text-gray-600 mb-2">campaign</p>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <span className="px-2 py-1 bg-gray-200 rounded-full text-xs">THEME</span>
                                            <span className="text-xs">{campaign.theme}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-start space-y-2 ml-10">
                                        <div className="flex space-x-4">
                                            <div className="bg-blue-100 text-blue-500 p-2 rounded-full border border-transparent hover:border-blue-700 transition">
                                                <FaLink size={15} />
                                            </div>
                                            <div className="bg-blue-100 text-blue-500 p-2 rounded-full border border-transparent hover:border-blue-700 transition">
                                                <FaTwitter size={15} />
                                            </div>
                                        </div>
                                        <div className="flex items-center mt-3 space-x-1">
                                            <Image src={campaign.image} alt={campaign.name} width={40} height={40} className="rounded-full" />
                                            <span className="text-sm text-gray-600">+{campaign.participants} participating</span>
                                        </div>
                                    </div>

                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex space-x-2">
                                        <span className="px-2 py-1 bg-gray-200 rounded-full text-xs">OFFLINE</span>
                                        <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs">OPEN</span>
                                    </div>
                                    <span className="text-sm text-gray-600">Starts {campaign.startDate}</span>
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-gray-50 border-t mt-auto">
                                <button className="w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 transition duration-300">
                                    Apply now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}