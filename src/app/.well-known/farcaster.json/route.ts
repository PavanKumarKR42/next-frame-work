import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    "accountAssociation": {
      "header": "eyJmaWQiOjI4NDcxMywidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDBDN2FmZDk5OEY1MDY5ZkM1RTMxZWVmREM2RkZBODdlMzExYWIyM0MifQ",
      "payload": "eyJkb21haW4iOiJkaWNlLWdhbWUtbmluZS1ydWJ5LnZlcmNlbC5hcHAifQ",
      "signature": "0vFWclNz2A3SeB33mLQFTdkilc/MierA7H8KwA3lE1EGEAEeY4GO/0OvijFVJmRMU3hZOupgUSJD/hrjYT0NRxs="
    },
    "frame": {
      "version": "1",
      "name": "TYBG Dice Game",
      "iconUrl": "https://dice-game-nine-ruby.vercel.app/splash.png",
      "homeUrl": "https://next-frame-work.vercel.app/",
      "imageUrl": "https://dice-game-nine-ruby.vercel.app/preview.png",
      "buttonTitle": "Play Dice Game!",
      "splashImageUrl": "https://dice-game-nine-ruby.vercel.app/splash.png",
      "splashBackgroundColor": "#7c3aed",
      "webhookUrl": "https://api.neynar.com/f/app/1a6c0738-43e3-4629-8d0c-305f05bf120c/event"
    }
  };
  
  return NextResponse.json(manifest);
}