import React, { useState } from "react";

export default function CommentSvg({onClick:openModal}) {
  const [color, setColor] = useState("");
  return (
    <svg
      cursor={"pointer"}
      aria-label="Comment"
      color={color}
      fill=""
      height="20"
      role="img"
      viewBox="0 0 24 24"
      width="20"
      onMouseEnter={() => setColor("rgb(29, 155, 240)")}
      onMouseLeave={() => setColor("")}
      onClick={openModal}
    >
      <title>Comment</title>
      <path
        d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      ></path>
    </svg>
  );
}
