export default function Message({ msg, self }) {
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
      <div className="flex justify-center text-xs text-gray-400 py-2">
        <span className="italic">{msg.text}</span>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col ${
        self ? "items-end" : "items-start"
      } relative mb-4`}
    >
      <div
        className={`px-4 py-3 rounded-2xl shadow-md max-w-xs ${
          self
            ? "dark:bg-[#285BAF] bg-blue-500 text-white rounded-br-none" //285BAF
            : "dark:bg-[#36517d] bg-[#c5dbffd9]  text-black dark:text-white rounded-bl-none" //36517d  2e4d80 467dac
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
        <div className="text-sm break-words">{msg.text}</div>
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
}
