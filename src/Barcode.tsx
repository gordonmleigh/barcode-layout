import * as barcode from "bardcode";
import {
  MouseEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ElementClickData } from "./shared";

export const BarcodeTypes = [
  "Code 128",
  "GS1 128",
  "Codabar",
  "Code 39",
  "EAN-8",
  "EAN-13",
  "FIM",
  "ITF",
  "UPC-A",
] as const;

export type BarcodeType = typeof BarcodeTypes extends readonly (infer E)[]
  ? E
  : never;

export interface BarcodeProps {
  data: string;
  height: number;
  moduleWidth?: number;
  onMouseDown?: (data: ElementClickData) => void;
  type?: BarcodeType;
}

export function Barcode({
  data,
  height,
  moduleWidth,
  onMouseDown,
  type,
}: BarcodeProps) {
  const ref = useRef<SVGSVGElement>(null);
  const [path, setPath] = useState("");
  const [error, setError] = useState<string>();

  useEffect(() => {
    try {
      setError(undefined);
      const path = barcode.drawBarcode("path", data, {
        hasChecksum:
          (type === "UPC-A" && data.length === 12) ||
          (type === "EAN-13" && data.length === 13) ||
          (type === "EAN-8" && data.length === 8),
        height,
        moduleWidth,
        quietZoneSize: 0,
        type,
      });
      setPath(path);
    } catch (err: any) {
      setError(err?.message || "unknown error");
    }
  }, [data, height, moduleWidth, type]);

  useLayoutEffect(() => {
    const svg = ref.current;
    if (!svg) {
      return;
    }

    const bounds = svg.getBBox();
    svg.setAttribute(
      "viewBox",
      `${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`
    );
    svg.setAttribute("width", `${bounds.width}`);
    svg.setAttribute("height", `${bounds.height}`);
  }, [error, path]);

  const handleMouseDown = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      if (!onMouseDown || !ref.current) {
        return;
      }

      const bounds = ref.current.getBoundingClientRect();

      onMouseDown({
        element: e.currentTarget as any,
        offset: {
          x: e.pageX - (bounds.x + window.scrollX),
          y: e.pageY - (bounds.y + window.scrollY),
        },
      });
    },
    [onMouseDown]
  );

  return (
    <svg
      ref={ref}
      className="cursor-move absolute"
      onMouseDown={handleMouseDown}
    >
      {error ? <text>{error}</text> : <path d={path} />}
    </svg>
  );
}
