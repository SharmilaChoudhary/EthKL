"use client";
import React, { useEffect, useState } from "react";
const calculateTimeLeft = (
  endTime: number
): { days: number; hours: number; minutes: number; seconds: number } => {
  const now = new Date().getTime();
  const distance = endTime - now;

  if (distance < 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
};
const Timer = ({end_time}: {end_time: number | string}) => {
  const [endTime, setEndTime] = useState(
    new Date().getTime() + 1000 * 60 * 60 * 48
  ); // 2 days from now
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endTime));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  useEffect(() => {
    if (end_time) {
      const endTime = new Date(end_time).getTime();
      setEndTime(endTime);
    }
  }, [end_time]);

  return (
    <div className="mt-2 bg-gray-100 border w-[60%] ml-[25px] h-20 border-gray-200 rounded-lg p-4 mb-[25px]">
      <div className="text-xs text-gray-400 font-bold mb-2">
        APPLICATIONS CLOSES IN
      </div>
      <div className="text-md font-semibold mt-3">
        {`${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s left`}
      </div>
    </div>
  );
};

export default Timer;
