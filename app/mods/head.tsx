export default function Head() {
  const url = "https://watermelon.deze.me/tools";

  return (
    <>
      <title>Redirecting to Tools | Watermelon SMP</title>
      <meta name="robots" content="noindex,follow" />
      <link rel="canonical" href={url} />
      <meta httpEquiv="refresh" content="0;url=https://watermelon.deze.me/tools" />
    </>
  );
}
