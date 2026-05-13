import { Metadata } from "next";
import ChopperClient from "./ChopperClient";

export const metadata: Metadata = {
  title: "Precision Chopper | Free Online Image Cropper & Resizer",
  description: "Built by Martie. Crop and resize your images with precision. Keep PNG transparency and download high-quality assets for free.",
  openGraph: {
    title: "Precision Chopper | Free Online Image Cropper & Resizer",
    description: "Built by Martie. Crop and resize your images with precision. Keep PNG transparency and download high-quality assets for free.",
    images: ["/brand/logo.png"],
  },
};

export default function PrecisionChopperPage() {
  return <ChopperClient />;
}
