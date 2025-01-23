import { useState } from "react";
const useImagePreview = () => {
  const [imageUrl, setImageUrl] = useState(null);
  const handleImageChange = (e) => {
    const image = e.target.files[0];
    const imageReader = new FileReader();
    imageReader.onloadend = () => {
      setImageUrl(imageReader.result);
    };
    imageReader.readAsDataURL(image);
  };
  return { handleImageChange, imageUrl };
};

export default useImagePreview;
