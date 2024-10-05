"use client";
import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Define the structure of the API response
interface CampaignDetails {
  error: boolean;
  data: {
    twitter_post_id: string;
    likes_count: number;
    comment_count: number;
    retweet_count: number;
    quote_count: number;
  }[];
}

// Component to render the table
const TableDemo = ({ data }: { data: CampaignDetails['data'] }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Twitter Post ID</TableHead>
          <TableHead>Likes Count</TableHead>
          <TableHead>Comment Count</TableHead>
          <TableHead>Retweet Count</TableHead>
          <TableHead>Quote Count</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((d) => (
          <TableRow key={d.twitter_post_id}>
            <TableCell>{d.twitter_post_id}</TableCell>
            <TableCell>{d.likes_count}</TableCell>
            <TableCell>{d.comment_count}</TableCell>
            <TableCell>{d.retweet_count}</TableCell>
            <TableCell>{d.quote_count}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

// Main component to fetch and display campaign details
const Participants = ({ params }: { params: { campaignId: string } }) => {
  const [campaignDetails, setCampaignDetails] = useState<CampaignDetails | undefined>(undefined);

  const getCampaignDetails = async (campaignId: string): Promise<void> => {
    const requestOptions: RequestInit = {
      method: "GET",
      redirect: "follow",
    };

    try {
      // Fixed URL: removed extra quotes
      const response = await fetch(
        `http://127.0.0.1:5000/campaign/participants?campaign_id=${campaignId}`,
        requestOptions
      );
      const result: CampaignDetails = await response.json();
      
      if (!result.error) {
        console.log(result.data);
        setCampaignDetails(result);
      } else {
        console.error("Error fetching campaign details.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getCampaignDetails(params.campaignId);
  }, [params.campaignId]);

  return (
    <div className="flex flex-col w-[100%] justify-center items-center">
      <span>Campaign Participants</span>
      <div className="w-[70%] mt-[50px]">
        {campaignDetails ? <TableDemo data={campaignDetails.data} /> : <Skeleton />}
      </div>
    </div>
  );
};

export default Participants;
