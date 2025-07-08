// import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts";
import { ResponsiveToastManager } from "@/shared-components/ResponsiveToastManager";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// export async function generateMetadata(): Promise<Metadata> {
//   return {
//     // metadataBase: new URL("<YOUR-APP-URL>"),
//     manifest: "/manifest.json",
//     title: "<YOUR-APP-TITLE>",
//     description: "<YOUR-APP-DESCRIPTION>",
//     applicationName: "<YOUR-APP-NAME>",

//     // Mobile web app configuration
//     appleWebApp: {
//       capable: true,
//       statusBarStyle: "default",
//       title: "<YOUR-APP-NAME>",
//     },
//     formatDetection: {
//       telephone: false,
//     },

//     // Social sharing metadata
//     openGraph: {
//       type: "website",
//       siteName: "<YOUR-APP-NAME>",
//       title: {
//         default: "<YOUR-APP-TITLE>",
//         template: "<YOUR-APP-TITLE-TEMPLATE>",
//       },
//       description: "<YOUR-APP-DESCRIPTION>",
//       images: [
//         {
//           url: "/images/social-preview.jpg",
//           width: 1200,
//           height: 630,
//           alt: "<YOUR-APP-ALT-TEXT>",
//         },
//       ],
//     },
//     twitter: {
//       card: "summary_large_image",
//       title: {
//         default: "<YOUR-APP-TITLE>",
//         template: "<YOUR-APP-TITLE-TEMPLATE>",
//       },
//       description: "<YOUR-APP-DESCRIPTION>",
//       images: [
//         {
//           url: "/images/social-preview.jpg",
//           width: 1200,
//           height: 630,
//           alt: "<YOUR-APP-ALT-TEXT>",
//         },
//       ],
//     },
//     icons: {
//       icon: [
//         { url: "/<YOUR-ICON>.svg", sizes: "any" },
//         { url: "/favicon.ico", sizes: "any" },
//       ],
//       apple: [{ url: "/images/app-icons/180x180.png", sizes: "180x180" }],
//     },

//     keywords: [
//       "<YOUR-KEYWORD-1>",
//       "<YOUR-KEYWORD-2>",
//       "<YOUR-KEYWORD-3>",
//       // ...add more as needed
//     ],
//   };
// }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col w-full h-screen`}>
        <AuthProvider>{children}</AuthProvider>
        <ResponsiveToastManager />
      </body>
    </html>
  );
}
