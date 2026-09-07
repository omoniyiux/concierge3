import type { ComponentType } from "react";
import {
  AppleCalendarMark,
  CalendlyMark,
  ExcelMark,
  FacebookMark,
  GitHubMark,
  GmailMark,
  GoogleAdsMark,
  GoogleAnalyticsMark,
  GoogleCalendarMark,
  GoogleDocsMark,
  GoogleDriveMark,
  GoogleMapsMark,
  GoogleMeetMark,
  GoogleSheetsMark,
  GoogleTasksMark,
  InstagramMark,
  LinkedInMark,
  NotionMark,
  OutlookCalendarMark,
  OutlookMailMark,
  SearchConsoleMark,
  SquareMark,
  YouTubeMark,
  ZoomMark,
} from "@/components/icons/brands";

export const USER = {
  name: "Olaifa Promise",
  firstName: "Olaifa",
  email: "olaifapromise1@gmail.com",
  avatar: "/avatar.jpg",
  plan: "Free Plan",
  renews: "Renews 6 Oct 2026",
  monthlyUsed: 0,
  monthlyTotal: 500,
  dailyUsed: 0,
  dailyTotal: 100,
  agentRunsLeft: 2,
};

export const THREADS = [
  { id: "business-space-setup", title: "Business Space Setup" },
  { id: "gmail-connection", title: "Gmail Connection and Business Overview" },
];

export type Connector = {
  id: string;
  name: string;
  description: string;
  Mark: ComponentType<{ size?: number; className?: string }>;
  connected?: boolean;
};

export const CONNECTORS: Connector[] = [
  { id: "gmail", name: "Gmail", description: "Read, send and organize email in your Gmail inbox.", Mark: GmailMark },
  { id: "google-calendar", name: "Google Calendar", description: "Let your agent see your availability and manage bookings.", Mark: GoogleCalendarMark },
  { id: "outlook-calendar", name: "Outlook Calendar", description: "Let your agent see your availability and manage bookings.", Mark: OutlookCalendarMark },
  { id: "apple-calendar", name: "Apple Calendar", description: "Let your agent see your availability and manage bookings.", Mark: AppleCalendarMark },
  { id: "instagram", name: "Instagram", description: "Instagram is a social media platform for photos and video.", Mark: InstagramMark },
  { id: "facebook", name: "Facebook", description: "Facebook is a social media and advertising platform.", Mark: FacebookMark },
  { id: "linkedin", name: "LinkedIn", description: "Post updates and manage your LinkedIn presence.", Mark: LinkedInMark },
  { id: "google-drive", name: "Google Drive", description: "Access and manage files in your Google Drive.", Mark: GoogleDriveMark },
  { id: "google-sheets", name: "Google Sheets", description: "Read and update spreadsheets in Google Sheets.", Mark: GoogleSheetsMark },
  { id: "youtube", name: "YouTube", description: "YouTube is a video-sharing platform with a global audience.", Mark: YouTubeMark },
  { id: "google-docs", name: "Google Docs", description: "Create and edit documents in Google Docs.", Mark: GoogleDocsMark },
  { id: "google-analytics", name: "Google Analytics", description: "Google Analytics tracks and reports website traffic.", Mark: GoogleAnalyticsMark },
  { id: "search-console", name: "Google Search Console", description: "Google Search Console provides tools to monitor search performance.", Mark: SearchConsoleMark },
  { id: "google-maps", name: "Google Maps", description: "Integrate Google Maps to access location data and places.", Mark: GoogleMapsMark },
  { id: "outlook-mail", name: "Outlook Mail", description: "Read, send and organize email in your Outlook inbox.", Mark: OutlookMailMark },
  { id: "notion", name: "Notion", description: "Read and update pages and databases in your workspace.", Mark: NotionMark },
  { id: "google-meet", name: "Google Meet", description: "Google Meet is a secure video conferencing service.", Mark: GoogleMeetMark },
  { id: "zoom", name: "Zoom", description: "Zoom is a video conferencing and online meeting platform.", Mark: ZoomMark },
  { id: "github", name: "GitHub", description: "Manage issues, pull requests and repositories.", Mark: GitHubMark },
  { id: "calendly", name: "Calendly", description: "Calendly is an appointment scheduling platform.", Mark: CalendlyMark },
  { id: "google-ads", name: "Google Ads", description: "Google Ads, is an online advertising platform by Google.", Mark: GoogleAdsMark },
  { id: "google-tasks", name: "Google Tasks", description: "Create and complete tasks in Google Tasks.", Mark: GoogleTasksMark },
  { id: "excel", name: "Excel", description: "Read and update workbooks in Microsoft Excel.", Mark: ExcelMark },
  { id: "square", name: "Square", description: "Square handles payments, invoices and point of sale.", Mark: SquareMark },
];

export const AVAILABLE_COUNT = 66;
