import { useEffect, useState } from "react";

const TattooImg = (props: { file: File }) => {
  const [src, setSrc] = useState<string>();

  useEffect(() => {
    const reader = new FileReader();
    reader.readAsDataURL(props.file);
    reader.onload = (e) => {
      setSrc(e.target!.result as string);
    };
    // eslint-disable-next-line
  }, [props.file]);

  return <img src={src} />;
};

export default TattooImg;
