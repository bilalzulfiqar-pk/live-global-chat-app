import React, { useMemo } from "react";

const emojiOnlyRegex =
  /^(\s*(?:\p{Extended_Pictographic}|\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base})\s*)+$/u;
const countEmojiRegex = /\p{Extended_Pictographic}/gu;

function isEmojisOnly(text) {
  return emojiOnlyRegex.test(text);
}

const Message = React.memo(function Message({ msg, self }) {
  // Generate a color for each username based on a simple hash
  const getUserColor = (userName) => {
    const colors = [
      "text-red-500",
      "text-blue-500",
      "text-green-500",
      "text-yellow-500",
      "text-purple-500",
      "text-pink-500",
      "text-teal-500",
      "text-indigo-500",
    ];
    let hash = 0;
    for (let i = 0; i < userName.length; i++) {
      hash = userName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  if (msg.user === "System") {
    return (
      <div className="flex justify-center text-xs text-gray-400 py-2 mb-3">
        <span className="italic">{msg.text}</span>
      </div>
    );
  }

  // const isEmojisOnly = (text) => {
  //   const emojiOnlyRegex =
  //     /^(\s*(?:\p{Extended_Pictographic}|\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base})\s*)+$/u;
  //   return emojiOnlyRegex.test(text);
  // };

  // const isOnlyEmojis = isEmojisOnly(msg.text);
  // const emojiCount = isOnlyEmojis
  //   ? (msg.text.match(/\p{Extended_Pictographic}/gu) || []).length
  //   : 0;

  const { isOnlyEmojis, emojiCount } = useMemo(() => {
    const only = isEmojisOnly(msg.text);
    return {
      isOnlyEmojis: only,
      emojiCount: only ? (msg.text.match(countEmojiRegex) || []).length : 0,
    };
  }, [msg.text]);

  // console.log("Emoji Count: ", emojiCount);

  return (
    <div
      className={`flex flex-col ${
        self ? "items-end" : "items-start"
      } relative mb-4`}
    >
      <div
        className={`${
          emojiCount === 1 ? "p-0" : "px-4 py-3 shadow-md"
        } rounded-2xl max-w-[85vw] min-[400px]:max-w-xs min-[890px]:max-w-sm lg:max-w-md ${
          self
            ? `${
                emojiCount === 1 ? "" : "dark:bg-[#285BAF] bg-blue-500"
              } text-white rounded-br-none` //285BAF
            : `${
                emojiCount === 1 ? "" : "dark:bg-[#36517d] bg-[#c5dbffd9]"
              }  text-black dark:text-white rounded-bl-none` //36517d  2e4d80 467dac
        }`}
        style={{
          // boxShadow: "0 4px 8px rgba(0, 0, 0, 0.05)",
          transition: "all 0.2s ease",
        }}
      >
        {/* User's Name */}
        {!self && (
          <div
            className={`mb-1 font-semibold text-sm ${getUserColor(msg.user)}`}
          >
            {msg.user}
          </div>
        )}
        {/* Message Text */}
        {/* <div className="text-sm break-words">{msg.text}</div> */}
        <div
          className={`break-words ${
            isOnlyEmojis
              ? emojiCount === 1
                ? "text-7xl leading-[1.1] pb-[1px]"
                : emojiCount <= 6
                ? "text-3xl leading-[1.1]"
                : "text-base"
              : "text-base"
          }`}
        >
          {msg.text}
        </div>
        {/* Timestamp */}
        {/* {msg.time && (
          <div
            className={`text-xs mt-1 opacity-60 ${
              self ? "text-right" : "text-left"
            }`}
          >
            {msg.time}
          </div>
        )} */}
      </div>
      {msg.time && (
        <div
          className={`text-xs mt-1 text-black dark:text-white opacity-60 ${
            self ? "text-right" : "text-left"
          }`}
        >
          {msg.time}
        </div>
      )}
    </div>
  );
});

export default Message;
