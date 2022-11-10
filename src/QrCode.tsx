import { QRCodeErrorCorrectionLevel, toDataURL } from "qrcode";
import { MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import { ElementClickData } from "./shared";

export interface QrCodeProps {
  data: string;
  errorCorrectionLevel?: QRCodeErrorCorrectionLevel;
  scale?: number;
  onMouseDown?: (data: ElementClickData) => void;
  version?: number;
}

export function QrCode({
  data,
  errorCorrectionLevel,
  scale,
  onMouseDown,
  version,
}: QrCodeProps) {
  const ref = useRef<HTMLImageElement>(null);
  const [imageData, setImageData] = useState("");

  useEffect(() => {
    toDataURL(
      data,
      {
        errorCorrectionLevel,
        margin: 0,
        scale,
        version,
      },
      (err, data) => {
        if (!err) {
          setImageData(data);
        }
      }
    );
  }, [data, errorCorrectionLevel, scale, version]);

  const handleMouseDown = useCallback(
    (e: MouseEvent<HTMLImageElement>) => {
      if (!onMouseDown || !ref.current) {
        return;
      }

      const bounds = ref.current.getBoundingClientRect();

      onMouseDown({
        element: e.target as any,
        offset: {
          x: e.pageX - (bounds.x + window.scrollX),
          y: e.pageY - (bounds.y + window.scrollY),
        },
      });

      e.preventDefault();
      e.stopPropagation();
    },
    [onMouseDown]
  );

  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <img
      className="block absolute cursor-move"
      onMouseDown={handleMouseDown}
      ref={ref}
      src={imageData}
    />
  );
}
