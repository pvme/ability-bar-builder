import html2canvas from "html2canvas";

function waitForImages(root: HTMLElement) {
  const imgs = Array.from(root.querySelectorAll("img"));
  return Promise.all(
    imgs.map(
      (img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              img.addEventListener("load", () => resolve(), { once: true });
              img.addEventListener("error", () => resolve(), { once: true });
            })
    )
  );
}

export const exportAsImage = async (
  element: HTMLElement | null,
  imageFileName: string
): Promise<void> => {
  if (!element) return;

  // IMPORTANT:
  // For remote images to be exportable, those <img> tags must have:
  //   crossOrigin="anonymous"
  // and the image host must send:
  //   Access-Control-Allow-Origin: *   (or your domain)
  await waitForImages(element);

  const html = document.documentElement;
  const body = document.body;

  const prevHtmlWidth = html.style.width;
  const prevBodyWidth = body.style.width;
  const prevHtmlOverflow = html.style.overflow;
  const prevBodyOverflow = body.style.overflow;

  try {
    // If your element uses scrollable containers, this helps ensure full render.
    const extraWidth = Math.max(0, element.scrollWidth - element.clientWidth);
    if (extraWidth > 0) {
      html.style.width = `${html.clientWidth + extraWidth}px`;
      body.style.width = `${body.clientWidth + extraWidth}px`;
    }

    // Reduce the chance of scrollbars affecting layout during capture.
    html.style.overflow = "visible";
    body.style.overflow = "visible";

    const canvas = await html2canvas(element, {
      useCORS: true,
      allowTaint: false,
      backgroundColor: null, // keep transparency; set to "#fff" if you want white background
      scale: window.devicePixelRatio || 1,
      // Helps when the element is within a scrolled page
      scrollX: -window.scrollX,
      scrollY: -window.scrollY,
      // If your images are CSS background-image urls, turn this on too
      // (still requires CORS headers from the host)
      // logging: true,
    });

    const dataUrl = canvas.toDataURL("image/png", 1.0);
    downloadDataUrl(dataUrl, imageFileName.endsWith(".png") ? imageFileName : `${imageFileName}.png`);
  } catch (err) {
    console.error("exportAsImage failed:", err);
    throw err;
  } finally {
    html.style.width = prevHtmlWidth;
    body.style.width = prevBodyWidth;
    html.style.overflow = prevHtmlOverflow;
    body.style.overflow = prevBodyOverflow;
  }
};

const downloadDataUrl = (dataUrl: string, fileName: string) => {
  const a = document.createElement("a");
  a.style.display = "none";
  a.download = fileName;
  a.href = dataUrl;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};