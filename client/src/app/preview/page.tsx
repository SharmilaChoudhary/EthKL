"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import TwitterPreview from "@/components/TwitterPreview";

const TwitterPreview2: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <TwitterPreview url="https://x.com/nillionnetwork/status/1829166999119040588" />
    </div>
  );
};

export default TwitterPreview2;
