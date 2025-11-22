import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    "accountAssociation": {
    "header": "eyJmaWQiOjI4NDcxMywidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDBDN2FmZDk5OEY1MDY5ZkM1RTMxZWVmREM2RkZBODdlMzExYWIyM0MifQ",
    "payload": "eyJkb21haW4iOiJmOGQ5MzI1Yy0xYmU2LTQ2YTQtOTZjZi0yOGRjMjY1YjgzMy52ZXJjZWwuYXBwIn0",
    "signature": "KneZHsHI2x+NfPfVeGkY3weFuDmgHcPmy+oxY2XIm5pk9v4di+jBZdMt3XIh6E7e3oTKGiUaJi+axoB7wIe0lBs="
  },
    "frame": {
      "version": "1",
      "name": "TYBG Dice Game",
      "iconUrl": "https://dice-game-nine-ruby.vercel.app/splash.png",
      "homeUrl": "https://f8d9325c-1be6-46a4-96cf-28dc265b833.vercel.app/",
      "imageUrl": "https://dice-game-nine-ruby.vercel.app/preview.png",
      "buttonTitle": "Play Dice Game!",
      "splashImageUrl": "https://dice-game-nine-ruby.vercel.app/splash.png",
      "splashBackgroundColor": "#7c3aed",
      "webhookUrl": "https://api.neynar.com/f/app/1a6c0738-43e3-4629-8d0c-305f05bf120c/event"
    }
  };
  
  return NextResponse.json(manifest);
}