"use client";

import { useSidebar } from "@/context/SidebarContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function UserSidebar() {
  const { isExpanded, toggleSidebar, isHovered, setIsHovered, isMobileOpen, toggleMobileSidebar } =
    useSidebar();
  const pathname = usePathname();

  const userMenuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: (
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.99998 1.04163C5.02498 1.04163 1.04163 5.02498 1.04163 9.99998C1.04163 14.975 5.02498 18.9583 9.99998 18.9583C14.975 18.9583 18.9583 14.975 18.9583 9.99998C18.9583 5.02498 14.975 1.04163 9.99998 1.04163ZM9.99998 17.2916C5.89581 17.2916 2.70831 14.1041 2.70831 9.99998C2.70831 5.89581 5.89581 2.70831 9.99998 2.70831C14.1041 2.70831 17.2916 5.89581 17.2916 9.99998C17.2916 14.1041 14.1041 17.2916 9.99998 17.2916Z" />
          <path d="M10.8333 9.99998V5.83331H9.16665V11.6666H14.1666V9.99998H10.8333Z" />
        </svg>
      ),
    },
    {
      name: "Profile",
      path: "/profile",
      icon: (
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0ZM10 5C11.3807 5 12.5 6.11929 12.5 7.5C12.5 8.88071 11.3807 10 10 10C8.61929 10 7.5 8.88071 7.5 7.5C7.5 6.11929 8.61929 5 10 5ZM10 17C7.5 17 5.29 15.7925 4 13.9C4.025 11.975 8 10.9 10 10.9C11.995 10.9 15.975 11.975 16 13.9C14.71 15.7925 12.5 17 10 17Z" />
        </svg>
      ),
    },
    {
      name: "Settings",
      path: "/settings",
      icon: (
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.4291 8.99998H16.0541C15.9166 8.47498 15.7041 7.97498 15.4416 7.52498L16.4041 6.56248C16.7041 6.26248 16.7041 5.76248 16.4041 5.46248L14.5541 3.61248C14.2541 3.31248 13.7541 3.31248 13.4541 3.61248L12.4916 4.57498C12.0416 4.31248 11.5416 4.09998 11.0166 3.96248V2.58748C11.0166 2.16248 10.6791 1.83748 10.2541 1.83748H7.76659C7.34159 1.83748 7.00409 2.17498 7.00409 2.58748V3.96248C6.47909 4.09998 5.97909 4.31248 5.52909 4.57498L4.56659 3.61248C4.26659 3.31248 3.76659 3.31248 3.46659 3.61248L1.61659 5.46248C1.31659 5.76248 1.31659 6.26248 1.61659 6.56248L2.57909 7.52498C2.31659 7.97498 2.10409 8.47498 1.96659 8.99998H0.591589C0.166589 8.99998 -0.158411 9.33748 -0.158411 9.74998V12.2375C-0.158411 12.6625 0.178839 12.9875 0.591589 12.9875H1.96659C2.10409 13.5125 2.31659 14.0125 2.57909 14.4625L1.61659 15.425C1.31659 15.725 1.31659 16.225 1.61659 16.525L3.46659 18.375C3.76659 18.675 4.26659 18.675 4.56659 18.375L5.52909 17.4125C5.97909 17.675 6.47909 17.8875 7.00409 18.025V19.4C7.00409 19.825 7.34159 20.15 7.76659 20.15H10.2541C10.6791 20.15 11.0041 19.8125 11.0041 19.4V18.025C11.5291 17.8875 12.0291 17.675 12.4791 17.4125L13.4416 18.375C13.7416 18.675 14.2416 18.675 14.5416 18.375L16.3916 16.525C16.6916 16.225 16.6916 15.725 16.3916 15.425L15.4291 14.4625C15.6916 14.0125 15.9041 13.5125 16.0416 12.9875H17.4166C17.8416 12.9875 18.1666 12.65 18.1666 12.2375V9.74998C18.1791 9.32498 17.8416 8.99998 17.4291 8.99998ZM9.01659 13.7875C7.16659 13.7875 5.65409 12.275 5.65409 10.425C5.65409 8.57498 7.16659 7.06248 9.01659 7.06248C10.8666 7.06248 12.3791 8.57498 12.3791 10.425C12.3791 12.275 10.8666 13.7875 9.01659 13.7875Z" />
        </svg>
      ),
    },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex-col justify-between bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 ${
        isExpanded || isHovered ? "w-[290px]" : "w-[90px]"
      } hidden lg:flex`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => !isExpanded && setIsHovered(false)}
    >
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">U</span>
            </div>
            {(isExpanded || isHovered) && (
              <span className="text-lg font-semibold text-gray-800 dark:text-white whitespace-nowrap">
                User Portal
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <ul className="space-y-2">
            {userMenuItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {(isExpanded || isHovered) && (
                    <span className="whitespace-nowrap">{item.name}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Toggle Button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center w-full p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <svg
              className={`w-5 h-5 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
