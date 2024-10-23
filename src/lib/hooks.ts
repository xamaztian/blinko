import { useEffect, useState } from "react";

const usePasteFile = (targetRef) => {
  const [pastedFiles, setPastedFiles] = useState([]);

  useEffect(() => {
    const handlePaste = (event) => {
      //@ts-ignore
      const clipboardData = event.clipboardData || window.clipboardData;
      const items = clipboardData.items;
      let files = [];

      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === "file") {
          const file = items[i].getAsFile();
          //@ts-ignore
          files.push(file);
        }
      }

      if (files.length > 0) {
        setPastedFiles(files);
      }
    };

    const targetElement = targetRef.current;

    if (targetElement) {
      targetElement.addEventListener("paste", handlePaste);
    }

    return () => {
      if (targetElement) {
        targetElement.removeEventListener("paste", handlePaste);
      }
    };
  }, [targetRef]);

  return pastedFiles;
};

export default usePasteFile;
