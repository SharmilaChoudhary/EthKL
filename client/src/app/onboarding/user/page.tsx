"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useState, useEffect } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";

import { useWallet, WalletName } from "@aptos-labs/wallet-adapter-react";

import { ScaleLoader } from "react-spinners";


const Onboarding = () => {
  const { toast } = useToast();
  const { account, connect, connected, wallet, changeNetwork, isLoading } = useWallet();
  const [checkedWallet, setCheckedWallet] = useState("");
  const [connectedWallet, setConnectedWallet] = useState(false);
  const [step, setStep] = useState(0);
  const [twitterStatus, setTwitterStatus] = useState(false); // To store the fetched data
  const [loading, setLoading] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(isLoading);

  const handleLogin = async () => {
    const walletAddress = account?.address; // Replace with actual wallet address logic
    try {
      // Redirect to Flask backend with wallet address
      window.location.href = `http://127.0.0.1:5000/login?wallet_address=${walletAddress}`;
    } catch (error) {
      console.error("Error initiating login:", error);
    }
  };

  const getAptosWallet = async () => {
    setLoading(true);
    if (connected == false) {
      try {
        await connect("Petra" as WalletName<"Petra">);
        setStep(2);
        setConnectedWallet(true);
        console.log("Connected to wallet:", account);
        console.log(connected);
        setStep(2);
      } catch (error) {
        console.error("Failed to connect to wallet:", error);
      }
    } else {
      console.log("Wallet already connected:", account);
      setConnectedWallet(true);
      setStep(2);
    }
    setLoading(false);
    console.log("account", account);
  };

  useEffect(() => {

    const fetchTwitterStatus = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/twitter_status?wallet_address=${account?.address}`,
          {
            method: "GET",
            redirect: "follow",
          }
        );
        const data = await response.json();
        console.log("Data:", data);
        setTwitterStatus(data.status);
      } catch (error) {
        console.error("Error fetching Twitter status:", error);
      }
    };

    if (connected) {
      setConnectedWallet(true);
      console.log("Wallet selected: ", account);
      setStep(2);
      fetchTwitterStatus();
    } else {
      setStep(1);
    }
  }, [connected]); // Add checkedWallet as a dependency
  useEffect(() => {
    setIsLoadingPage(isLoading);
  }, [isLoading]);
  console.log(isLoadingPage);
  console.log(isLoading);
  return (
    <div className="min-h-[calc(100vh-100px)] bg-[#f5f7f7] flex flex-col justify-center items-center">
      <div className="flex flex-col py-[20px] max-w-[500px] gap-y-[30px] justify-center items-center">
        <div className="flex items-center min-w-[80%] gap-x-[15px]">
          <span className="flex items-center justify-center font-[500] text-white rounded-full bg-blue-500 min-w-[30px] min-h-[30px]">
            {step == 1 ? "1" : "✓"}
          </span>
          <span className="w-full h-[1px] border-[1px]"></span>
          <span className="flex items-center justify-center font-[500] text-white rounded-full bg-blue-500 min-w-[30px] min-h-[30px]">
            {step <= 2 ? "2" : "✓"}
          </span>
        </div>
        {step == 1 ? (
          <Card className="w-[450px]">
            <CardHeader>
              <CardTitle>Connect your wallet</CardTitle>
              <CardDescription>
                Select what network and wallet your want to connect below
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-y-[15px]">
              <h1 className="text-[18px] font-[600]">Choose Wallet</h1>
              <div className="grid grid-cols-3 gap-4">
                <div
                  className={`flex flex-col cursor-pointer items-center justify-center gap-y-[5px] p-2 bg-white border border-gray-200 rounded-lg hover:shadow-md ${
                    checkedWallet == "petra" ? "shadow-md" : "shadow-sm"
                  }`}
                  onClick={() => setCheckedWallet("petra")}
                >
                  <img
                    src="/assets/images/petra.png"
                    alt="Petra"
                    className="h-[45px] rounded-[10px]"
                  />
                  <span className="text-gray-800 font-medium">Petra</span>
                </div>
                <div
                  className={`flex flex-col cursor-pointer items-center justify-center gap-y-[5px] p-2 bg-white border border-gray-200 rounded-lg hover:shadow-md ${
                    checkedWallet == "aptos" ? "shadow-md" : "shadow-sm"
                  }`}
                  onClick={() => setCheckedWallet("aptos")}
                >
                  <img
                    src="/assets/images/aptos_wallet.png"
                    alt="Aptos"
                    className="h-[45px] rounded-[10px]"
                  />
                  <span className="text-gray-800 font-medium">Atos Wallet</span>
                </div>
                <div
                  className={`flex flex-col cursor-pointer items-center justify-center gap-y-[5px] p-2 bg-white border border-gray-200 rounded-lg hover:shadow-md ${
                    checkedWallet == "fewcha" ? "shadow-md" : "shadow-sm"
                  }`}
                  onClick={() => setCheckedWallet("fewcha")}
                >
                  <img
                    src="/assets/images/fewcha.png"
                    alt="fewcha"
                    className="h-[45px] rounded-[10px]"
                  />
                  <span className="text-gray-800 font-medium">Fewcha</span>
                </div>
                <div
                  className={`flex flex-col cursor-pointer items-center justify-center gap-y-[5px] p-2 bg-white border border-gray-200 rounded-lg hover:shadow-md ${
                    checkedWallet == "pontem" ? "shadow-md" : "shadow-sm"
                  }`}
                  onClick={() => setCheckedWallet("pontem")}
                >
                  <img
                    src="/assets/images/pontem.png"
                    alt="Pontem"
                    className="h-[45px] rounded-[10px]"
                  />
                  <span className="text-gray-800 font-medium">Pontem</span>
                </div>
                <div
                  className={`flex flex-col cursor-pointer items-center justify-center gap-y-[5px] p-2 bg-white border border-gray-200 rounded-lg hover:shadow-md ${
                    checkedWallet == "rise" ? "shadow-md" : "shadow-sm"
                  }`}
                  onClick={() => setCheckedWallet("rise")}
                >
                  <img
                    src="/assets/images/rise.png"
                    alt="Rise"
                    className="h-[45px] rounded-[10px]"
                  />
                  <span className="text-gray-800 font-medium">Rise</span>
                </div>
                <div
                  className={`flex flex-col cursor-pointer items-center justify-center gap-y-[5px] p-2 bg-white border border-gray-200 rounded-lg hover:shadow-md ${
                    checkedWallet == "martian" ? "shadow-md" : "shadow-sm"
                  }`}
                  onClick={() => setCheckedWallet("martian")}
                >
                  <img
                    src="/assets/images/martian.png"
                    alt="Ledger"
                    className="h-[45px] rounded-[10px]"
                  />
                  <span className="text-gray-800 font-medium">Martian</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex flex-col space-[10px] w-full">
                <div className="font-[600] text-[15px] flex flex-col space-y-[5px]">
                  <p>
                    Accept{" "}
                    <span className="text-blue-800">Terms of Services</span> and{" "}
                    <span className="text-blue-800">Privacy Policy</span>
                  </p>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" />
                    <label className="text-[13px]" htmlFor="terms">
                      I read and accept
                    </label>
                  </div>
                </div>
                <div className="flex justify-center w-full">
                  <button
                    className="bg-blue-600 hover:bg-blue-700 w-[200px] text-white font-[600] py-2 rounded-lg w-full mt-4"
                    onClick={() => setStep(2)}
                  >
                    Connect Wallet
                  </button>
                </div>
              </div>
            </CardFooter>
          </Card>
        ) : (
          <Card className="w-[450px]">
            <CardHeader>
              <CardTitle>Connect social media account</CardTitle>
              <CardDescription>
                Connect to manage your accout from this app
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-y-[20px]">
                <div className="flex items-center gap-x-[20px]">
                  <div className="p-[5px] bg-white border border-gray-200 rounded-lg hover:shadow-md">
                    <img
                      src="/assets/images/twitter1.png"
                      alt="Petra"
                      className="h-[45px] rounded-[10px]"
                    />
                  </div>
                  {twitterStatus == true ? (
                    <div className="bg-green-500 flex justify-center items-center text-white rounded-full w-[30px] h-[30px]">
                      ✓
                    </div>
                  ) : (
                    <button
                      className="h-[30px]  text-white bg-blue-500 rounded-full px-[15px] border border-blue-500"
                      onClick={handleLogin}
                    >
                      Connect
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-x-[20px]">
                  <div className="p-[5px] bg-white border border-gray-200 rounded-lg hover:shadow-md">
                    <img
                      src="/assets/images/instagram1.png"
                      alt="Instagram"
                      className="h-[45px] rounded-[10px]"
                    />
                  </div>
                  <button
                    className="h-[30px]  text-white bg-blue-500 rounded-full px-[15px] border border-blue-500"
                    onClick={() =>
                      toast({
                        variant: "destructive",
                        description: "Instagram feature is not supported yet!",
                      })
                    }
                  >
                    Connect
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <button
                className="bg-blue-600 hover:bg-blue-700 w-[150px] text-white font-[600] py-2 rounded-lg w-full mt-4"
                onClick={() => setStep(3)}
              >
                Next
              </button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
