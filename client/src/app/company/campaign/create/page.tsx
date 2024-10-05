"use client";
import React, { useState, useEffect, use } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface Participant {
  wallet_address: string;
  instagram_post_id: string | null;
  twitter_post_id: string | null;
}

interface Campaign {
  campaign_id: string;
  campaign_name: string;
  campaign_description: string;
  company_name: string;
  company_twitter: string;
  company_website: string;
  start_time: string;
  end_time: string;
  payout_time: string;
  prize_pool: number;
  post: string;
  likes: string;
  minimum_likes: number;
  followers: string;
  minimum_followers: number;
  participants: Participant[];
  task_id: string;
}

interface ApiResponse {
  error: boolean;
  data: string; // The stringified JSON array
}

const Campaigns = () => {
  const router = useRouter();
  const [allCampaigns, setAllCampaigns] = useState<Campaign[]>([]);
  const [myCampaigns, setMyCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    const requestOptions: RequestInit = {
      method: "GET",
      redirect: "follow",
    };

    try {
      const response = await fetch(
        "http://localhost:5000/campaign",
        requestOptions
      );
      const result: ApiResponse = await response.json();
      const parsedResult: Campaign[] = result.data;
      setAllCampaigns(parsedResult);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
    }
  };

  const fetchMyCampaigns = async () => {
    const requestOptions: RequestInit = {
      method: "GET",
      redirect: "follow",
    };

    try {
      const response = await fetch(
        "http://localhost:5000/campaign?company_name=Aptos",
        requestOptions
      );
      const result: ApiResponse = await response.json();

      const parsedResult: Campaign[] = result.data;
      setMyCampaigns(parsedResult);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
    }
  }

  const handleTabsClick = (value: string) => {
    if (value === "my") {
      setLoading(true);
      fetchMyCampaigns();
    } else {
      setLoading(true);
      fetchCampaigns();
    }
  };

  const navigate = (campaignId: string) => {
    router.push(`/company/campaignDetails/${campaignId}`);
  }

  const navigateToParticipantsPage = (campaignId: string) => {
    router.push(`/company/campaign/participants/${campaignId}`);
  }

  return (
    <div className="min-h-[calc(100vh-100px)] bg-[#f5f7f7]">
      <Tabs
        defaultValue="discover"
        className="w-full flex flex-col items-center"
      >
        <div className="py-[20px] bg-white border-t-[2px] w-full flex justify-center shadow-lg shadow-gray-200/30">
          <TabsList className="p-[5px]">
            <TabsTrigger
              className="my-[10px]"
              value="discover"
              onClick={() => {
                handleTabsClick("all");
              }}
            >
              DISCOVER
            </TabsTrigger>
            <TabsTrigger
              className="my-[10px]"
              value="my"
              onClick={() => {
                handleTabsClick("my");
              }}
            >
              MY CAMPAIGN
            </TabsTrigger>
          </TabsList>
        </div>
        <div className="w-[80%] p-[30px]">
          <TabsContent value="discover">
            <div className="flex gap-x-[15px] items-center">
              <h1 className="min-w-fit font-[800] text-[30px] text-[#273339]">
                All Campaigns
              </h1>
              <span className="w-full border-[1px]"></span>
            </div>
            <div className="grid grid-cols-2 gap-y-[40px] gap-x-[40px] mt-[20px]">
              {loading ? (
                <>
                  {Array(4)
                    .fill(null)
                    .map((_, index) => (
                      <div className="flex flex-col space-y-3" key={index}>
                        <Skeleton className="h-[125px] w-full rounded-xl bg-blue-100" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full bg-blue-100" />
                          <Skeleton className="h-4 w-[90%] bg-blue-100" />
                        </div>
                      </div>
                    ))}
                </>
              ) : (
                <>
                  {allCampaigns.map((campaign) => (
                    <Card
                      key={campaign.campaign_id}
                      className="px-[20px] py-[10px]"
                    >
                      <div className="flex justify-between items-center pr-[20px]">
                        <CardHeader>
                          <CardTitle className="text-[#273339] text-[24px] font-[600]">
                            {campaign.campaign_name}
                          </CardTitle>
                          <CardDescription className="text-[16px]">
                            {campaign.company_name}
                          </CardDescription>
                        </CardHeader>
                        <div className="flex gap-x-4">
                          <Link href={campaign.company_website} target="_blank">
                            <div className="rounded-full p-[10px] bg-gray-100">
                              <img
                                className="h-[20px]"
                                src="/assets/images/link.png"
                                alt="link"
                              />
                            </div>
                          </Link>
                          <Link href={campaign.company_twitter} target="_blank">
                            <div className="rounded-full p-[10px] bg-gray-100">
                              <img
                                className="h-[20px]"
                                src="/assets/images/twitter.png"
                                alt="twitter"
                              />
                            </div>
                          </Link>
                        </div>
                      </div>

                      <CardContent>
                        <div className="flex flex-col gap-y-[10px]">
                          <p className="text-blue-400 text-[16px] font-[500] hover:cursor-pointer" onClick={() => navigateToParticipantsPage(campaign.campaign_id)}>
                            + participating
                          </p>
                          <div className="rounded-full border-[2px] w-fit border-gray-300 px-[10px]">
                            <span className="text-gray-500 font-[600] text-[13px] tracking-widest">
                              {campaign.followers ? (
                                <>
                                  {campaign.minimum_followers} followers
                                  required
                                </>
                              ) : (
                                "No Restriction"
                              )}
                            </span>
                          </div>
                          <div className="bg-gray-100 mt-[20px] w-fit rounded-[15px] py-[5px] px-[10px] flex items-center">
                            <p className="text-gray-700  text-[18px] font-[700] tracking-widest">
                              Prize Pool: {campaign.prize_pool} APT
                            </p>
                          </div>

                          <div className="flex gap-x-[20px]">
                            <div className="bg-gray-100 rounded-[15px] px-[10px] flex items-center">
                              <p className="text-[#38474e] p-0 m-0 text-[12px] font-[600] tracking-widest">
                                ENDS{" "}
                                {new Date(
                                  campaign.end_time
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="bg-gray-100 rounded-[15px] py-[10px] px-[20px] flex items-center">
                              <p className="text-[#38474e] text-[12px] font-[600] tracking-widest">
                                PAYOUT{" "}
                                {new Date(
                                  campaign.payout_time
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter>
                        <Button className="w-full rounded-[10px]" onClick={() => navigate(campaign.campaign_id)}>
                          See More
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </>
              )}
            </div>
          </TabsContent>
          <TabsContent value="my">
            <div className="flex gap-x-[15px] items-center">
              <h1 className="min-w-fit font-[800] text-[30px] text-[#273339]">
                My Campaigns
              </h1>
              <span className="w-full border-[1px]"></span>
              <Button
                className="flex items-center gap-x-[10px] text-[16px] text-[#3770ff] font-[500] bg-[#b3ceff] rounded-[10px] hover:bg-blue-500 hover:text-white"
                onClick={() => {
                  router.push("/company/campaign/create");
                }}
              >
                Create Campaign
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="h-[16px]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-y-[40px] gap-x-[40px] mt-[20px]">
              {loading ? (
                <>
                  {Array(4)
                    .fill(null)
                    .map((_, index) => (
                      <div className="flex flex-col space-y-3" key={index}>
                        <Skeleton className="h-[125px] w-full rounded-xl bg-blue-100" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full bg-blue-100" />
                          <Skeleton className="h-4 w-[90%] bg-blue-100" />
                        </div>
                      </div>
                    ))}
                </>
              ):
              myCampaigns.map((campaign) => (
                <Card
                  key={campaign.campaign_id}
                  className="px-[20px] py-[10px]"
                >
                  <div className="flex justify-between items-center pr-[20px]">
                    <CardHeader>
                      <CardTitle className="text-[#273339] text-[24px] font-[600]">
                        {campaign.campaign_name}
                      </CardTitle>
                      <CardDescription className="text-[16px]">
                        {campaign.company_name}
                      </CardDescription>
                    </CardHeader>
                    <div className="flex gap-x-4">
                      <Link href={campaign.company_website} target="_blank">
                        <div className="rounded-full p-[10px] bg-gray-100">
                          <img
                            className="h-[20px]"
                            src="/assets/images/link.png"
                            alt="link"
                          />
                        </div>
                      </Link>
                      <Link href={campaign.company_twitter} target="_blank">
                        <div className="rounded-full p-[10px] bg-gray-100">
                          <img
                            className="h-[20px]"
                            src="/assets/images/twitter.png"
                            alt="twitter"
                          />
                        </div>
                      </Link>
                    </div>
                  </div>

                  <CardContent>
                    <div className="flex flex-col gap-y-[10px]">
                      <p className="text-blue-400 text-[16px] font-[500] hover:cursor-pointer" onClick={() => navigateToParticipantsPage(campaign.campaign_id)}>
                        + {campaign.participants.length} participating
                      </p>
                      <div className="rounded-full border-[2px] w-fit border-gray-300 px-[10px]">
                        <span className="text-gray-500 font-[600] text-[13px] tracking-widest">
                          {campaign.followers ? (
                            <>{campaign.minimum_followers} followers required</>
                          ) : (
                            "No Restriction"
                          )}
                        </span>
                      </div>
                      <div className="bg-gray-100 mt-[20px] w-fit rounded-[15px] py-[5px] px-[10px] flex items-center">
                        <p className="text-gray-700  text-[18px] font-[700] tracking-widest">
                          Prize Pool: {campaign.prize_pool} APT
                        </p>
                      </div>

                      <div className="flex gap-x-[20px]">
                        <div className="bg-gray-100 rounded-[15px] px-[10px] flex items-center">
                          <p className="text-[#38474e] p-0 m-0 text-[12px] font-[600] tracking-widest">
                            ENDS{" "}
                            {new Date(campaign.end_time).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="bg-gray-100 rounded-[15px] py-[10px] px-[20px] flex items-center">
                          <p className="text-[#38474e] text-[12px] font-[600] tracking-widest">
                            PAYOUT{" "}
                            {new Date(
                              campaign.payout_time
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button className="w-full rounded-[10px]" onClick={() => navigate(campaign.campaign_id)}>See More</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Campaigns;
