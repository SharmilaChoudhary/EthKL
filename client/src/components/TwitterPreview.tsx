"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

const TwitterPreview = ({ url: urlProps }: { url: string }) => {
  const [url, setUrl] = useState<string>(urlProps);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  const fetchPreview = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/fetch-oembed", {
        params: { url },
      });
      console.log("Backend Response:", response.data);
      setPreviewHtml(response.data.html); // Set the HTML for preview
    } catch (err: any) {
      console.log(`Error: ${err.response?.statusText || "Unknown error"}`);
    }
  };

  // Function to load the Twitter widgets script
  const loadTwitterWidgets = () => {
    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    document.body.appendChild(script);
  };

  // Use effect to load the script when previewHtml is updated
  useEffect(() => {
    fetchPreview();
  }, [url]);

  useEffect(() => {
    if (previewHtml) {
      loadTwitterWidgets();
    }
  }, [previewHtml]);
  return (
    <div>
      {previewHtml && (
        <div
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      )}
    </div>
  );
};

export default TwitterPreview;
