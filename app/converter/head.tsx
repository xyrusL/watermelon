export default function Head() {
  const title = "GIF & Image Converter | Watermelon SMP Tools";
  const description =
    "Convert videos to GIFs and images to different formats using Watermelon SMP's browser-based converter.";
  const url = "https://watermelon.deze.me/converter";
  const image = "https://watermelon.deze.me/imageframe-bg.png";

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </>
  );
}
