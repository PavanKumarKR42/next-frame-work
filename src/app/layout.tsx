import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TYBG Dice Game',
  description: 'Predict & Win 1 TYBG Token on Base',
  metadataBase: new URL('https://next-frame-work.vercel.app/'),
  openGraph: {
    title: 'TYBG Dice Game',
    description: 'Predict & Win 1 TYBG Token on Base',
    images: ['/preview.png'],
  },
  other: {
    'fc:miniapp': JSON.stringify({
      version: "1",
      imageUrl: "https://dice-game-nine-ruby.vercel.app/preview.png",
      button: {
        title: "PLAY DICE GAME",
        action: {
          type: "launch_frame",
          name: "TYBG Dice",
          url: "https://next-frame-work.vercel.app/",
          splashImageUrl: "https://dice-game-nine-ruby.vercel.app/splash.png",
          splashBackgroundColor: "#7c3aed"
        }
      }
    })
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}