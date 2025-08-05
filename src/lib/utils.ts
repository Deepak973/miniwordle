import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Manifest } from "@farcaster/miniapp-core/src/manifest";
import {
  APP_BUTTON_TEXT,
  APP_DESCRIPTION,
  APP_ICON_URL,
  APP_NAME,
  APP_OG_IMAGE_URL,
  APP_PRIMARY_CATEGORY,
  APP_SPLASH_BACKGROUND_COLOR,
  APP_SPLASH_URL,
  APP_TAGS,
  APP_URL,
  APP_WEBHOOK_URL,
  APP_ACCOUNT_ASSOCIATION,
} from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getMiniAppEmbedMetadata(ogImageUrl?: string) {
  return {
    version: "next",
    imageUrl: ogImageUrl ?? APP_OG_IMAGE_URL,
    ogTitle: APP_NAME,
    ogDescription: APP_DESCRIPTION,
    ogImageUrl: ogImageUrl ?? APP_OG_IMAGE_URL,
    button: {
      title: APP_BUTTON_TEXT,
      action: {
        type: "launch_frame",
        name: APP_NAME,
        url: APP_URL,
        splashImageUrl: APP_SPLASH_URL,
        iconUrl: APP_ICON_URL,
        splashBackgroundColor: APP_SPLASH_BACKGROUND_COLOR,
        description: APP_DESCRIPTION,
        primaryCategory: APP_PRIMARY_CATEGORY,
        tags: APP_TAGS,
      },
    },
  };
}

export async function getFarcasterDomainManifest(): Promise<Manifest> {
  return {
    accountAssociation: APP_ACCOUNT_ASSOCIATION!,
    miniapp: {
      version: "1",
      name: APP_NAME ?? "Neynar Starter Kit",
      homeUrl: APP_URL,
      iconUrl: APP_ICON_URL,
      imageUrl: APP_OG_IMAGE_URL,
      buttonTitle: APP_BUTTON_TEXT ?? "Launch Mini App",
      splashImageUrl: APP_SPLASH_URL,
      splashBackgroundColor: APP_SPLASH_BACKGROUND_COLOR,
      webhookUrl: APP_WEBHOOK_URL,
    },
  };
}

export async function isValidWord(word: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`
    );

    if (!response.ok) {
      // If response is not ok (404, etc.), check if it's the "No Definitions Found" error
      if (response.status === 404) {
        return false;
      }
      // For other errors, we'll assume the word is valid to avoid blocking gameplay
      return true;
    }

    const data = await response.json();

    // If we get an array with definitions, the word exists
    if (Array.isArray(data) && data.length > 0) {
      return true;
    }

    // If we get the "No Definitions Found" object, the word doesn't exist
    if (data.title === "No Definitions Found") {
      return false;
    }

    // Default to true for any other response
    return true;
  } catch (error) {
    console.error("Error checking word validity:", error);
    // In case of network error, assume word is valid to avoid blocking gameplay
    return true;
  }
}
