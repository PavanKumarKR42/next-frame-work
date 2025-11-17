import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    "accountAssociation": {
    "header": "eyJmaWQiOjI4NDcxMywidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDBDN2FmZDk5OEY1MDY5ZkM1RTMxZWVmREM2RkZBODdlMzExYWIyM0MifQ",
    "payload": "eyJkb21haW4iOiJiYXNlLWFwcDEudmVyY2VsLmFwcCJ9",
    "signature": "8HuCbXG7VGDdzjuFF6s2k8w+tPRsd9zUht4xIzGxo2Bf8Rljcr7C7GBJyfZ+JTlV95GGWbrEOT5Ukk7r3PqkJRw="
  },
    frame: {
      version: "1",
      name: "BRAIN.exe!",
      iconUrl: "https://mindgame-omega.vercel.app/splash.png",
      homeUrl: "https://mindgame-omega.vercel.app",
      imageUrl: "https://mindgame-omega.vercel.app/image.png",
      buttonTitle: "Test Memory!",
      splashImageUrl: "https://mindgame-omega.vercel.app/splash.png",
      splashBackgroundColor: "#ffd753",
      webhookUrl: "https://api.neynar.com/f/app/1a6c0738-43e3-4629-8d0c-305f05bf120c/event"
    }
  };

  return NextResponse.json(manifest);
}