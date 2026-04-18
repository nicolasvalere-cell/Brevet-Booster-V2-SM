export const metadata = {
  title: 'Brevet Booster V2',
  description: 'Plateforme de révision brevet maths',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
