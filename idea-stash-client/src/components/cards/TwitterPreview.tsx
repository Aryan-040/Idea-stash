export function TwitterPreview() {
  // prefer a dedicated preview PNG if available, otherwise fall back to platform twitter.png
  const previewSrc = "/assets/platforms/twitter-preview.png";
  const fallback = "/assets/platforms/twitter.png";
  return (
    <div className="w-full h-full bg-black flex items-center justify-center">
      <img src={previewSrc} onError={(e) => { (e.currentTarget as HTMLImageElement).src = fallback; }} alt="Twitter preview" style={{ width: 80, height: 80, objectFit: 'contain' }} />
    </div>
  );
}

export default TwitterPreview;
