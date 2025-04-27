// import { useState, useEffect } from "react";

// const THEMES = ["light", "dark", "system"];

// export default function ThemeToggle() {
//   const [theme, setTheme] = useState(() => localStorage.theme || "system");

//   useEffect(() => {
//     const root = document.documentElement;

//     const applyTheme = (mode) => {
//       if (mode === "light") {
//         root.classList.remove("dark");
//       } else if (mode === "dark") {
//         root.classList.add("dark");
//       } else {
//         const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
//         root.classList.toggle("dark", prefersDark);
//       }
//     };

//     applyTheme(theme);

//     if (theme === "system") {
//       localStorage.removeItem("theme");
//     } else {
//       localStorage.theme = theme;
//     }
//   }, [theme]);

//   // Update theme on system preference change
//   useEffect(() => {
//     const media = window.matchMedia("(prefers-color-scheme: dark)");

//     const handleChange = () => {
//       if (theme === "system") {
//         document.documentElement.classList.toggle("dark", media.matches);
//       }
//     };

//     media.addEventListener("change", handleChange);
//     return () => media.removeEventListener("change", handleChange);
//   }, [theme]);

//   const cycleTheme = () => {
//     const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
//     setTheme(next);
//   };

//   return (
//     <button
//       onClick={cycleTheme}
//       className="flex items-center w-30 cursor-pointer justify-center px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-medium shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
//     >
//       {theme === "light" && "🌞 Light"}
//       {theme === "dark" && "🌙 Dark"}
//       {theme === "system" && "🖥️ System"}
//     </button>
//   );

// }

// --------------------------------------------------------------------------

// ThemeToggle.jsx
// import { useState, useEffect } from "react";

// const THEMES = [
//   {
//     key: "light",
//     icon: (
//       <svg
//         className="w-5 h-5 stroke-current"
//         viewBox="0 0 24 24"
//         fill="none"
//         stroke="currentColor"
//         strokeWidth="1.5"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       >
//         <circle cx="12" cy="12" r="5" />
//         <path d="M12 1v2" />
//         <path d="M12 21v2" />
//         <path d="M4.22 4.22l1.42 1.42" />
//         <path d="M18.36 18.36l1.42 1.42" />
//         <path d="M1 12h2" />
//         <path d="M21 12h2" />
//         <path d="M4.22 19.78l1.42-1.42" />
//         <path d="M18.36 5.64l1.42-1.42" />
//       </svg>
//     ),
//   },
//   {
//     key: "system",
//     icon: (
//       <svg
//         className="w-5 h-5 stroke-current"
//         viewBox="0 0 24 24"
//         fill="none"
//         stroke="currentColor"
//         strokeWidth="1.5"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       >
//         <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
//         <path d="M8 21h8" />
//         <path d="M12 17v4" />
//       </svg>
//     ),
//   },
//   {
//     key: "dark",
//     icon: (
//       <svg
//         className="w-5 h-5 stroke-current"
//         viewBox="0 0 24 24"
//         fill="none"
//         stroke="currentColor"
//         strokeWidth="1.5"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       >
//         <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
//       </svg>
//     ),
//   },
// ];

// export default function ThemeToggle() {
//   const [theme, setTheme] = useState(() => localStorage.theme || "system");

//   useEffect(() => {
//     const root = document.documentElement;
//     if (theme === "light") root.classList.remove("dark");
//     else if (theme === "dark") root.classList.add("dark");
//     else {
//       const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
//       root.classList.toggle("dark", prefers);
//     }
//     theme === "system"
//       ? localStorage.removeItem("theme")
//       : (localStorage.theme = theme);
//   }, [theme]);

//   useEffect(() => {
//     const media = window.matchMedia("(prefers-color-scheme: dark)");
//     const listener = () => {
//       if (theme === "system") {
//         document.documentElement.classList.toggle("dark", media.matches);
//       }
//     };
//     media.addEventListener("change", listener);
//     return () => media.removeEventListener("change", listener);
//   }, [theme]);

//   return (
//     <div
//       role="radiogroup"
//       className="flex bg-gray-200 dark:bg-gray-700 space-x-0.5 rounded-full p-1"
//     >
//       {THEMES.map(({ key, icon }) => {
//         const isActive = key === theme;
//         return (
//           <button
//             key={key}
//             type="button"
//             role="radio"
//             aria-label={`Switch to ${key} theme`}
//             aria-checked={isActive}
//             onClick={() => setTheme(key)}
//             className={
//               `w-8 h-8 flex items-center cursor-pointer justify-center rounded-full transition-colors duration-200 ` +
//               (isActive
//                 ? "bg-blue-600 text-white" /* active background + icon */
//                 : "text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600")
//             }
//           >
//             {icon}
//           </button>
//         );
//       })}
//     </div>
//   );
// }

// --------------------------------------

// ThemeToggle.jsx
import { useState, useEffect } from "react";

const THEMES = [
  {
    key: "light",
    icon: (
      <svg
        className="w-5 h-5 stroke-current"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2" />
        <path d="M12 21v2" />
        <path d="M4.22 4.22l1.42 1.42" />
        <path d="M18.36 18.36l1.42 1.42" />
        <path d="M1 12h2" />
        <path d="M21 12h2" />
        <path d="M4.22 19.78l1.42-1.42" />
        <path d="M18.36 5.64l1.42-1.42" />
      </svg>
    ),
  },
  {
    key: "system",
    icon: (
      <svg
        className="w-5 h-5 stroke-current"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <path d="M8 21h8" />
        <path d="M12 17v4" />
      </svg>
    ),
  },
  {
    key: "dark",
    icon: (
      <svg
        className="w-5 h-5 stroke-current"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
    ),
  },
];

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => localStorage.theme || "system");
  const selectedIndex = THEMES.findIndex((t) => t.key === theme);

  useEffect(() => {
    const root = document.documentElement;
    let appliedTheme;

    if (theme === "light") {
      root.classList.remove("dark");
      appliedTheme = "light";
    } else if (theme === "dark") {
      root.classList.add("dark");
      appliedTheme = "dark";
    } else {
      const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", prefers);
      appliedTheme = prefers ? "dark" : "light";
    }

    theme === "system"
      ? localStorage.removeItem("theme")
      : (localStorage.theme = theme);

    // ▶️ fire a global event with the actual mode
    window.dispatchEvent(
      new CustomEvent("themeChange", { detail: appliedTheme })
    );
  }, [theme]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => {
      if (theme === "system") {
        document.documentElement.classList.toggle("dark", media.matches);
      }
    };
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [theme]);

  // Size & gap constants
  const btnSize = 32; // in px (w-8)
  const gap = 2; // in px (gap-0.5)

  return (
    <div
      role="radiogroup"
      className="relative flex bg-gray-200 dark:bg-gray-700 gap-0.5 rounded-full p-1"
      style={{ padding: 4 }} // ensure consistent 4px padding
    >
      {/* Sliding indicator */}
      <div
        className="absolute bg-blue-600 rounded-full transition-transform duration-200"
        style={{
          width: btnSize,
          height: btnSize,
          transform: `translateX(${selectedIndex * (btnSize + gap)}px)`,
          top: 4, // match padding
          left: 4,
        }}
      />

      {/* Buttons */}
      {THEMES.map(({ key, icon }) => {
        const isActive = key === theme;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-label={`Switch to ${key} theme`}
            aria-checked={isActive}
            onClick={() => setTheme(key)}
            className="relative z-10 w-8 h-8 flex items-center justify-center"
          >
            <span
              className={
                `flex items-center justify-center cursor-pointer w-full h-full transition-colors rounded-full duration-200 ` +
                (isActive ? "text-white" : "text-gray-600 dark:text-gray-300") // Can also use hover:bg-gray-300 dark:hover:bg-gray-600
              }
            >
              {icon}
            </span>
          </button>
        );
      })}
    </div>
  );
}
