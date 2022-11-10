import { uniqueId } from "lodash-es";
import { MouseEvent, useEffect, useRef, useState } from "react";
import { Barcode, BarcodeType, BarcodeTypes } from "./Barcode";
import deleteIcon from "./delete.svg";
import { QrCode } from "./QrCode";
import {
  ElementClickData,
  generateEAN13,
  generateICCID,
  generateIMEI,
  generateUPC,
} from "./shared";
import { styled } from "./styled";

const QR_CODE = "QR Code";
const TEXT = "Text";

const Button = styled(
  "button",
  "border bg-white border-gray-500 py-2 px-3 rounded disabled:text-gray-400 disabled:cursor-not-allowed"
);
const FieldGroup = styled("div", "flex flex-col");
const Input = styled("input", "border border-gray-500 p-2 rounded");
const Label = styled("label", "font-semibold text-sm");
const Select = styled("select", "border bg-white border-gray-500 rounded p-2");
const Separator = styled("hr", "my-5 border-1 border-gray-500");

type DrawingElement =
  | {
      type: typeof QR_CODE;
      data: string;
      key: string;
      scale: number;
    }
  | {
      type: typeof TEXT;
      data: string;
      height: number;
      key: string;
    }
  | {
      type: BarcodeType;
      data: string;
      key: string;
      moduleWidth: number;
      height: number;
    };

const AllElementTypes: DrawingElement["type"][] = [
  ...BarcodeTypes,
  QR_CODE,
  TEXT,
];

function App() {
  const dragging = useRef<ElementClickData>();
  const [gridSize, setGridSize] = useState(10);
  const [data, setData] = useState("");
  const [type, setType] = useState<DrawingElement["type"]>(BarcodeTypes[0]);
  const [height, setHeight] = useState(20);
  const [moduleWidth, setModuleWidth] = useState(2);
  const [elements, setElements] = useState<DrawingElement[]>([]);

  useEffect(() => {
    const onMouseUp = () => {
      dragging.current = undefined;
    };
    window.addEventListener("mouseup", onMouseUp);
    return () => window.removeEventListener("mouseup", onMouseUp);
  }, []);

  function addElement() {
    const key = uniqueId("id");

    switch (type) {
      case TEXT:
        setElements((curr) => [
          ...curr,
          { type: TEXT, key, data, height, x: 0, y: 0 },
        ]);
        break;

      case QR_CODE:
        setElements((curr) => [
          ...curr,
          { type: QR_CODE, key, data, scale: moduleWidth, x: 0, y: 0 },
        ]);
        break;

      default:
        setElements((curr) => [
          ...curr,
          { type: type, key, data, height, moduleWidth, x: 0, y: 0 },
        ]);
        break;
    }
  }

  function handleMouseDown(e: MouseEvent<HTMLDivElement>) {
    const bounds = e.currentTarget.getBoundingClientRect();

    dragging.current = {
      element: e.currentTarget,
      offset: {
        x: e.pageX - (bounds.x + window.scrollX),
        y: e.pageY - (bounds.y + window.scrollY),
      },
    };
  }

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!dragging.current) {
      return;
    }
    const dragInfo = dragging.current;
    const bounds = e.currentTarget.getBoundingClientRect();

    const x = e.pageX - (bounds.x - window.scrollX) - dragInfo.offset.x;
    const y = e.pageY - (bounds.y - window.scrollY) - dragInfo.offset.y;

    dragInfo.element.style.left = `${Math.round(x / gridSize) * gridSize}px`;
    dragInfo.element.style.top = `${Math.round(y / gridSize) * gridSize}px`;
  }

  return (
    <div className="h-screen flex">
      <div className="p-5 bg-gray-200 rounded flex flex-col gap-y-5 print:hidden w-[400px]">
        <div className="text-sm">
          Add text or barcode elements to the canvas and then move them around
          by clicking and dragging. You can also auto-generate some common
          formats.
        </div>
        <FieldGroup>
          <Label>Barcode format</Label>
          <Select
            onChange={(e) => setType(e.currentTarget.value as any)}
            value={type}
          >
            {AllElementTypes.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup>
          <Label>
            {type === TEXT ? "Text" : "Barcode"} contents ({data.length} chars)
          </Label>{" "}
          <Input
            className="w-full"
            onChange={(e) => setData(e.currentTarget.value)}
            value={data}
          />
          <div className="flex gap-x-1 mt-1">
            <Button className="grow" onClick={() => setData(generateIMEI())}>
              IMEI
            </Button>
            <Button className="grow" onClick={() => setData(generateICCID())}>
              ICCID
            </Button>
            <Button className="grow" onClick={() => setData(generateEAN13())}>
              EAN 13
            </Button>
            <Button className="grow" onClick={() => setData(generateUPC())}>
              UPC-A
            </Button>
          </div>
        </FieldGroup>
        {type !== QR_CODE && (
          <FieldGroup>
            <Label>{type === TEXT ? "Text" : "Barcode"} height (px)</Label>
            <Input
              type="number"
              onChange={(e) => setHeight(parseInt(e.currentTarget.value, 10))}
              value={`${height}`}
            />
          </FieldGroup>
        )}
        {type !== TEXT && (
          <FieldGroup>
            <Label>Barcode module width (px)</Label>
            <Input
              type="number"
              onChange={(e) =>
                setModuleWidth(parseFloat(e.currentTarget.value))
              }
              value={`${moduleWidth}`}
            />
          </FieldGroup>
        )}
        <Button onClick={addElement} disabled={!data}>
          Add {type === TEXT ? "text" : "barcode"}
        </Button>

        <Separator />

        <div className="flex flex-col grow overflow-y-auto overflow-x-hidden">
          {elements.map((el) => (
            <div className="flex">
              <div className="grow text-ellipsis overflow-hidden whitespace-nowrap">
                {el.type}: {el.data}
              </div>
              <img
                alt="delete"
                className="cursor-pointer"
                src={deleteIcon}
                onClick={() => {
                  setElements((curr) => curr.filter((x) => x.key !== el.key));
                }}
              />
            </div>
          ))}
        </div>

        <Separator />

        <FieldGroup>
          <Label>Snap grid ({gridSize}px)</Label>
          <input
            className="cursor-pointer"
            type="range"
            max={50}
            min={1}
            onChange={(e) => setGridSize(parseInt(e.currentTarget.value, 10))}
            value={gridSize}
          />
        </FieldGroup>

        <Button onClick={() => window.print()}>Print</Button>
      </div>
      <div
        className="relative grow overflow-hidden"
        onMouseMove={handleMouseMove}
      >
        {elements.map((el) =>
          el.type === QR_CODE ? (
            <QrCode
              key={el.key}
              data={el.data}
              scale={el.scale}
              onMouseDown={(e) => {
                dragging.current = e;
              }}
            />
          ) : el.type === TEXT ? (
            <div
              key={el.key}
              onMouseDown={handleMouseDown}
              className="cursor-move absolute"
            >
              <span style={{ fontSize: `${el.height}px` }}>{el.data}</span>
            </div>
          ) : (
            <Barcode
              {...el}
              onMouseDown={(e) => {
                dragging.current = e;
              }}
            />
          )
        )}
      </div>
    </div>
  );
}

export default App;
