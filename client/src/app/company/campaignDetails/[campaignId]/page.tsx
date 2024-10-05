"use client";
import Head from "next/head";
import { FaLink, FaTwitter } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { ScaleLoader } from "react-spinners";
import { useToast } from "@/components/ui/use-toast";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

import { CheckCircleIcon } from "@heroicons/react/24/solid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { set } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useRef } from "react";

import axios from "axios";
import TwitterPreview from "@/components/TwitterPreview";
import Timer from "@/components/Timer";

interface Participant {
  wallet_address: string;
  instagram_post_id: string | null;
  twitter_post_id: string | null;
}

interface CampaignDetails {
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
  task: Task;
}

interface Task {
  task_id: string; // Unique identifier for the task
  campaign_id: string; // Associated campaign ID
  platform: string; // Platform type, e.g., Instagram or Twitter

  // Instagram-related fields
  media_type?: string; // Type of media (image, video, etc.)
  media_url?: string; // URL of the media
  caption?: string; // Caption for the Instagram post

  // Twitter-related fields
  tweet?: boolean; // Indicates if this task involves a tweet
  tweet_text?: string; // Text of the tweet
  tweet_media_url?: string; // URL of media attached to the tweet
  retweet?: boolean; // Indicates if this task involves a retweet
  retweet_url?: string; // URL of the tweet to retweet
  quote_tweet?: boolean; // Indicates if this task involves a quote tweet
  quote_tweet_url?: string; // URL of the tweet to quote
}

const CampaignDetails = ({ params }: { params: { campaignId: string } }) => {
  const { toast } = useToast();
  const router = useRouter();
  const [steps, setSteps] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [twitterQuoteText, setTwitterQuoteText] = useState<string>("");
  const {connected, account} = useWallet();

  const quoteTextRef = useRef("");

  const highlightHashtags = (text: string) => {
    const regex = /#\w+/g;
    return text.split(regex).map((part, index) => {
      const match = text.match(regex)?.[index];
      return (
        <React.Fragment key={index}>
          {part}
          {match && <span className="text-blue-500">{match}</span>}
        </React.Fragment>
      );
    });
  };

  const [campaignDetails, setCampaignDetails] = useState<
    CampaignDetails | undefined
  >(undefined);

  const getCampaignDetails = async (campaignId: string): Promise<void> => {
    const requestOptions: RequestInit = {
      method: "GET",
      redirect: "follow",
    };

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/campaign?campaign_id=${campaignId}`,
        requestOptions
      );
      const result = await response.json();
      const parsedResult = result.data;
      setCampaignDetails(parsedResult);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePost = async () => {
    setLoading(true);
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const postData = {
      media_type:
        campaignDetails?.task?.media_type &&
        campaignDetails?.task?.media_type.includes("video")
          ? "REELS"
          : "IMAGE",
      media_url: campaignDetails?.task?.media_url,
      caption: campaignDetails?.task?.caption,
      campaign_id: campaignDetails?.task?.campaign_id,
      wallet_address: account?.address,
    };

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(postData),
      redirect: "follow" as RequestRedirect,
    };

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/posts",
        requestOptions
      );
      const result = await response.json();
      console.log(result);
      if (result.status == "success") {
        setLoading(false);
        setSteps(1);
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Error while posting on Instagram.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuoteTwitterPost = async () => {
    const quoteText = quoteTextRef.current;
    setLoading(true);
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const quoteTweetId =
      campaignDetails?.task?.retweet_url?.split("/").pop() ?? "";
    console.log(quoteTweetId);

    const postData = {
      quote_text: quoteText,
      quote_tweet_id: quoteTweetId,
      wallet_address: account?.address,
    };

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(postData),
      redirect: "follow" as RequestRedirect,
    };

    try {
      const response = await fetch(
        "http://localhost:5000/quote-tweet",
        requestOptions
      );
      const result = await response.json();
      console.log(result);

      if (!result.error) {
        toast({
          description: result.msg,
        });
        participatePost(
          result.tweet_id,
          campaignDetails?.task?.campaign_id ?? "",
          account?.address ?? ""
        );
      } else {
        setLoading(false);
        toast({
          variant: "destructive",
          description: result.msg,
        });
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
      toast({
        variant: "destructive",
        description: "Error while posting on Twitter.",
      });
    }
  };

  const handleTwitterWithMediaPost = async () => {
    setLoading(true);
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const postData = {
      media_url: campaignDetails?.task?.tweet_media_url,
      tweet_text: campaignDetails?.task?.tweet_text,
      wallet_address: account?.address,
    };

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(postData),
      redirect: "follow",
    };

    try {
      const response = await fetch(
        "http://localhost:5000/tweet_with_media",
        requestOptions
      );
      const result = await response.json();

      if (!result.error) {
        toast({
          description: result.msg + ` Tweet ID: ${result.tweet_id}`,
        });
        participatePost(
          result.tweet_id,
          campaignDetails?.task?.campaign_id ?? "",
          account?.address ?? ""
        );
      } else {
        setLoading(false);
        toast({
          variant: "destructive",
          description: result.msg,
        });
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
      toast({
        variant: "destructive",
        description: "Error while posting on Twitter.",
      });
    }
  };

  const handleTwitterPost = async () => {
    setLoading(true);
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const postData = {
      tweet_text: campaignDetails?.task?.tweet_text,
      wallet_address: account?.address,
    };

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(postData),
      redirect: "follow",
    };

    try {
      const response = await fetch(
        "http://localhost:5000/tweet",
        requestOptions
      );
      const result = await response.json();

      if (!result.error) {
        toast({
          description: result.msg + ` Tweet ID: ${result.tweet_id}`,
        });
        participatePost(
          result.tweet_id,
          campaignDetails?.task?.campaign_id ?? "",
          account?.address ?? ""
        );
      } else {
        setLoading(false);
        toast({
          variant: "destructive",
          description: result.msg,
        });
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
      toast({
        variant: "destructive",
        description: "Error while posting on Twitter.",
      });
    }
  };

  const participatePost = async (
    post_id: string,
    campaign_id: string,
    wallet_address: string
  ) => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      campaign_id: campaign_id,
      wallet_address: wallet_address,
      twitter_post_id: post_id,
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
    };

    try {
      const response = await fetch(
        "http://localhost:5000/campaign/add_participant",
        requestOptions
      );
      const result = await response.json();

      if (!result.error) {
        setLoading(false);
        setSteps(1);
        toast({
          description: result.data,
        });
      } else {
        setLoading(false);
        toast({
          variant: "destructive",
          description: result.data,
        });
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
      toast({
        variant: "destructive",
        description: "Error while storing participant details.",
      });
    }
  };

  const dialogContent = [
    {
      title: "Preview",
      description: "",
      content: (
        <div className="flex flex-col justify-center items-center mb-[15px]">
          {campaignDetails?.task?.platform == "instagram" ? (
            <div className="p-[10px] border-[1px] max-w-[320px] shadow-md rounded-[10px]">
              <div className="flex items-center gap-x-[20px] px-[10px] py-[5px] border-b-[1px]">
                <img className="h-[30px]" src="/assets/images/user.png"></img>
                <p className="font-bold">allstackers</p>
              </div>
              <div className="flex flex-col items-center justify-center bg-gray-200 h-[300px]">
                {campaignDetails?.task?.media_url && (
                  <>
                    {campaignDetails?.task?.media_type &&
                    campaignDetails?.task?.media_type.includes("video") ? (
                      <video
                        className="w-[100%]"
                        src={campaignDetails?.task?.media_url}
                        autoPlay={true}
                        loop={true}
                      ></video>
                    ) : (
                      <img
                        className="w-[100%] object-cover"
                        src={campaignDetails?.task?.media_url}
                        alt="Selected"
                      ></img>
                    )}
                  </>
                )}
              </div>
              <div className="mt-[10px]">
                <div className="flex gap-x-[10px]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                    />
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
                    />
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                    />
                  </svg>
                </div>
                <div className="py-[10px]">
                  <p>
                    {campaignDetails?.task?.caption?.length &&
                    campaignDetails?.task?.caption?.length > 0 ? (
                      highlightHashtags(campaignDetails?.task?.caption)
                    ) : (
                      <em className="font-light">No Caption Added</em>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {campaignDetails?.task?.retweet == false ? (
                <div className="flex flex-col min-h-full px-[15px] py-[10px] gap-y-[10px]">
                  <div className="flex gap-x-[10px]">
                    <img
                      className="w-[30px] h-[30px]"
                      src="/assets/images/twitter.png"
                      alt="twitter"
                    />
                    <p className="text-black">
                      {campaignDetails?.task?.tweet_text}
                    </p>
                  </div>
                  {campaignDetails.task.tweet_media_url && (
                    <div className="flex flex-col items-center px-[20px]">
                      <img
                        className="border-[1px] rounded-lg shadow-sm"
                        src={campaignDetails.task.tweet_media_url}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {campaignDetails?.task?.quote_tweet == true ? (
                    <div className="flex flex-col gap-y-[20px]">
                      <p className="text-blue-400 underline cursor-pointer">
                        {campaignDetails.task.retweet_url}
                      </p>
                      <TwitterPreview
                        url={campaignDetails.task.retweet_url ?? ""}
                      />
                      <div className="flex w-full gap-x-[5px]">
                        <img
                          className="w-[30px] h-[30px]"
                          src="/assets/images/twitter.png"
                          alt="twitter"
                        />
                        <Textarea
                          className="focus-visible:ring-0 border-0 focus-visible:ring-transparent dark:focus-visible:ring-transparent"
                          placeholder="What is your Quote?!"
                          onChange={(e) => {
                            e.preventDefault();
                            quoteTextRef.current = e.target.value;
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <TwitterPreview
                      url={campaignDetails?.task.retweet_url ?? ""}
                    />
                  )}
                </>
              )}
            </>
          )}
        </div>
      ),
      footer: (
        <div className="flex justify-center w-full gap-x-[10px]">
          <Button
            type="submit"
            className="px-[40px] bg-blue-500 text-[16px] font-[400] hover:bg-blue-600"
            onClick={() => {
              if (campaignDetails?.task?.platform == "instagram") {
                handlePost();
              } else {
                let postId = "";
                if (campaignDetails?.task?.retweet == false) {
                  if (campaignDetails?.task?.tweet_media_url) {
                    handleTwitterWithMediaPost();
                  } else {
                    handleTwitterPost();
                  }
                } else {
                  handleQuoteTwitterPost();
                }
              }
            }}
          >
            {loading ? (
              <ScaleLoader color="#fff" loading={loading} />
            ) : (
              `Post on ${
                campaignDetails?.task?.platform == "instagram"
                  ? "Instagram"
                  : "Twitter"
              }`
            )}
          </Button>
        </div>
      ),
    },
    {
      title: "",
      description: "",
      content: (
        <div className=" text-green-600 rounded-lg p-8 flex flex-col items-center max-w-[600px] max-h-[400px] w-full h-auto">
          <img className="h-[80px]" src="/assets/images/verify.gif" />
          <p className="mt-4 text-xl font-semibold">Post Successfully!!</p>
        </div>
      ),

      footer: "",
    },
  ];

  useEffect(() => {
    if (params.campaignId) {
      getCampaignDetails(params.campaignId);
    }
  }, [params.campaignId]);

  return (
    <Dialog>
      <div className="min-h-[calc(100vh-100px)] p-8">
        {!campaignDetails ? (
          <main className="max-w-[75%] mx-auto">
            <div className="flex justify-between mb-[20px] gap-x-[30px]">
              <div className="w-[60%]">
                <div className="flex flex-col space-y-3">
                  <Skeleton className="h-[215px] w-full rounded-xl bg-blue-100" />
                  <div className="space-y-2">
                    <Skeleton className="h-[30px] w-full bg-blue-100" />
                    <Skeleton className="h-[30px] w-[90%] bg-blue-100" />
                  </div>
                </div>
              </div>
              <div className="w-[40%]">
                <div className="flex flex-col space-y-3">
                  <Skeleton className="h-[285px] w-full rounded-xl bg-blue-100" />
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-3">
              <Skeleton className="h-[55px] w-full rounded-xl bg-blue-100" />
              <Skeleton className="h-[25px] w-full rounded-xl bg-blue-100" />
              <Skeleton className="h-[25px] w-[90%] rounded-xl bg-blue-100" />
            </div>
          </main>
        ) : (
          <main className="max-w-[75%] mx-auto">
            <div className="flex justify-between mb-6 h-[360px] gap-x-[30px]">
              <Card className="w-[60%]">
                <div className="flex justify-between items-center pr-[20px] mb-[-15px]">
                  <CardHeader>
                    <CardTitle className="text-[#273339] text-[24px] font-[600]">
                      {campaignDetails?.campaign_name}
                    </CardTitle>
                    <CardDescription className="text-[18px]">
                      {campaignDetails?.company_name}
                    </CardDescription>
                  </CardHeader>
                  <div className="flex space-x-[30px] ml-auto mr-[30px] mt-[-15px]">
                    <a
                      href={campaignDetails?.company_website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="bg-blue-100 text-blue-500 p-3 rounded-full border border-transparent hover:border-blue-700 transition">
                        <img
                          className="h-[30px]"
                          src="/assets/images/link.png"
                          alt="Link"
                        />
                      </div>
                    </a>

                    <a
                      href={campaignDetails?.company_twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="bg-blue-100 text-blue-500 p-3 rounded-full border border-transparent hover:border-blue-700 transition">
                        <FaTwitter size={30} />
                      </div>
                    </a>
                  </div>
                </div>

                <div className="bg-white-100 border h-20 border-white rounded-lg p-2 flex items-center ml-[16px]">
                  <div className="border-l-4 border-blue-500 rounded-lg h-full mr-3"></div>
                  <div>
                    <div className="text-xs text-gray-400 font-bold mb-1 tracking-wide">
                      RUNS FROM
                    </div>
                    <div className="text-sm font-semibold">
                      {format(
                        new Date(campaignDetails.start_time),
                        "MMM d, yyyy"
                      )}{" "}
                      -{" "}
                      {format(
                        new Date(campaignDetails.payout_time),
                        "MMM d, yyyy"
                      )}
                    </div>
                  </div>

                  <p className="text-[#0fa38d] text-[16px] font-[500] ml-auto mr-[40px]">
                    {campaignDetails.participants?.length} participating
                  </p>
                </div>

                {/* <div className="mt-2 bg-gray-100 border w-[60%] ml-[25px] h-20 border-gray-200 rounded-lg p-4 mb-[25px]">
                  <div className="text-xs text-gray-400 font-bold mb-2">
                    APPLICATION CLOSES IN
                  </div>
                  <div className="text-md font-semibold mt-3">
                    {`${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s left`}
                  </div>
                </div> */}
                <Timer end_time={campaignDetails.end_time} />
                <CardFooter>
                  <div className="flex justify-between w-full">
                    <div className="flex gap-x-[10px]">
                      <div className="bg-[#f5f7f7] rounded-[15px] px-[10px] flex items-center">
                        <p className="text-[#38474e] p-0 m-0 text-[12px] font-[600] tracking-widest">
                          PAYOUT :{" "}
                          {format(
                            new Date(campaignDetails.payout_time),
                            "MMM d, yyyy, hh:mm a"
                          )}
                        </p>
                      </div>
                    </div>
                    <DialogTrigger asChild>
                      <Button className="bg-[#3770ff] hover:bg-[#2368fb] rounded-[10px] mr-[10px] px-[40px] font-bold text-[16px]">
                        See Participants
                      </Button>
                    </DialogTrigger>
                  </div>
                </CardFooter>
              </Card>

              {campaignDetails?.task?.platform == "instagram" ? (
                <div className="flex w-[40%] bg-gray-200 rounded-[10px] justify-center items-center">
                  {campaignDetails?.task?.media_url && (
                    <>
                      {campaignDetails?.task?.media_type &&
                      campaignDetails?.task?.media_type.includes("video") ? (
                        <video
                          className="h-[100%] rounded-[10px]"
                          src={campaignDetails?.task?.media_url}
                          autoPlay={true}
                          muted={true}
                          controls={true}
                          loop={true}
                        ></video>
                      ) : (
                        <img
                          className="h-[100%]"
                          src={campaignDetails?.task?.media_url}
                          alt="Selected"
                        ></img>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="flex w-[40%] border rounded-[10px] justify-center items-center">
                  {campaignDetails?.task?.retweet === false ? (
                    <div className="flex flex-col min-h-full px-[15px] py-[10px] gap-y-[10px]">
                      <div className="flex gap-x-[10px]">
                        <img
                          className="w-[30px] h-[30px]"
                          src="/assets/images/twitter.png"
                          alt="twitter"
                        />
                        <p className="text-black">
                          {campaignDetails?.task?.tweet_text}
                        </p>
                      </div>
                      {campaignDetails.task.tweet_media_url && (
                        <div className="flex flex-col items-center px-[20px]">
                          <img
                            className="border-[1px] h-[200px] rounded-lg shadow-sm"
                            src={campaignDetails.task.tweet_media_url}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="min-h-full max-h-[360px] overflow-y-auto scrollbar-hide">
                      <TwitterPreview
                        url={campaignDetails.task?.retweet_url || ""}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md mt-5 mb-5">
              <div className="text-center">
                <h2 className="text-[48px] text-[#273339] font-[800] p-2 flex items-center justify-center">
                  <img
                    src="/assets/images/aptos.png"
                    alt="Aptos"
                    className="w-[48px] h-[48px] mr-2"
                  />
                  {campaignDetails?.prize_pool}.00
                </h2>

                <h3 className="text-[22px] text-[#8e989c] font-[400]">
                  Total Prize Pool
                </h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">
                {" "}
                📣 Campaign Description
              </h2>

              <div className="h-[2px] bg-gray-100"></div>

              <h3 className="font-semibold mt-4 mb-2">
                Join us in {campaignDetails?.campaign_name} campaign
              </h3>

              <h4>{campaignDetails.campaign_description}</h4>

              <h3 className="font-semibold mt-4 mb-2">Tasks:</h3>
              <ul className="list-disc list-inside mb-4">
                {campaignDetails.post == "yes" && (
                  <li>Post about the campaign on Instagram.</li>
                )}
                {campaignDetails.likes == "yes" && (
                  <li>
                    Get minimum {campaignDetails.minimum_likes} on your post.
                  </li>
                )}
              </ul>

              <h3 className="font-semibold mt-4 mb-2">Eligibility:</h3>
              <ul className="list-disc list-inside mb-4">
                <li>Should have an Instagram account</li>
                {campaignDetails.followers && (
                  <li>
                    Should have minimum {campaignDetails.minimum_followers}{" "}
                    followers.
                  </li>
                )}
              </ul>
              <div className="flex flex-row items-center justify-center">
                <DialogTrigger asChild>
                  <Button className="bg-[#3770ff] hover:bg-[#2368fb] rounded-[10px] px-[40px] font-bold text-[16px]">
                    Participate
                  </Button>
                </DialogTrigger>
              </div>
            </div>
          </main>
        )}
        <DialogContent className="max-w-[576px] w-fit max-h-[90vh] scrollbar-hide overflow-y-auto p-[64px] py-[48px]">
          <DialogHeader>
            <DialogTitle>{dialogContent[steps].title}</DialogTitle>
            <DialogDescription>
              {dialogContent[steps].description}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">{dialogContent[steps].content}</div>
          <DialogFooter>{dialogContent[steps].footer}</DialogFooter>
        </DialogContent>
      </div>
    </Dialog>
  );
};

export default CampaignDetails;
