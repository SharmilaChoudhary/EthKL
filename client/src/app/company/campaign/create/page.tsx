"use client";
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUploader } from "react-drag-drop-files";
import { useToast } from "@/components/ui/use-toast";
import { useWallet, WalletName } from "@aptos-labs/wallet-adapter-react";
import { AptosConfig, Aptos, Network } from "@aptos-labs/ts-sdk";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Switch } from "@/components/ui/switch";

import ScaleLoader from "react-spinners/ScaleLoader";

import { useRouter } from "next/navigation";
import { PinataSDK } from "pinata";

import { CTimePicker } from "@coreui/react-pro";
import "@coreui/coreui-pro/dist/css/coreui.min.css";

const hashtags = ["#hash1", "#hash2", "#hash3", "#hash4"];
const Create = () => {
  const { connect, disconnect, connected, account, signAndSubmitTransaction } =
    useWallet();
  const [file, setFile] = useState<any>(null);
  const [campaignName, setCampaignName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [caption, setCaption] = useState<string>("");
  const [steps, setSteps] = useState<number>(0);
  const [campaignDate, setCampaignDate] = React.useState<Date>();
  const [campaignTime, setCampaignTime] = React.useState<string>();
  const [payoutDate, setPayoutDate] = React.useState<Date>();
  const [payoutTime, setPayoutTime] = React.useState<string>();
  const [prizePool, setPrizePool] = React.useState<number>();
  const [likes, setLikes] = React.useState<boolean>(false);
  const [likesCount, setLikesCount] = React.useState<number>(0);
  const [followers, setFollowers] = React.useState<boolean>(false);
  const [followersCount, setFollowersCount] = React.useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [twitterText, setTwitterText] = useState<string>("");
  const [quoteTweet, setQuoteTweet] = useState<boolean>(false);
  const [retweetUrl, setRetweetUrl] = useState<string>("");
  const [retweet, setRetweet] = useState<boolean>(false);
  const [tweetMedia, setTweetMedia] = useState<any>(null);

  const { toast } = useToast();
  const router = useRouter();

  const fileInputTwitterImage = useRef<HTMLInputElement>(null);

  const fileInputTwitterVideo = useRef<HTMLInputElement>(null);

  const pinata = new PinataSDK({
    pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT,
    pinataGateway: process.env.NEXT_PUBLIC_PINATA_ENDPOINT,
  });
  const handleChange = (uploadedFile: any) => {
    if (uploadedFile) {
      setFile(uploadedFile);
    }
  };

  function formatDateTime(Date2: Date, Time: string): string {
    // Parse the time from the campaignTime string
    const timeParts = Time.split(" ")[0].split(":");
    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);
    const seconds = parseInt(timeParts[2]);

    // Create a new Date object by combining the campaignDate with the parsed time
    const DateTime = new Date(Date2);
    DateTime.setHours(hours);
    DateTime.setMinutes(minutes);
    DateTime.setSeconds(seconds);

    // Format campaignDateTime as "YYYY-MM-DD HH:mm:ss"
    const formattedDateTime = `${DateTime.getFullYear()}-${String(
      DateTime.getMonth() + 1
    ).padStart(2, "0")}-${String(DateTime.getDate()).padStart(2, "0")} ${String(
      DateTime.getHours()
    ).padStart(2, "0")}:${String(DateTime.getMinutes()).padStart(
      2,
      "0"
    )}:${String(DateTime.getSeconds()).padStart(2, "0")}`;

    return formattedDateTime;
  }

  const handleAddHashtag = () => {
    let captions = caption;
    captions += hashtags.join(" ");
    setCaption(captions);
  };

  const highlightHashtags = (text: string) => {
    // Regex to match hashtags
    const regex = /#\w+/g;
    // Replace hashtags with styled span
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

  const handleFinish = async () => {
    setLoading(true);
    try {
      const aptAmount = prizePool ? prizePool : 0 * 100000000;
      console.log(account?.address);
      const response = await signAndSubmitTransaction({
        sender: account?.address,
        data: {
          function:
            "0xf0c37761c0d644014c98bec8255d5836f13b4120b9059a0dab21a49355dded53::stream::create_campaign",
          typeArguments: ["0x1::aptos_coin::AptosCoin"],
          functionArguments: [aptAmount],
        },
      });

      try {
        let upload = {
          IpfsHash: "string",
        };
        if (selectedPlatform == "instagram") {
          upload = await pinata.upload.file(file);
        } else if (selectedPlatform == "twitter" && !retweet && tweetMedia) {
          console.log("hpgya")
          upload = await pinata.upload.file(tweetMedia);
        } else {
          upload.IpfsHash = "null";
        }
        console.log(upload);
        console.log(upload.IpfsHash);
        if (upload.IpfsHash) {
          const imageUrl = `${process.env.NEXT_PUBLIC_PINATA_ENDPOINT}/ipfs/${upload.IpfsHash}`;
          const currentDateTime = new Date();
          const campaignDateTime = formatDateTime(
            campaignDate ? campaignDate : currentDateTime,
            campaignTime ? campaignTime : "00:00:00"
          );
          const payoutDateTime = formatDateTime(
            payoutDate ? payoutDate : currentDateTime,
            payoutTime ? payoutTime : "00:00:00"
          );
          console.log(campaignDate);
          console.log(campaignTime);
          // Prepare data for the second API call
          const postData = {
            campaign_name: campaignName,
            company_name: "Aptos",
            campaign_description: description,
            start_time: formatDateTime(
              currentDateTime,
              currentDateTime.toTimeString()
            ),
            end_time: campaignDateTime,
            payout_time: payoutDateTime,
            prize_pool: prizePool,
            post: "yes",
            likes: likes ? "yes" : "no",
            minimum_likes: likesCount,
            followers: followers ? "yes" : "no",
            minimum_followers: followersCount,
          };
  
          // Define the request options for the second API call
          const postOptions: RequestInit = {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(postData),
            redirect: "follow",
          };
  
          // Perform the second fetch request
          const postResponse = await fetch(
            "http://localhost:5000/campaign",
            postOptions
          );
          const postResult = await postResponse.json(); // Parse the response as JSON
          console.log(postResult);
          if (!postResult.error) {
            const campaignId = postResult.data;
            // Prepare data for the third API call
            let postMediaData: {
              campaign_id: any;
              platform: string;
              media_type?: string;
              media_url?: string;
              caption?: string;
              tweet?: boolean;
              tweet_text?: string;
              tweet_media_url?: string;
              retweet?: boolean;
              retweet_url?: string;
              quote_tweet?: boolean;
              quote_tweet_url?: string;
            } = {
              campaign_id: campaignId,
              platform: selectedPlatform,
            };
            if (selectedPlatform == "instagram") {
              postMediaData.media_type = file.type.includes("video")
                ? "video"
                : "image";
              postMediaData.media_url = imageUrl;
              postMediaData.caption = caption;
            } else {
              if (retweet) {
                postMediaData.retweet = retweet;
                postMediaData.retweet_url = retweetUrl;
                postMediaData.quote_tweet = quoteTweet;
              } else {
                postMediaData.tweet = true;
                postMediaData.tweet_text = twitterText;
                if (tweetMedia) {
                  postMediaData.tweet_media_url = imageUrl;
                }
              }
            }
  
            const postOptions2: RequestInit = {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(postMediaData),
              redirect: "follow",
            };
  
            const taskResponse = await fetch(
              "http://localhost:5000/task",
              postOptions2
            );
            const taskResult = await taskResponse.json(); // Parse the response as JSON
            console.log(taskResult);
  
            if (!taskResult.error) {
              //////////
              toast({
                description: "Campaign created successfully!",
              });
  
              setLoading(false);
              router.push("/campaignDetails/" + campaignId);
              console.log("Campaign created successfully!");
            } else {
              toast({
                variant: "destructive",
                description: "Error while adding task",
              });
            }
            setLoading(false);
          } else {
            toast({
              variant: "destructive",
              description: "Error while creating campaign",
            });
          }
        } else {
          toast({
            variant: "destructive",
            description: "Error uploading file to Pinata",
          });
        }
      } catch (error) {
        console.error("Error uploading file to Pinata:", error);
        toast({
          variant: "destructive",
          description: "Error uploading file to Pinata",
        });
        setLoading(false);
      }

    } catch (error) {
      console.error("Error in wallet", error);
        toast({
          variant: "destructive",
          description: "Error in wallet transaction",
        });
        setLoading(false);
    }
  };

  const dialogContent = [
    {
      title: (
        <h1 className="text-[#273339] text-[36px] font-[800]">
          Let's get you started
        </h1>
      ),
      description: "Input Campaign name. Click next when you're done.",
      content: (
        <div className="flex flex-col my-4 gap-y-4">
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="name" className="text-[#5c686d] text-[12px]">
              CAMPAIGN NAME
            </Label>
            <Input
              id="name"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="What are you calling this campaign?"
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="description" className="text-[#5c686d] text-[12px]">
              DESCRIPTION
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your campaign in a few words"
            />
          </div>
        </div>
      ),
      footer: (
        <Button
          type="submit"
          className="px-[40px]"
          onClick={() => {
            if (campaignName) {
              setSteps(1);
            } else {
              toast({
                variant: "destructive",
                description: "Campaign Name required.",
              });
            }
          }}
        >
          Begin
        </Button>
      ),
    },
    {
      title: (
        <h1 className="text-[#273339] text-[36px] font-[800]">
          Select the Platform
        </h1>
      ),
      description: "Select the platform you want to create a campaign for.",
      content: (
        <div className="grid grid-cols-2 gap-6 my-[40px]">
          <div
            className={`flex flex-col cursor-pointer items-center justify-center gap-y-[10px] h-[140px] bg-white border border-gray-200 rounded-lg hover:shadow-md ${
              selectedPlatform == "twitter" && "shadow-md"
            }`}
            onClick={() => setSelectedPlatform("twitter")}
          >
            <img
              src="/assets/images/twitter1.png"
              alt="Twitter"
              className="h-[45px] rounded-[10px]"
            />
            <span className="font-[500] text-gray-800">Twitter</span>
          </div>
          <div
            className={`flex flex-col items-center cursor-pointer justify-center gap-y-[10px] h-[140px] bg-white border border-gray-200 rounded-lg hover:shadow-md ${
              selectedPlatform == "instagram" && "shadow-md"
            }`}
            onClick={() => setSelectedPlatform("instagram")}
          >
            <img
              src="/assets/images/instagram1.png"
              alt="Instagram"
              className="h-[45px] rounded-[10px]"
            />
            <span className="font-[500] text-gray-800">Instagram</span>
          </div>
        </div>
      ),
      footer: (
        <Button
          type="submit"
          className="px-[40px]"
          onClick={() => {
            if (selectedPlatform == "instagram") {
              setSteps(2);
            } else if (selectedPlatform == "twitter") {
              setSteps(4);
            } else {
              toast({
                variant: "destructive",
                description: "Select Platform before continuing.",
              });
            }
          }}
        >
          Next
        </Button>
      ),
    },
    {
      title: (
        <h1 className="text-[#273339] text-[36px] font-[800]">Add your post</h1>
      ),
      description:
        "Add media and caption for the post. Boost engagement with strategic hashtags! 📸✨",
      content: (
        <div className="flex flex-col my-4 gap-y-[25px]">
          <FileUploader
            handleChange={handleChange}
            name="file"
            types={["JPG", "PNG", "MP4", "MOV", "GIF"]}
            multiple={false}
            label="Upload or drop a photo / videos right here"
          />
          {file && (
            <div className="flex flex-col items-start p-2 bg-gray-100 border-[1px] rounded-lg shadow-sm">
              <div className="flex items-center space-x-2">
                <h1 className="text-sm">{file.name}</h1>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-y-[10px]">
            <div className="flex justify-between items-end">
              <Label htmlFor="caption" className="text-[#5c686d] text-[12px]">
                CAPTION
              </Label>
              <button
                className="text-[12px] rounded-full font-[400] bg-red-100 rounded-[5px] border-[1px] border-red-400 px-2 py-[2px]"
                onClick={handleAddHashtag}
              >
                Generate hashtags
              </button>
            </div>

            <Textarea
              id="caption"
              value={caption}
              onChange={(e) => {
                setCaption(e.target.value);
              }}
              placeholder="Write a caption for your post"
            />
          </div>
        </div>
      ),
      footer: (
        <div className="flex justify-between w-full gap-x-[10px] mt-[30px]">
          <Button
            type="submit"
            className="px-[40px] bg-white text-black border-[1px] border-gray-500 text-[16px] font-[400] hover:bg-gray-900 hover:text-white"
            onClick={() => setSteps(1)}
          >
            Back
          </Button>
          <Button
            type="submit"
            className="px-[40px] bg-blue-500 text-[16px] font-[400] hover:bg-blue-600"
            onClick={() => {
              if (file) {
                setSteps(3);
              } else {
                toast({
                  variant: "destructive",
                  description: "Photo or Video is required for post.",
                });
              }
            }}
          >
            Preview
          </Button>
        </div>
      ),
    },
    {
      title: "Preview",
      description: "",
      content: (
        <div className="flex flex-col justify-center items-center mb-[15px]">
          <div className="p-[10px] border-[1px] max-w-[320px] shadow-md rounded-[10px]">
            <div className="flex items-center gap-x-[20px] px-[10px] py-[5px] border-b-[1px]">
              <img className="h-[30px]" src="/assets/images/user.png"></img>
              <p className="font-bold">allstackers</p>
            </div>
            <div className="flex flex-col items-center justify-center bg-gray-200 h-[300px]">
              {file && (
                <>
                  {file.type.includes("video") ? (
                    <video
                      className="w-[100%]"
                      src={URL.createObjectURL(file)}
                      autoPlay={true}
                      loop={true}
                    ></video>
                  ) : (
                    <img
                      className="w-[100%] object-cover"
                      src={URL.createObjectURL(file)}
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
                  {caption.length > 0 ? (
                    highlightHashtags(caption)
                  ) : (
                    <em className="font-light">No Caption Added</em>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
      footer: (
        <div className="flex justify-between w-full gap-x-[10px]">
          <Button
            type="submit"
            className="px-[40px] bg-white text-black border-[1px] border-gray-500 text-[16px] font-[400] hover:bg-gray-600 hover:text-white"
            onClick={() => setSteps(2)}
          >
            Back
          </Button>
          <Button
            type="submit"
            className="px-[40px] bg-blue-500 text-[16px] font-[400] hover:bg-blue-600"
            onClick={() => setSteps(5)}
          >
            Next
          </Button>
        </div>
      ),
    },
    {
      title: (
        <h1 className="text-[#273339] text-[36px] font-[800]">Add post</h1>
      ),
      description:
        "Create article for the tweet. Boost engagement with strategic hashtags!",
      content: (
        <div className="flex flex-col gap-y-[25px]">
          <Tabs
            defaultValue={retweet ? "retweet" : "tweet"}
            onValueChange={(value) => {
              if (value === "retweet") {
                setRetweet(true);
              } else {
                setRetweet(false);
              }
              console.log(retweet);
            }}
          >
            <TabsList>
              <TabsTrigger value="tweet">
                <div className="flex items-center gap-x-[5px] text-black">
                  Tweet
                  <svg className="h-4" viewBox="0 0 24 24" aria-hidden="true">
                    <g>
                      <path d="M23 3c-6.62-.1-10.38 2.421-13.05 6.03C7.29 12.61 6 17.331 6 22h2c0-1.007.07-2.012.19-3H12c4.1 0 7.48-3.082 7.94-7.054C22.79 10.147 23.17 6.359 23 3zm-7 8h-1.5v2H16c.63-.016 1.2-.08 1.72-.188C16.95 15.24 14.68 17 12 17H8.55c.57-2.512 1.57-4.851 3-6.78 2.16-2.912 5.29-4.911 9.45-5.187C20.95 8.079 19.9 11 16 11zM4 9V6H1V4h3V1h2v3h3v2H6v3H4z"></path>
                    </g>
                  </svg>
                </div>
              </TabsTrigger>
              <TabsTrigger value="retweet">
                <div className="flex items-center gap-x-[5px]">
                  ReTweet
                  <svg viewBox="0 0 24 24" className="h-4">
                    <g>
                      <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path>
                    </g>
                  </svg>
                </div>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="tweet">
              <div className="flex flex-col pt-[10px] gap-y-[10px]">
                <div className="flex gap-x-[5px]">
                  <img
                    className="w-[30px] h-[30px]"
                    src="/assets/images/twitter.png"
                    alt="twitter"
                  />
                  <Textarea
                    className="focus-visible:ring-0 border-0 focus-visible:ring-transparent dark:focus-visible:ring-transparent"
                    value={twitterText}
                    placeholder="What is happening?!"
                    onChange={(e) => setTwitterText(e.target.value)}
                  />
                </div>
                {tweetMedia && (
                  <div className="flex flex-col items-start">
                    <img
                      className="border-[1px] rounded-lg shadow-sm"
                      src={URL.createObjectURL(tweetMedia)}
                    />
                  </div>
                )}

                <div className="p-[10px] border-t flex justify-between">
                  <div className="flex gap-x-[10px]">
                    <div>
                      <input
                        type="file"
                        ref={fileInputTwitterImage}
                        style={{ display: "none" }}
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files) {
                            setTweetMedia(e.target.files[0]);
                            console.log(e.target.files[0]);
                          }
                        }}
                      />
                      <div
                        className="cursor-pointer"
                        onClick={() => {
                          fileInputTwitterImage.current?.click();
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1"
                          stroke="currentColor"
                          className="w-6 h-6 cursor-pointer"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div
                      className="cursor-pointer"
                      onClick={() => {
                        fileInputTwitterImage.current?.click();
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1"
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12.75 8.25v7.5m6-7.5h-3V12m0 0v3.75m0-3.75H18M9.75 9.348c-1.03-1.464-2.698-1.464-3.728 0-1.03 1.465-1.03 3.84 0 5.304 1.03 1.464 2.699 1.464 3.728 0V12h-1.5M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
                        />
                      </svg>
                    </div>
                    <div>
                      <input
                        type="file"
                        ref={fileInputTwitterVideo}
                        style={{ display: "none" }}
                        accept="video/*"
                        onChange={(e) => {
                          if (e.target.files) {
                            setTweetMedia(e.target.files[0]);
                            console.log(e.target.files[0]);
                          }
                        }}
                      />
                      <div
                        className="cursor-pointer"
                        onClick={() => {
                          fileInputTwitterVideo.current?.click();
                        }}
                      >
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
                            d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <button
                    className="border border-blue-400 bg-blue-100 rounded-full px-[10px]"
                    // onClick={generateTwitterHastags}
                  >
                    Generate Hashtags
                  </button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="retweet">
              <div className="flex flex-col gap-y-[20px] pt-[20px]">
                <Input
                  className="focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:border-0 dark:focus-visible:ring-transparent"
                  placeholder="Paste your tweet url here (https://x.com/)"
                  value={retweetUrl}
                  onChange={(e) => setRetweetUrl(e.target.value)}
                />
                <div className="flex items-center space-x-4">
                  <Switch
                    id="quote_tweet"
                    onCheckedChange={(e: boolean) => {
                      setQuoteTweet(e);
                    }}
                  />
                  <Label htmlFor="quote_tweet">Quote Tweet Required?</Label>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ),
      footer: (
        <div className="flex justify-between w-full gap-x-[10px] mt-[30px]">
          <Button
            type="submit"
            className="px-[40px] bg-white text-black border-[1px] border-gray-500 text-[16px] font-[400] hover:bg-gray-900 hover:text-white"
            onClick={() => setSteps(1)}
          >
            Back
          </Button>
          <Button
            type="submit"
            className="px-[40px] bg-blue-500 text-[16px] font-[400] hover:bg-blue-600"
            onClick={() => {
              if (retweet && retweetUrl.length > 0) {
                setSteps(5);
              } else if (retweet) {
                toast({
                  variant: "destructive",
                  description: "Retweet URL cannot be empty",
                });
              } else if (twitterText.length > 0 || tweetMedia) {
                setSteps(5);
              } else {
                toast({
                  variant: "destructive",
                  description: "Tweet cannot be empty",
                });
              }
            }}
          >
            Next
          </Button>
        </div>
      ),
    },
    {
      title: (
        <h1 className="text-[#273339] text-[36px] font-[800]">
          Campaign Details.
        </h1>
      ),
      description: "Add details about this campaign.",
      content: (
        <div className="flex flex-col my-4 gap-y-4">
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="endTime" className="text-[#5c686d] text-[12px]">
              When will this campaign end?
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !campaignDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {campaignDate ? (
                    format(campaignDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="flex w-auto flex-col space-y-2 p-2">
                <Select
                  onValueChange={(value) =>
                    setCampaignDate(addDays(new Date(), parseInt(value)))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="0">Today</SelectItem>
                    <SelectItem value="1">Tomorrow</SelectItem>
                    <SelectItem value="3">In 3 days</SelectItem>
                    <SelectItem value="7">In a week</SelectItem>
                  </SelectContent>
                </Select>
                <div className="rounded-md border">
                  <Calendar
                    mode="single"
                    selected={campaignDate}
                    onSelect={setCampaignDate}
                  />
                </div>
              </PopoverContent>
            </Popover>
            <CTimePicker
              className="w-[280px] text-[12px]"
              color="blue"
              size="sm"
              onTimeChange={(e) => (e ? setCampaignTime(e) : "")}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="endTime" className="text-[#5c686d] text-[12px]">
              When is the payout date?
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !payoutDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {payoutDate ? (
                    format(payoutDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="flex w-auto flex-col space-y-2 p-2">
                <Select
                  onValueChange={(value) =>
                    setPayoutDate(addDays(new Date(), parseInt(value)))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="0">Today</SelectItem>
                    <SelectItem value="1">Tomorrow</SelectItem>
                    <SelectItem value="3">In 3 days</SelectItem>
                    <SelectItem value="7">In a week</SelectItem>
                  </SelectContent>
                </Select>
                <div className="rounded-md border">
                  <Calendar
                    mode="single"
                    selected={payoutDate}
                    onSelect={setPayoutDate}
                  />
                </div>
              </PopoverContent>
            </Popover>
            <CTimePicker
              className="w-[280px] text-[12px]"
              color="blue"
              size="sm"
              onTimeChange={(e) => setPayoutTime(e ?? "")}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="description" className="text-[#5c686d] text-[12px]">
              Pool Size (APT)
            </Label>
            <div className="flex items-center gap-x-[10px]">
              <Input
                id="poolSize"
                type="number"
                placeholder="Enter the prize pool"
                value={prizePool}
                onChange={(e) => setPrizePool(parseInt(e.target.value))}
              />
              <img
                className="rounded-full h-[35px]"
                src="/assets/images/aptos.png"
              />
            </div>
          </div>
        </div>
      ),
      footer: (
        <div className="flex mt-[30px] justify-between w-full gap-x-[10px] mt-[30px]">
          <Button
            type="submit"
            className="px-[40px] bg-white text-black border-[1px] border-gray-500 text-[16px] font-[400] hover:bg-gray-900 hover:text-white"
            onClick={() => {
              if (selectedPlatform == "instagram") setSteps(3);
              else if (selectedPlatform == "twitter") setSteps(4);
            }}
          >
            Back
          </Button>
          <Button
            type="submit"
            className="px-[40px] bg-blue-500 text-[16px] font-[400] hover:bg-blue-600"
            onClick={() => {
              console.log(campaignDate, payoutDate);
              if (campaignDate && payoutDate) {
                if (prizePool && prizePool > 0) {
                  setSteps(6);
                } else {
                  toast({
                    variant: "destructive",
                    description: "Prize pool must be greater than 0",
                  });
                }
              } else {
                toast({
                  variant: "destructive",
                  description: "Payout date or campaign date is invalid",
                });
              }
            }}
          >
            Next
          </Button>
        </div>
      ),
    },
    {
      title: (
        <h1 className="text-[#273339] text-[36px] font-[800]">
          Campaign Details.
        </h1>
      ),
      description: "Add details about this campaign.",
      content: (
        <div className="flex flex-col mt-2 gap-y-4">
          <div className="flex flex-col gap-y-4">
            <Label htmlFor="endTime" className="text-[#273339] text-[14px]">
              What is the campaign payout criteria?
            </Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="likes"
                onCheckedChange={(e) => {
                  setLikes(e);
                  console.log(likes);
                }}
              />
              <Label htmlFor="likes">Likes</Label>
            </div>
            {likes && (
              <div className="flex flex-col gap-y-[5px]">
                <Label
                  htmlFor="likesCount"
                  className="text-[#5c686d] text-[12px]"
                >
                  Minimum number of likes required for payout
                </Label>
                <Input
                  id="likesCount"
                  type="number"
                  value={likesCount}
                  onChange={(e) => setLikesCount(parseInt(e.target.value))}
                />
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Switch id="followers" onCheckedChange={(e) => setFollowers(e)} />
              <Label htmlFor="followers">Followers</Label>
            </div>
            {followers && (
              <div className="flex flex-col gap-y-[5px]">
                <Label
                  htmlFor="followersCount"
                  className="text-[#5c686d] text-[12px]"
                >
                  Minimum followers required to participate
                </Label>
                <Input
                  id="followersCount"
                  type="number"
                  value={followersCount}
                  onChange={(e) => setFollowersCount(parseInt(e.target.value))}
                />
              </div>
            )}
          </div>
        </div>
      ),
      footer: (
        <div className="flex justify-between w-full gap-x-[10px] mt-[30px]">
          <Button
            type="submit"
            className="px-[40px] bg-white text-black border-[1px] border-gray-500 text-[16px] font-[400] hover:bg-gray-900 hover:text-white"
            onClick={() => setSteps(5)}
          >
            Back
          </Button>
          <Button
            type="submit"
            className="px-[40px] bg-blue-500 text-[16px] font-[400] hover:bg-blue-600"
            onClick={handleFinish}
          >
            {loading ? (
              <ScaleLoader color="#fff" loading={loading} />
            ) : (
              "Finish"
            )}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Dialog>
        <div className="flex flex-col justify-center items-center bg-[#f0f5f5] min-h-[calc(100vh-80px)]">
          <div className="flex flex-col justify-center items-center max-w-[600px]">
            <h1 className="font-[800] text-[#273339] text-[48px] leading-[55px]">
              Create a campaign!
            </h1>
            <p className="mt-[25px] text-center text-[20px] text-[#5c686d] leading-[30px] font-[400]">
              The only thing that can match the thrill of attending a hackathon
              is the exhilaration of organizing one yourself! Join 100s of other
              hackathons on Devfolio and manage your applications, submissions,
              comms, reimbursements, and judging, all on our platform.
            </p>
            <DialogTrigger asChild>
              <button className="mt-[40px] bg-[#5768FF] text-white font-[500] text-[24px] py-[10px] px-[40px] rounded-[5px]">
                Create your campaign on StreamAd
              </button>
            </DialogTrigger>
          </div>
        </div>
        <DialogContent
          className="max-w-[576px] w-fit max-h-[90vh] scrollbar-hide overflow-y-auto p-[64px] py-[48px]"
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{dialogContent[steps].title}</DialogTitle>
            <DialogDescription>
              {dialogContent[steps].description}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">{dialogContent[steps].content}</div>
          <DialogFooter>{dialogContent[steps].footer}</DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Create;
